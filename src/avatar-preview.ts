import {
  avatarLook,
  drawCharacter,
  drawPerson,
  drawRoom,
  personLook,
} from "./sprites";
import type { AvatarFacing } from "./sprites";
import {
  drawStorybookPet,
  warmStorybookPetAtlases,
  type PetFacing,
} from "./storybook-pets";
import {
  drawOccupationCharacter,
  OCCUPATION_HERITAGES,
  OCCUPATION_UNIFORMS,
  warmOccupationCharacterAtlases,
  type OccupationFacing,
} from "./occupation-characters";
import type {
  CharacterAppearanceId,
  Gender,
  HeritageStyle,
  JobUniform,
  PersonKind,
  Stage,
  UpperSceneKind,
} from "./types";
import {
  PERSON_REACTION_SECONDS,
  interactionExpressionsAt,
} from "./character-interactions";
import { STAGES } from "./stages";
import {
  ROOM_LANDSCAPE,
  ROOM_PORTRAIT,
  familyFloorY,
  roomZoneGeometry,
  type RoomDimensions,
} from "./background-layout";

const maybeCanvas = document.getElementById("preview");
if (!(maybeCanvas instanceof HTMLCanvasElement)) {
  throw new Error("Avatar preview canvas is missing.");
}

const canvas = maybeCanvas;
const maybeCtx = canvas.getContext("2d");
if (!maybeCtx) {
  throw new Error("Avatar preview canvas context is missing.");
}

const ctx = maybeCtx;
const width = 1600;
const height = 1000;
const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));

canvas.width = width * dpr;
canvas.height = height * dpr;
ctx.scale(dpr, dpr);
ctx.imageSmoothingEnabled = true;

const stages = [
  "newborn",
  "toddler",
  "early",
  "elementary",
  "middle",
  "high",
  "university",
  "career",
  "marriage",
  "midlife",
  "senior",
  "retirement",
];
const searchParams = new URLSearchParams(location.search);
const requestedAppearance: CharacterAppearanceId =
  searchParams.get("variant") === "alternate"
    ? "alternate"
    : "classic";
const firstColumnX = 162;
const columnGap = 118;

