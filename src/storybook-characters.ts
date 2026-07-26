import type {
  CuteCharacterLook,
  CuteCharacterMotion,
  CuteFacing,
} from "./cute-characters";
import groundAnchorManifest from "./assets/characters/character-anchors.json";
import expansionGroundAnchorManifest from "./assets/characters/character-stage-expansion-anchors.json";
import motionGroundAnchorManifest from "./assets/characters/character-motion-anchors.json";
import type { Gender, HeritageStyle } from "./types";

export type StorybookAgeBand =
  | "baby"
  | "child"
  | "earlyTeen"
  | "teen"
  | "youngAdult"
  | "adult"
  | "middleAge"
  | "elder";
export type StorybookStaticAtlasFamily = "base" | "expansion";
export type StorybookAtlasFamily =
  | StorybookStaticAtlasFamily
  | "motionBase"
  | "motionExpansion";

export interface StorybookFrame {
  atlasKey: `${HeritageStyle}-${Gender}`;
  atlasFamily: StorybookAtlasFamily;
  ageBand: StorybookAgeBand;
  row: number;
  column: number;
}

export type StorybookGroundAnchor = readonly [x: number, y: number];

interface StorybookAnchorManifest {
  version: 1;
  cellSize: number;
  anchorSpace: "source-cell-pixels";
  atlases: Record<
    StorybookFrame["atlasKey"],
    readonly (readonly StorybookGroundAnchor[])[]
  >;
}

interface StorybookMotionAnchorManifest {
  version: 1;
  cellSize: number;
  anchorSpace: "source-cell-pixels";
  columns: readonly [
    "frontStep",
    "screenLeftStep",
    "backStep",
    "screenRightStep",
    "floorSeatedFront",
  ];
  families: Record<
    StorybookStaticAtlasFamily,
    {
      rows: readonly StorybookAgeBand[];
      atlases: Record<
        StorybookFrame["atlasKey"],
        readonly (readonly StorybookGroundAnchor[])[]
      >;
    }
  >;
}

const STORYBOOK_ANCHORS =
  groundAnchorManifest as unknown as StorybookAnchorManifest;
const EXPANSION_STORYBOOK_ANCHORS =
  expansionGroundAnchorManifest as unknown as StorybookAnchorManifest;
const MOTION_STORYBOOK_ANCHORS =
  motionGroundAnchorManifest as unknown as StorybookMotionAnchorManifest;
const CELL_SIZE = STORYBOOK_ANCHORS.cellSize;
const STORYBOOK_VISUAL_SCALE = 1.15;

// Runtime atlases are normalized by the build script to the unambiguous order
// front, screen-left, back, screen-right, regardless of the source sheet's
// illustration-view convention.
const FACING_COLUMN: Record<CuteFacing, number> = {
  front: 0,
  left: 1,
  back: 2,
  right: 3,
};

const AGE_FRAME: Record<
  StorybookAgeBand,
  { atlasFamily: StorybookStaticAtlasFamily; row: number }
> = {
  baby: { atlasFamily: "base", row: 0 },
  child: { atlasFamily: "base", row: 1 },
  earlyTeen: { atlasFamily: "expansion", row: 0 },
  teen: { atlasFamily: "base", row: 2 },
  youngAdult: { atlasFamily: "expansion", row: 1 },
  adult: { atlasFamily: "base", row: 3 },
  middleAge: { atlasFamily: "expansion", row: 2 },
  elder: { atlasFamily: "base", row: 4 },
};

const BASE_ATLAS_URLS: Record<HeritageStyle, Record<Gender, string>> = {
  western: {
    male: new URL(
      "./assets/characters/character-atlas-western-male.png",
      import.meta.url
    ).href,
    female: new URL(
      "./assets/characters/character-atlas-western-female.png",
      import.meta.url
    ).href,
  },
  asian: {
    male: new URL(
      "./assets/characters/character-atlas-asian-male.png",
      import.meta.url
    ).href,
    female: new URL(
      "./assets/characters/character-atlas-asian-female.png",
      import.meta.url
    ).href,
  },
  middleEastern: {
    male: new URL(
      "./assets/characters/character-atlas-middleEastern-male.png",
      import.meta.url
    ).href,
    female: new URL(
      "./assets/characters/character-atlas-middleEastern-female.png",
      import.meta.url
    ).href,
  },
  black: {
    male: new URL(
      "./assets/characters/character-atlas-black-male.png",
      import.meta.url
    ).href,
    female: new URL(
      "./assets/characters/character-atlas-black-female.png",
      import.meta.url
    ).href,
  },
};

const EXPANSION_ATLAS_URLS: Record<
  HeritageStyle,
  Record<Gender, string>
