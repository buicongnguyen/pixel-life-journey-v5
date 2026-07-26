import { avatarLook, drawCharacter, personLook } from "./sprites";
import type { AvatarFacing } from "./sprites";
import type { Gender, HeritageStyle, PersonKind } from "./types";

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
const dpr = window.devicePixelRatio || 1;

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
      drawCharacter(ctx, x, footY, avatarLook(entry.stage, entry.gender, heritage.id), column * 0.85, {
        moving: entry.moving,
        facing: entry.facing,
        verticalBias: 0,
        pose: entry.pose,
      });
      label(entry.label, x, footY + 42);
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
    const footY = 275 + row * 225;
    lane(footY, heritage.label);
    (["male", "female"] as const).forEach((gender, genderIndex) => {
      const groupStart = genderIndex === 0 ? 115 : 895;
      facings.forEach((facing, facingIndex) => {
        const x = groupStart + facingIndex * 145;
        drawCharacter(
          ctx,
          x,
          footY,
          avatarLook(stage, gender, heritage.id),
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
        avatarLook(stage, gender, heritage.id),
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

function render(): void {
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

if (location.search.includes("motion")) {
  const animate = (now: number): void => {
    renderMotion(now);
    window.requestAnimationFrame(animate);
  };
  window.requestAnimationFrame(animate);
} else {
  render();
  window.addEventListener("plj:character-atlas-ready", render);
}