function label(text: string, x: number, y: number, align: CanvasTextAlign = "center"): void {
  ctx.save();
  ctx.font = "18px Arial";
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 4;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function lane(y: number, title: string): void {
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(34, y - 132, width - 68, 164);
  label(title, 50, y - 154, "left");
}

function drawHeader(): void {
  ctx.fillStyle = "#7fd8ff";
  ctx.fillRect(0, 0, width, 72);
  ctx.fillStyle = "#172738";
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Avatar Preview: life-stage body shapes, faces, and movement", 36, 42);
}

function drawPlayerRow(rowY: number, gender: Gender): void {
  stages.forEach((name, i) => {
    const x = firstColumnX + i * columnGap;
    if (rowY < 340) label(name, x, 98);
    drawCharacter(ctx, x, rowY, avatarLook(i, gender), i * 0.68, {
      moving: i > 0,
      facing: "front",
      verticalBias: 0,
    });
  });
}

function drawNpcRow(rowY: number): void {
  const people: PersonKind[] = [
    "mother",
    "father",
    "grandma",
    "grandpa",
    "sibling",
    "playmate",
    "studyFriend",
    "bestFriend",
    "crush",
    "coworker",
    "boss",
    "oldFriend",
  ];

  people.forEach((kind, i) => {
    const x = firstColumnX + i * columnGap;
    const stageIndex = kind === "grandma" || kind === "grandpa" || kind === "oldFriend" ? 10 : 7;
    drawCharacter(ctx, x, rowY, personLook(kind, "male", stageIndex), i * 0.7, {
      moving: i % 2 === 0,
      facing: "front",
      verticalBias: 0,
    });
    label(kind, x, rowY + 48);
  });
}

function drawMovementRow(rowY: number): void {
  const facings: AvatarFacing[] = ["left", "right", "back", "front"];
  stages.slice(1).forEach((name, i) => {
    const x = firstColumnX + i * columnGap;
    const facing = facings[i % facings.length];
    const gender: Gender = i % 3 === 0 ? "female" : "male";
    drawCharacter(ctx, x, rowY, avatarLook(i + 1, gender), 1.9 + i * 0.6, {
      moving: true,
      facing,
      verticalBias: facing === "back" ? -1 : facing === "front" ? 1 : 0,
    });
    label(`${name} ${facing}`, x, rowY + 48);
  });
}

// ?zoom draws a handful of figures at 3x so proportions and faces can be
// inspected closely; the default view is the full life-stage sheet.
// ?face renders heads only, at 8x, for reviewing facial features.
function renderFaces(): void {
  const scale = 8;
  ctx.fillStyle = "#26384a";
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.scale(scale, scale);
  const faces: { look: ReturnType<typeof avatarLook>; facing: AvatarFacing; name: string }[] = location.search.includes("prof")
    ? [
        { look: avatarLook(7, "male"), facing: "right", name: "man R" },
        { look: avatarLook(7, "male"), facing: "left", name: "man L" },
        { look: avatarLook(7, "female"), facing: "back", name: "woman back" },
        { look: avatarLook(3, "male"), facing: "right", name: "boy R" },
      ]
    : [
        { look: avatarLook(7, "female"), facing: "front", name: "woman" },
        { look: avatarLook(7, "male"), facing: "front", name: "man" },
        { look: avatarLook(7, "female"), facing: "right", name: "woman side" },
        { look: avatarLook(7, "male"), facing: "back", name: "man back" },
      ];
  faces.forEach((f, i) => {
    drawCharacter(ctx, 28 + i * 48, 186, f.look, 0, { moving: false, facing: f.facing, verticalBias: 0 });
  });
  ctx.restore();
  faces.forEach((f, i) => label(f.name, (28 + i * 48) * scale, 58 * scale));
}

function renderZoom(): void {
  const scale = location.search.includes("side") ? 4.4 : 3;
  ctx.fillStyle = "#26384a";
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.scale(scale, scale);
  const cases: { look: ReturnType<typeof avatarLook>; facing: AvatarFacing; name: string }[] = location.search.includes("side")
    ? [
        { look: avatarLook(7, "male"), facing: "right", name: "man side" },
        { look: avatarLook(7, "female"), facing: "right", name: "woman side" },
        { look: avatarLook(3, "male"), facing: "left", name: "boy side" },
      ]
    : location.search.includes("back")
    ? [
        { look: avatarLook(7, "male"), facing: "back", name: "man back" },
        { look: avatarLook(7, "female"), facing: "back", name: "woman back" },
        { look: avatarLook(11, "male"), facing: "front", name: "elder" },
        { look: avatarLook(1, "male"), facing: "front", name: "toddler" },
        { look: avatarLook(5, "male"), facing: "front", name: "teen boy" },
      ]
    : [
        { look: avatarLook(7, "male"), facing: "front", name: "man front" },
        { look: avatarLook(7, "female"), facing: "front", name: "woman front" },
        { look: avatarLook(7, "male"), facing: "right", name: "man side" },
        { look: avatarLook(5, "female"), facing: "front", name: "teen girl" },
        { look: avatarLook(3, "male"), facing: "front", name: "boy" },
      ];
  const footY = location.search.includes("side") ? 205 : 300;
  const step = location.search.includes("side") ? 115 : 100;
  const colX = (i: number): number => 62 + i * step;
  cases.forEach((c, i) => {
    drawCharacter(ctx, colX(i), footY, c.look, i * 0.9, { moving: i % 2 === 1, facing: c.facing, verticalBias: 0 });
  });
  ctx.restore();
  cases.forEach((c, i) => {
    label(c.name, colX(i) * scale, (footY + 20) * scale);
  });
}

function renderMatrix(): void {
  ctx.fillStyle = "#26384a";
  ctx.fillRect(0, 0, width, height);
  drawHeader();
  const heritages: { id: HeritageStyle; label: string }[] = [
    { id: "western", label: "Western" },
    { id: "asian", label: "Asian" },
    { id: "middleEastern", label: "Middle Eastern" },
    { id: "black", label: "Black / African diaspora" },
  ];
  const cases: {
    stage: number;
    gender: Gender;
    facing: AvatarFacing;
    moving: boolean;
    pose?: "stand" | "sit";
    label: string;
  }[] = [
    { stage: 0, gender: "female", facing: "right", moving: true, label: "girl · baby" },
    { stage: 3, gender: "male", facing: "left", moving: true, label: "boy · child" },
    { stage: 4, gender: "male", facing: "front", moving: false, label: "boy · middle" },
    { stage: 5, gender: "female", facing: "right", moving: true, label: "girl · high" },
    { stage: 6, gender: "female", facing: "front", moving: false, label: "woman · university" },
    { stage: 7, gender: "male", facing: "left", moving: true, label: "man · career" },
    { stage: 9, gender: "male", facing: "back", moving: false, label: "man · midlife" },
    { stage: 10, gender: "female", facing: "front", moving: false, label: "woman · elder" },
  ];

  heritages.forEach((heritage, row) => {
    const footY = 255 + row * 225;
    lane(footY, heritage.label);
    cases.forEach((entry, column) => {
      const x = 105 + column * 198;
      drawCharacter(ctx, x, footY, avatarLook(
        entry.stage,
        entry.gender,
        heritage.id,
        requestedAppearance
      ), column * 0.85, {
        moving: entry.moving,
        facing: entry.facing,
        verticalBias: 0,
        pose: entry.pose,
      });
      label(entry.label, x, footY + 42);
    });
  });
}

/**
 * Compare the two complete player/NPC identities without mixing gender sheets.
 * Use `?variants&stage=0..11` to inspect a particular life stage.
 */
function renderVariants(): void {
  ctx.fillStyle = "#26384a";
  ctx.fillRect(0, 0, width, height);
  drawHeader();
  const rawStageValue = searchParams.get("stage");
  const stageValue =
    rawStageValue === null ? Number.NaN : Number(rawStageValue);
  const stage =
    Number.isInteger(stageValue) &&
    stageValue >= 0 &&
    stageValue < stages.length
      ? stageValue
      : 5;
  const heritages: { id: HeritageStyle; label: string }[] = [
    { id: "western", label: "Western" },
    { id: "asian", label: "Asian" },
    { id: "middleEastern", label: "Middle Eastern" },
    { id: "black", label: "Black / African diaspora" },
  ];
  const entries: {
    gender: Gender;
    appearance: CharacterAppearanceId;
    facing: AvatarFacing;
  }[] = [];
  for (const gender of ["male", "female"] as const) {
    for (const appearance of ["classic", "alternate"] as const) {
      entries.push(
        { gender, appearance, facing: "front" },
        { gender, appearance, facing: "right" }
      );
    }
  }

  label(
    `Appearance comparison · ${stages[stage]} · male and female atlases remain separate`,
    width / 2,
    102
  );
  heritages.forEach((heritage, row) => {
    const footY = 260 + row * 220;
    lane(footY, heritage.label);
    entries.forEach((entry, column) => {
      const x = 110 + column * 195;
      drawCharacter(
        ctx,
        x,
        footY,
        avatarLook(
          stage,
          entry.gender,
          heritage.id,
          entry.appearance
        ),
        1.2,
        {
          moving: entry.facing !== "front",
          facing: entry.facing,
          verticalBias: 0,
        }
      );
      label(
        `${entry.gender === "female" ? "girl" : "boy"} · ${
          entry.appearance === "alternate" ? "new" : "classic"
        } · ${entry.facing}`,
        x,
        footY + 46
      );
    });
  });
}

function renderMotion(now: number): void {
  ctx.fillStyle = "#26384a";
  ctx.fillRect(0, 0, width, height);
  drawHeader();
  const heritages: { id: HeritageStyle; label: string }[] = [
    { id: "western", label: "Western" },
    { id: "asian", label: "Asian" },
    { id: "middleEastern", label: "Middle Eastern" },
    { id: "black", label: "Black / African diaspora" },
  ];
  const representativeStages = [0, 1, 4, 5, 6, 7, 9, 10];
  const requestedStageValue = new URLSearchParams(
    location.search
  ).get("stage");
  const requestedStage =
    requestedStageValue === null
      ? Number.NaN
      : Number(requestedStageValue);
  const fixedStage =
    Number.isInteger(requestedStage) &&
    requestedStage >= 0 &&
    requestedStage < stages.length
      ? requestedStage
      : null;
  const ageIndex = fixedStage === null
    ? Math.floor(now / 2600) % representativeStages.length
    : representativeStages.indexOf(fixedStage);
  const stage =
    fixedStage ?? representativeStages[ageIndex];
  const ageLabel = [
    "baby",
    "child",
    "early teen",
    "teen",
    "young adult",
    "adult",
    "middle age",
    "elder",
  ][ageIndex] ?? stages[stage];
  const facings: AvatarFacing[] = [
    "front",
    "left",
    "back",
    "right",
  ];
  const phase = now / 100;

  label(
    `Animated motion review · ${ageLabel} · male and female kept separate`,
    width / 2,
    102
  );
  heritages.forEach((heritage, row) => {
    const footY = 260 + row * 220;
    lane(footY, heritage.label);
    (["male", "female"] as const).forEach((gender, genderIndex) => {
      const groupStart = genderIndex === 0 ? 115 : 895;
      facings.forEach((facing, facingIndex) => {
        const x = groupStart + facingIndex * 145;
        drawCharacter(
          ctx,
          x,
          footY,
          avatarLook(
            stage,
            gender,
            heritage.id,
            requestedAppearance
          ),
          phase,
          { moving: true, facing, verticalBias: 0 }
        );
        label(`${gender} ${facing}`, x, footY + 46);
      });
      const seatedX = groupStart + 4 * 145;
      drawCharacter(
        ctx,
        seatedX,
        footY,
        avatarLook(
          stage,
          gender,
          heritage.id,
          requestedAppearance
        ),
        phase,
        {
          moving: false,
          facing: "front",
          verticalBias: 0,
          pose: "sit",
        }
      );
      label(`${gender} seated`, seatedX, footY + 46);
    });
  });
}

function renderPets(now: number): void {
  ctx.fillStyle = "#26384a";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#7fd8ff";
  ctx.fillRect(0, 0, width, 86);
  ctx.fillStyle = "#172738";
  ctx.font = "bold 29px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Pet Preview: four directions, two walk beats, and real sitting", 36, 34);
  ctx.font = "16px Arial";
  ctx.fillText(
    "Dog and cat are independent atlases · 1.8× inspection grid · animated samples at gameplay size",
    36,
    66
  );

  const facings: PetFacing[] = ["front", "left", "back", "right"];
  const states = [
    { label: "idle", moving: false, phase: 0, sitting: false },
    { label: "walk A", moving: true, phase: 0, sitting: false },
    { label: "walk B", moving: true, phase: Math.PI, sitting: false },
    { label: "seated", moving: false, phase: 0, sitting: true },
  ] as const;
  const species = [
    { kind: "dog", title: "Caramel puppy" },
    { kind: "cat", title: "Slate-blue kitten" },
  ] as const;
  const columnX = [215, 555, 895, 1235];

  species.forEach((entry, speciesIndex) => {
    const top = 112 + speciesIndex * 430;
    ctx.fillStyle =
      speciesIndex === 0
        ? "rgba(244,190,69,0.10)"
        : "rgba(127,216,255,0.09)";
    ctx.fillRect(34, top - 18, width - 68, 410);
    label(entry.title, 54, top, "left");

    facings.forEach((facing, column) => {
      label(facing, columnX[column], top + 28);
      states.forEach((state, row) => {
        const footY = top + 130 + row * 86;
        ctx.save();
        ctx.translate(columnX[column], footY);
        ctx.scale(1.8, 1.8);
        drawStorybookPet(ctx, 0, 0, entry.kind, {
          facing,
          moving: state.moving,
          phase: state.phase,
          sitting: state.sitting,
        });
        ctx.restore();
        if (column === 0) {
          label(state.label, 92, footY - 12, "left");
        }
      });
    });

    const animatedX = 1490;
    const animatedY = top + 116;
    drawStorybookPet(ctx, animatedX, animatedY, entry.kind, {
      facing: facings[Math.floor(now / 1800) % facings.length],
      moving: true,
      phase: now / 160,
    });
    label("1×", animatedX, animatedY + 42);
  });
}