> = {
  western: {
    male: new URL(
      "./assets/characters/character-stage-expansion-western-male.png",
      import.meta.url
    ).href,
    female: new URL(
      "./assets/characters/character-stage-expansion-western-female.png",
      import.meta.url
    ).href,
  },
  asian: {
    male: new URL(
      "./assets/characters/character-stage-expansion-asian-male.png",
      import.meta.url
    ).href,
    female: new URL(
      "./assets/characters/character-stage-expansion-asian-female.png",
      import.meta.url
    ).href,
  },
  middleEastern: {
    male: new URL(
      "./assets/characters/character-stage-expansion-middleEastern-male.png",
      import.meta.url
    ).href,
    female: new URL(
      "./assets/characters/character-stage-expansion-middleEastern-female.png",
      import.meta.url
    ).href,
  },
  black: {
    male: new URL(
      "./assets/characters/character-stage-expansion-black-male.png",
      import.meta.url
    ).href,
    female: new URL(
      "./assets/characters/character-stage-expansion-black-female.png",
      import.meta.url
    ).href,
  },
};

const MOTION_BASE_ATLAS_URLS: Record<
  HeritageStyle,
  Record<Gender, string>
> = {
  western: {
    male: new URL(
      "./assets/characters/character-motion-base-western-male.png",
      import.meta.url
    ).href,
    female: new URL(
      "./assets/characters/character-motion-base-western-female.png",
      import.meta.url
    ).href,
  },
  asian: {
    male: new URL(
      "./assets/characters/character-motion-base-asian-male.png",
      import.meta.url
    ).href,
    female: new URL(
      "./assets/characters/character-motion-base-asian-female.png",
      import.meta.url
    ).href,
  },
  middleEastern: {
    male: new URL(
      "./assets/characters/character-motion-base-middleEastern-male.png",
      import.meta.url
    ).href,
    female: new URL(
      "./assets/characters/character-motion-base-middleEastern-female.png",
      import.meta.url
    ).href,
  },
  black: {
    male: new URL(
      "./assets/characters/character-motion-base-black-male.png",
      import.meta.url
    ).href,
    female: new URL(
      "./assets/characters/character-motion-base-black-female.png",
      import.meta.url
    ).href,
  },
};

const MOTION_EXPANSION_ATLAS_URLS: Record<
  HeritageStyle,
  Record<Gender, string>
> = {
  western: {
    male: new URL(
      "./assets/characters/character-motion-expansion-western-male.png",
      import.meta.url
    ).href,
    female: new URL(
      "./assets/characters/character-motion-expansion-western-female.png",
      import.meta.url
    ).href,
  },
  asian: {
    male: new URL(
      "./assets/characters/character-motion-expansion-asian-male.png",
      import.meta.url
    ).href,
    female: new URL(
      "./assets/characters/character-motion-expansion-asian-female.png",
      import.meta.url
    ).href,
  },
  middleEastern: {
    male: new URL(
      "./assets/characters/character-motion-expansion-middleEastern-male.png",
      import.meta.url
    ).href,
    female: new URL(
      "./assets/characters/character-motion-expansion-middleEastern-female.png",
      import.meta.url
    ).href,
  },
  black: {
    male: new URL(
      "./assets/characters/character-motion-expansion-black-male.png",
      import.meta.url
    ).href,
    female: new URL(
      "./assets/characters/character-motion-expansion-black-female.png",
      import.meta.url
    ).href,
  },
};

const ATLAS_URLS: Record<
  StorybookAtlasFamily,
  Record<HeritageStyle, Record<Gender, string>>
> = {
  base: BASE_ATLAS_URLS,
  expansion: EXPANSION_ATLAS_URLS,
  motionBase: MOTION_BASE_ATLAS_URLS,
  motionExpansion: MOTION_EXPANSION_ATLAS_URLS,
};

interface AtlasState {
  image: HTMLImageElement;
  ready: boolean;
  failed: boolean;
  readyPromise: Promise<void>;
}

const atlasCache = new Map<string, AtlasState>();

const LIFE_STAGE_AGE_BANDS: readonly StorybookAgeBand[] = [
  "baby",
  "child",
  "child",
  "child",
  "earlyTeen",
  "teen",
  "youngAdult",
  "adult",
  "adult",
  "middleAge",
  "elder",
  "elder",
];

