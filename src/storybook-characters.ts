import type {
  CuteCharacterLook,
  CuteCharacterMotion,
  CuteFacing,
} from "./cute-characters";
import groundAnchorManifest from "./assets/characters/character-anchors.json";
import expansionGroundAnchorManifest from "./assets/characters/character-stage-expansion-anchors.json";
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
export type StorybookAtlasFamily = "base" | "expansion";

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

const STORYBOOK_ANCHORS =
  groundAnchorManifest as unknown as StorybookAnchorManifest;
const EXPANSION_STORYBOOK_ANCHORS =
  expansionGroundAnchorManifest as unknown as StorybookAnchorManifest;
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
  { atlasFamily: StorybookAtlasFamily; row: number }
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

const ATLAS_URLS: Record<
  StorybookAtlasFamily,
  Record<HeritageStyle, Record<Gender, string>>
> = {
  base: BASE_ATLAS_URLS,
  expansion: EXPANSION_ATLAS_URLS,
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

export function storybookGroundAnchorForFrame(
  frame: StorybookFrame
): StorybookGroundAnchor | null {
  const anchors =
    frame.atlasFamily === "expansion"
      ? EXPANSION_STORYBOOK_ANCHORS
      : STORYBOOK_ANCHORS;
  return (
    anchors.atlases[frame.atlasKey]?.[frame.row]?.[frame.column] ??
    null
  );
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
    image.addEventListener(
      "load",
      () => {
        state.ready = image.naturalWidth > 0;
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("plj:character-atlas-ready"));
        }
        resolve();
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

/** Decode both base and expansion gender pairs for one or every heritage. */
export async function warmStorybookCharacterAtlases(
  selectedHeritage?: HeritageStyle
): Promise<void> {
  if (typeof Image === "undefined") return;
  const loads: Promise<void>[] = [];
  const heritages = selectedHeritage
    ? [selectedHeritage]
    : (Object.keys(BASE_ATLAS_URLS) as HeritageStyle[]);
  for (const heritage of heritages) {
    for (const atlasFamily of ["base", "expansion"] as const) {
      for (const gender of ["male", "female"] as const) {
        const state = atlasStateFor(atlasFamily, heritage, gender);
        if (state) loads.push(state.readyPromise);
      }
    }
  }
  await Promise.all(loads);
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
  // The generated sheets contain only upright turnarounds. Distorting one into
  // a seated pose changes the character's proportions, so let the caller use
  // the purpose-built procedural seated renderer instead.
  if (motion.pose === "sit") return false;

  const frame = storybookFrameForLook(look, motion.facing);
  const atlas = atlasStateFor(
    frame.atlasFamily,
    look.heritage,
    look.gender
  );
  if (!atlas || !atlas.ready || atlas.failed) return false;
  const anchor = storybookGroundAnchorForFrame(frame);
  if (!anchor) return false;

  const height = storybookVisualHeight(look);
  // Square normalized cells preserve each generated frame's natural silhouette.
  // Crawling babies get a little more horizontal room without changing height.
  const width = height * (look.baby ? 1.14 : 1);
  const stride = motion.moving ? Math.sin(walkPhase * 1.85) : 0;
  const bob = motion.moving
    ? Math.abs(Math.sin(walkPhase * 1.85)) * Math.max(1, height * 0.018)
    : Math.sin(walkPhase * 0.7) * Math.max(0.35, height * 0.004);
  const sideFacing = motion.facing === "left" || motion.facing === "right";
  const lean = motion.moving && sideFacing ? stride * 0.018 : 0;
  const scaleX = width / CELL_SIZE;
  const scaleY = height / CELL_SIZE;

  drawGroundShadow(ctx, cx, footY, height, look.baby);

  ctx.save();
  ctx.translate(cx, footY - bob);
  ctx.rotate(lean);
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
  // Start the default pair behind the title screen. Entry/resume flows still
  // await the selected pair explicitly; the Canvas path remains for real image
  // failures and for poses without generated art.
  void warmStorybookCharacterAtlases("western");
}