const occupationLabels: Record<JobUniform, string> = {
  doctor: "Doctor · middle age",
  trainer: "Fitness trainer · adult",
  dancer: "Professional dancer · adult",
  soldier: "Army soldier · adult",
  farmer: "Farmer · middle age",
};

const occupationIdentities: {
  heritage: (typeof OCCUPATION_HERITAGES)[number];
  gender: Gender;
  label: string;
}[] = [
  { heritage: "western", gender: "male", label: "Western male" },
  { heritage: "western", gender: "female", label: "Western female" },
  { heritage: "asian", gender: "male", label: "Asian male" },
  { heritage: "asian", gender: "female", label: "Asian female" },
];

function requestedOccupation(): JobUniform | null {
  const requested = searchParams.get("job");
  return OCCUPATION_UNIFORMS.includes(
    requested as (typeof OCCUPATION_UNIFORMS)[number]
  )
    ? (requested as JobUniform)
    : null;
}

function drawOccupationPreviewHeader(detail?: JobUniform): void {
  ctx.fillStyle = "#7fd8ff";
  ctx.fillRect(0, 0, width, 92);
  ctx.fillStyle = "#172738";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "bold 29px Arial";
  ctx.fillText(
    detail
      ? `Occupation motion review · ${occupationLabels[detail]}`
      : "Occupation cast · Asian and Western adults",
    36,
    34
  );
  ctx.font = "16px Arial";
  ctx.fillText(
    detail
      ? "Four neutral directions + four real walking poses · male and female remain separate"
      : "Doctor, trainer, dancer, army, and farmer · front neutral + walking sample",
    36,
    68
  );
}