export function storybookAgeBand(look: CuteCharacterLook): StorybookAgeBand {
  if (
    look.lifeStageIndex !== undefined &&
    Number.isInteger(look.lifeStageIndex)
  ) {
    const stage = Math.max(
      0,
      Math.min(LIFE_STAGE_AGE_BANDS.length - 1, look.lifeStageIndex)
    );
    return LIFE_STAGE_AGE_BANDS[stage];
  }
  if (look.baby) return "baby";
  if (look.elder) return "elder";
  if (look.child) return look.heightPx >= 106 ? "earlyTeen" : "child";
  if (look.heightPx <= 116) return "teen";
  if (look.heightPx <= 124) return "youngAdult";
  if (look.heightPx <= 126) return "middleAge";
  return "adult";
}

export function storybookVisualHeight(look: CuteCharacterLook): number {
  return look.heightPx * STORYBOOK_VISUAL_SCALE;
}

export function storybookFrameForLook(
  look: CuteCharacterLook,
  facing: CuteFacing
): StorybookFrame {
  const ageBand = storybookAgeBand(look);
  const ageFrame = AGE_FRAME[ageBand];
  return {
    atlasKey: `${look.heritage}-${look.gender}`,
    atlasFamily: ageFrame.atlasFamily,
    ageBand,
    row: ageFrame.row,
    column: FACING_COLUMN[facing],
  };
}

function motionAtlasFamily(
  atlasFamily: StorybookStaticAtlasFamily
): StorybookAtlasFamily {
  return atlasFamily === "base" ? "motionBase" : "motionExpansion";
}

function staticAtlasFamily(
  atlasFamily: StorybookAtlasFamily
): StorybookStaticAtlasFamily {
  return atlasFamily === "expansion" ||
    atlasFamily === "motionExpansion"
    ? "expansion"
    : "base";
}

/** The generated step pose occupies the positive half of each walk cycle. */
export function storybookUsesMotionFrame(walkPhase: number): boolean {
  return Math.sin(walkPhase * 1.85) > 0;
}

/**
 * Resolve the exact static, motion, or seated cell for a gameplay frame.
 * Moving characters alternate their reviewed neutral pose with a visibly
 * different generated step/crawl pose. Seated art is always front-facing.
 */
export function storybookAnimationFrameForLook(
  look: CuteCharacterLook,
  motion: CuteCharacterMotion,
  walkPhase: number
): StorybookFrame {
  const neutral = storybookFrameForLook(look, motion.facing);
  const seated =
    motion.pose === "sit" ||
    (look.baby && !motion.moving && motion.pose !== "stand");
  if (seated) {
    return {
      ...neutral,
      atlasFamily: motionAtlasFamily(
        neutral.atlasFamily as StorybookStaticAtlasFamily
      ),
      column: 4,
    };
  }
  if (motion.moving && storybookUsesMotionFrame(walkPhase)) {
    return {
      ...neutral,
      atlasFamily: motionAtlasFamily(
        neutral.atlasFamily as StorybookStaticAtlasFamily
      ),
    };
  }
  return neutral;
}

export function storybookGroundAnchorForFrame(
  frame: StorybookFrame
): StorybookGroundAnchor | null {
  if (
    frame.atlasFamily === "motionBase" ||
    frame.atlasFamily === "motionExpansion"
  ) {
    const family = staticAtlasFamily(frame.atlasFamily);
    return (
      MOTION_STORYBOOK_ANCHORS.families[family].atlases[
        frame.atlasKey
      ]?.[frame.row]?.[frame.column] ?? null
    );
  }
  const anchors =
    frame.atlasFamily === "expansion"
      ? EXPANSION_STORYBOOK_ANCHORS
      : STORYBOOK_ANCHORS;
  return anchors.atlases[frame.atlasKey]?.[frame.row]?.[
    frame.column
  ] ?? null;
}

function atlasStateFor(
  atlasFamily: StorybookAtlasFamily,
  heritage: HeritageStyle,
  gender: Gender
): AtlasState | null {
  if (typeof Image === "undefined") return null;
  const url = ATLAS_URLS[atlasFamily][heritage][gender];
  const cached = atlasCache.get(url);
  if (cached) return cached;

  const image = new Image();
  image.decoding = "async";
  const state: AtlasState = {
    image,
    ready: false,
    failed: false,
    readyPromise: Promise.resolve(),
  };
  state.readyPromise = new Promise<void>((resolve) => {
    const markReady = async (): Promise<void> => {
      try {
        if (typeof image.decode === "function") {
          await image.decode();
        }
      } catch {
        // A loaded image remains drawable when an eager decode hint is
        // unsupported or rejected by the browser.
      }
      state.ready = image.naturalWidth > 0;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("plj:character-atlas-ready")
        );
      }
      resolve();
    };
    image.addEventListener(
      "load",
      () => {
        void markReady();
      },
      { once: true }
    );
    image.addEventListener(
      "error",
      () => {
        state.failed = true;
        resolve();
      },
      { once: true }
    );
  });
  image.src = url;
  atlasCache.set(url, state);
  return state;
}

async function warmStorybookAtlasFamilies(
  selectedHeritage: HeritageStyle | undefined,
  atlasFamilies: readonly StorybookAtlasFamily[]
): Promise<void> {
  if (typeof Image === "undefined") return;
  const loads: Promise<void>[] = [];
  const heritages = selectedHeritage
    ? [selectedHeritage]
    : (Object.keys(BASE_ATLAS_URLS) as HeritageStyle[]);
  for (const heritage of heritages) {
    for (const atlasFamily of atlasFamilies) {
      for (const gender of ["male", "female"] as const) {
        const state = atlasStateFor(atlasFamily, heritage, gender);
        if (state) loads.push(state.readyPromise);
      }
    }
  }
  await Promise.all(loads);
}

/** Decode neutral, movement, and seated gender pairs for one or every heritage. */
export async function warmStorybookCharacterAtlases(
  selectedHeritage?: HeritageStyle
): Promise<void> {
  await warmStorybookAtlasFamilies(selectedHeritage, [
    "base",
    "expansion",
    "motionBase",
    "motionExpansion",
  ]);
}

function drawGroundShadow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  footY: number,
  height: number,
  baby: boolean
): void {
  ctx.save();
  ctx.fillStyle = "rgba(31, 24, 36, 0.18)";
  ctx.beginPath();
  ctx.ellipse(
    cx,
    footY + 1,
    height * (baby ? 0.42 : 0.24),
    Math.max(2.5, height * 0.035),
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();
}

/**
 * Draw the generated storybook atlas and return true when it was available.
 * A false result lets the caller use the procedural renderer as an explicit
 * loading/error fallback.
 */
export function drawStorybookCharacter(
  ctx: CanvasRenderingContext2D,
  cx: number,
  footY: number,
  look: CuteCharacterLook,
  walkPhase: number,
  motion: CuteCharacterMotion
): boolean {
  let frame = storybookAnimationFrameForLook(
    look,
    motion,
    walkPhase
  );
  let atlas = atlasStateFor(
    frame.atlasFamily,
    look.heritage,
    look.gender
  );
  const requestedMotion =
    frame.atlasFamily === "motionBase" ||
    frame.atlasFamily === "motionExpansion";

  // Keep the generated identity on screen while a companion sheet decodes.
  // Entry/resume normally awaits every selected-heritage sheet, but this path
  // prevents an abrupt switch to a different procedural character on slow
  // devices or after an individual motion-image failure.
  if (requestedMotion && (!atlas || !atlas.ready || atlas.failed)) {
    frame = storybookFrameForLook(look, motion.facing);
    atlas = atlasStateFor(
      frame.atlasFamily,
      look.heritage,
      look.gender
    );
  }
  if (!atlas || !atlas.ready || atlas.failed) return false;
  const anchor = storybookGroundAnchorForFrame(frame);
  if (!anchor) return false;

  const height = storybookVisualHeight(look);
  // Square normalized cells preserve the reviewed proportions, including the
  // naturally wider crawl and floor-seated silhouettes.
  const width = height;
  const seated =
    (frame.atlasFamily === "motionBase" ||
      frame.atlasFamily === "motionExpansion") &&
    frame.column === 4;
  const bob = seated
    ? 0
    : motion.moving
    ? Math.abs(Math.sin(walkPhase * 1.85)) *
      Math.max(0.4, height * 0.006)
    : Math.sin(walkPhase * 0.7) * Math.max(0.35, height * 0.004);
  const scaleX = width / CELL_SIZE;
  const scaleY = height / CELL_SIZE;

  drawGroundShadow(ctx, cx, footY, height, look.baby);

  ctx.save();
  ctx.translate(cx, footY - bob);
  const smoothing = ctx.imageSmoothingEnabled;
  const smoothingQuality = ctx.imageSmoothingQuality;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    atlas.image,
    frame.column * CELL_SIZE,
    frame.row * CELL_SIZE,
    CELL_SIZE,
    CELL_SIZE,
    -anchor[0] * scaleX,
    -anchor[1] * scaleY,
    width,
    height
  );
  ctx.imageSmoothingEnabled = smoothing;
  ctx.imageSmoothingQuality = smoothingQuality;
  ctx.restore();
  return true;
}

if (typeof window !== "undefined") {
  // The title uses the default neutral pair. Motion companions wait for the
  // selected-character entry/resume flow, avoiding an unnecessary 20 MiB
  // decoded Western motion set when another heritage is chosen.
  void warmStorybookAtlasFamilies("western", ["base", "expansion"]);
}