function renderOccupationOverview(now: number): void {
  ctx.fillStyle = "#26384a";
  ctx.fillRect(0, 0, width, height);
  drawOccupationPreviewHeader();
  const rowTop = 260;
  const rowGap = 175;

  occupationIdentities.forEach((identity, identityIndex) => {
    const groupX = 300 + identityIndex * 350;
    label(identity.label, groupX + 12, 112);
  });

  OCCUPATION_UNIFORMS.forEach((uniform, row) => {
    const footY = rowTop + row * rowGap;
    label(occupationLabels[uniform], 30, footY - 76, "left");
    occupationIdentities.forEach((identity, identityIndex) => {
      const groupX = 300 + identityIndex * 350;
      drawOccupationCharacter(
        ctx,
        groupX - 48,
        footY,
        uniform,
        identity.heritage,
        identity.gender,
        { facing: "front", size: 132 }
      );
      drawOccupationCharacter(
        ctx,
        groupX + 72,
        footY,
        uniform,
        identity.heritage,
        identity.gender,
        {
          facing: "right",
          moving: true,
          phase: now / 170,
          size: 132,
        }
      );
    });
  });
}

function renderOccupationDetail(
  _now: number,
  uniform: JobUniform
): void {
  ctx.fillStyle = "#26384a";
  ctx.fillRect(0, 0, width, height);
  drawOccupationPreviewHeader(uniform);
  const facings: OccupationFacing[] = [
    "front",
    "left",
    "back",
    "right",
  ];
  const columnX = [
    125, 315, 505, 695, 895, 1085, 1275, 1465,
  ];
  const topLabels = [
    "front neutral",
    "left neutral",
    "back neutral",
    "right neutral",
    "front step",
    "left step",
    "back step",
    "right step",
  ];
  topLabels.forEach((text, column) => {
    label(text, columnX[column], 118);
  });

  occupationIdentities.forEach((identity, row) => {
    const footY = 300 + row * 210;
    lane(footY, identity.label);
    facings.forEach((facing, column) => {
      drawOccupationCharacter(
        ctx,
        columnX[column],
        footY,
        uniform,
        identity.heritage,
        identity.gender,
        { facing, size: 148 }
      );
      drawOccupationCharacter(
        ctx,
        columnX[column + 4],
        footY,
        uniform,
        identity.heritage,
        identity.gender,
        {
          facing,
          moving: true,
          phase: 1,
          size: 148,
        }
      );
    });
  });
}

function renderOccupations(now: number): void {
  const detail = requestedOccupation();
  if (detail) renderOccupationDetail(now, detail);
  else renderOccupationOverview(now);
}

function renderInteractions(now: number): void {
  ctx.fillStyle = "#26384a";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#7fd8ff";
  ctx.fillRect(0, 0, width, 86);
  ctx.fillStyle = "#172738";
  ctx.font = "bold 29px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "Interaction review: friendly reactions and distinct risky roles",
    36,
    34
  );
  ctx.font = "16px Arial";
  ctx.fillText(
    "Face-adjacent smile/talk cues are cosmetic · role styling never changes heritage or age",
    36,
    66
  );

  const heritages: { id: HeritageStyle; label: string }[] = [
    { id: "western", label: "Western" },
    { id: "asian", label: "Asian" },
    { id: "middleEastern", label: "Middle Eastern" },
    { id: "black", label: "Black / African diaspora" },
  ];
  const cases: {
    kind: PersonKind;
    title: string;
    stage: number;
  }[] = [
    {
      kind: "bestFriend",
      title: "Friendly conversation",
      stage: 5,
    },
    {
      kind: "smokerFriend",
      title: "Risky pressure",
      stage: 5,
    },
    {
      kind: "gangster",
      title: "Hostile crowd",
      stage: 5,
    },
    {
      kind: "playboy",
      title: "Flashy charmer",
      stage: 6,
    },
  ];
  const columnX = [215, 600, 985, 1370];
  const rawPhase = searchParams.get("phase");
  const requestedPhase =
    rawPhase === null ? Number.NaN : Number(rawPhase);
  const elapsed = Number.isFinite(requestedPhase)
    ? Math.max(
        0,
        Math.min(PERSON_REACTION_SECONDS, requestedPhase)
      )
    : (now / 1000) % PERSON_REACTION_SECONDS;

  cases.forEach((entry, column) => {
    label(entry.title, columnX[column], 116);
  });
  heritages.forEach((heritage, row) => {
    const footY = 275 + row * 220;
    lane(footY, heritage.label);
    cases.forEach((entry, column) => {
      const expressions = interactionExpressionsAt(
        elapsed,
        entry.kind
      );
      drawCharacter(
        ctx,
        columnX[column] - 52,
        footY,
        avatarLook(
          entry.stage,
          "female",
          heritage.id,
          requestedAppearance
        ),
        now / 1000,
        {
          moving: false,
          facing: "front",
          verticalBias: 0,
        },
        expressions.player
      );
      drawPerson(
        ctx,
        columnX[column] + 52,
        footY,
        entry.kind,
        "male",
        entry.kind === "bestFriend"
          ? "Best friend"
          : entry.kind === "smokerFriend"
            ? "Smoker friend"
            : entry.kind === "gangster"
              ? "Gangster"
              : "Playboy",
        false,
        false,
        now / 1000,
        entry.stage,
        heritage.id,
        {
          appearance: requestedAppearance,
          expression: expressions.npc,
        }
      );
    });
  });
}

function requestedBackgroundStage(): Stage {
  const requestedStage = searchParams.get("stage");
  const exactStage = STAGES.find(
    (stage) => stage.id === requestedStage
  );
  if (exactStage) return exactStage;

  // Keep the original `scene=` links useful as aliases, but make `stage=`
  // authoritative because several life stages intentionally share a scene.
  const requestedScene = searchParams.get("scene");
  return (
    STAGES.find(
      (stage) =>
        stage.id === requestedScene ||
        (stage.scene === requestedScene &&
          (requestedScene !== "school" ||
            stage.id === "elementary"))
    ) ?? STAGES[0]
  );
}

function requestedUpperScene(stage: Stage): UpperSceneKind {
  const requested = searchParams.get("upper") as
    | UpperSceneKind
    | null;
  if (requested && stage.upperScenes?.includes(requested)) {
    return requested;
  }
  return stage.upperScenes?.[0] ?? "park";
}

function drawBackgroundReviewCard(
  stage: Stage,
  room: RoomDimensions,
  x: number,
  y: number,
  scale: number,
  title: string,
  now: number
): void {
  const geometry = roomZoneGeometry(room, stage.id);
  const stageIndex = Math.max(0, STAGES.indexOf(stage));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.rect(0, 0, room.W, room.H);
  ctx.clip();
  drawRoom(
    ctx,
    stage.theme,
    room.W,
    room.H,
    room.FLOOR_Y,
    false,
    now / 1000,
    {
      scene: stage.scene,
      upperScene: requestedUpperScene(stage),
      atHome: !!stage.atHome,
      homeQuality: stage.atHome ? 3 : 0,
      splitY: geometry.splitY,
      ownedVehicles: [],
      ownedHome: null,
    }
  );

  const socialY =
    geometry.social.min +
    (geometry.social.max - geometry.social.min) * 0.56;
  const familyY =
    geometry.family.min +
    Math.min(74, (geometry.family.max - geometry.family.min) * 0.26);
  drawCharacter(
    ctx,
    room.W * 0.34,
    socialY,
    avatarLook(stageIndex, "male", "western", requestedAppearance),
    now / 500,
    { moving: false, facing: "front", verticalBias: 0 }
  );
  drawCharacter(
    ctx,
    room.W * 0.58,
    familyY,
    avatarLook(stageIndex, "female", "asian", requestedAppearance),
    now / 500,
    { moving: false, facing: "front", verticalBias: 0 }
  );
  const companionKind: PersonKind =
    stageIndex <= 2
      ? "mother"
      : stageIndex >= 10
        ? "oldFriend"
        : "bestFriend";
  const companionY =
    geometry.family.min +
    (geometry.family.max - geometry.family.min) * 0.7;
  drawPerson(
    ctx,
    room.W * 0.78,
    companionY,
    companionKind,
    stageIndex <= 2 ? "female" : "male",
    stageIndex <= 2
      ? "Parent"
      : stageIndex >= 10
        ? "Old friend"
        : "Friend",
    false,
    false,
    now / 1000,
    stageIndex,
    stageIndex % 2 === 0 ? "western" : "black",
    { appearance: requestedAppearance }
  );

  if (searchParams.has("guides")) {
    ctx.save();
    ctx.setLineDash([10, 7]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255,255,255,0.86)";
    ctx.beginPath();
    ctx.moveTo(0, familyFloorY(geometry.splitY));
    ctx.lineTo(room.W, familyFloorY(geometry.splitY));
    ctx.stroke();
    ctx.strokeStyle = "rgba(49,87,103,0.88)";
    ctx.beginPath();
    ctx.moveTo(0, geometry.family.min);
    ctx.lineTo(room.W, geometry.family.min);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    x - 2,
    y - 2,
    room.W * scale + 4,
    room.H * scale + 4
  );
  ctx.fillStyle = "#f8fbff";
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(title, x, y - 12);
  ctx.restore();
}

function renderBackgrounds(now: number): void {
  const stage = requestedBackgroundStage();
  ctx.fillStyle = "#26384a";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#f4d9cb";
  ctx.fillRect(0, 0, width, 92);
  ctx.fillStyle = "#4f3d3a";
  ctx.font = "bold 30px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `Background review: ${stage.emoji} ${stage.name}`,
    36,
    34
  );
  ctx.font = "17px Arial";
  ctx.fillText(
    "Flat storybook playmats · rear/edge props · visible floor before every legal foot anchor",
    36,
    68
  );

  drawBackgroundReviewCard(
    stage,
    ROOM_PORTRAIT,
    54,
    136,
    0.78,
    "Portrait 640 × 1000",
    now
  );
  drawBackgroundReviewCard(
    stage,
    ROOM_LANDSCAPE,
    584,
    186,
    0.8,
    "Landscape 1180 × 560",
    now
  );

  ctx.fillStyle = "rgba(15,25,35,0.78)";
  ctx.fillRect(584, 670, 944, 172);
  ctx.fillStyle = "#f8fbff";
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Review checks", 612, 704);
  ctx.font = "17px Arial";
  ctx.fillText(
    "• Characters stay strongest in contrast and saturation",
    612,
    738
  );
  ctx.fillText(
    "• Rugs and texture are flat decals; raised props stay at the rear or clipped edges",
    612,
    770
  );
  ctx.fillText(
    "• Add &guides to compare the painted floor line with the first legal foot line",
    612,
    802
  );
}

function startBackgroundPreview(): void {
  const minimumFrameInterval = 1000 / 15;
  let animationFrame = 0;
  let lastRender = Number.NEGATIVE_INFINITY;

  const animate = (now: number): void => {
    animationFrame = 0;
    if (document.hidden) return;

    if (now - lastRender >= minimumFrameInterval) {
      renderBackgrounds(now);
      lastRender = now;
    }
    animationFrame = window.requestAnimationFrame(animate);
  };

  const start = (): void => {
    if (!document.hidden && animationFrame === 0) {
      animationFrame = window.requestAnimationFrame(animate);
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      return;
    }
    lastRender = Number.NEGATIVE_INFINITY;
    start();
  });

  start();
}

function render(): void {
  if (location.search.includes("variants")) {
    renderVariants();
    return;
  }
  if (location.search.includes("matrix")) {
    renderMatrix();
    return;
  }
  if (location.search.includes("face")) {
    renderFaces();
    return;
  }
  if (location.search.includes("zoom")) {
    renderZoom();
    return;
  }
  ctx.fillStyle = "#26384a";
  ctx.fillRect(0, 0, width, height);
  drawHeader();

  lane(280, "Boy / male player");
  drawPlayerRow(280, "male");

  lane(465, "Girl / female player");
  drawPlayerRow(465, "female");

  lane(665, "NPC people");
  drawNpcRow(665);

  lane(895, "Movement: left / right / back / front");
  drawMovementRow(895);
}

if (searchParams.has("backgrounds")) {
  startBackgroundPreview();
} else if (location.search.includes("interactions")) {
  const animate = (now: number): void => {
    renderInteractions(now);
    window.requestAnimationFrame(animate);
  };
  window.requestAnimationFrame(animate);
} else if (location.search.includes("pets")) {
  void warmStorybookPetAtlases();
  const animate = (now: number): void => {
    renderPets(now);
    window.requestAnimationFrame(animate);
  };
  window.requestAnimationFrame(animate);
} else if (location.search.includes("occupations")) {
  void warmOccupationCharacterAtlases();
  const animate = (now: number): void => {
    renderOccupations(now);
    window.requestAnimationFrame(animate);
  };
  window.requestAnimationFrame(animate);
} else if (location.search.includes("motion")) {
  const animate = (now: number): void => {
    renderMotion(now);
    window.requestAnimationFrame(animate);
  };
  window.requestAnimationFrame(animate);
} else {
  render();
  window.addEventListener("plj:character-atlas-ready", render);
}
