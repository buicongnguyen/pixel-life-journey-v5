export interface RoomDimensions {
  W: number;
  H: number;
  FLOOR_Y: number;
  PY_MIN: number;
  PY_MAX: number;
}

export interface ZoneBounds {
  min: number;
  max: number;
}

export interface RoomZoneGeometry {
  social: ZoneBounds;
  family: ZoneBounds;
  splitY: number;
}

export const ROOM_PORTRAIT: RoomDimensions = {
  W: 640,
  H: 1000,
  FLOOR_Y: 72,
  PY_MIN: 142,
  PY_MAX: 982,
};

export const ROOM_LANDSCAPE: RoomDimensions = {
  W: 1180,
  H: 560,
  FLOOR_Y: 52,
  PY_MIN: 116,
  PY_MAX: 544,
};

/** Empty passage on either side of the divider before actors may place feet. */
export const ZONE_GATE_GAP = 48;

/** Smallest usable height for either actor zone. */
export const MIN_ZONE_HEIGHT = 118;

/**
 * The lower backdrop becomes a flat floor before the first legal family foot
 * position. The 16 px reveal is intentional: it makes contact with the floor
 * visible even when a character stands as close to the divider as possible.
 */
export const FAMILY_FLOOR_OFFSET = 32;
export const FAMILY_FLOOR_REVEAL = ZONE_GATE_GAP - FAMILY_FLOOR_OFFSET;

export function familyFloorY(splitY: number): number {
  return Math.round(splitY + FAMILY_FLOOR_OFFSET);
}

export function familyZoneShare(stageId: string | undefined): number {
  if (stageId === "newborn" || stageId === "toddler" || stageId === "early") {
    return 0.64;
  }
  if (
    stageId === "elementary" ||
    stageId === "middle" ||
    stageId === "high"
  ) {
    return 0.54;
  }
  if (stageId === "university" || stageId === "career") return 0.34;
  if (stageId === "marriage" || stageId === "midlife") return 0.42;
  return 0.5;
}

/**
 * Returns the share that the resolved divider actually assigns below itself.
 *
 * Portrait rooms are tall enough to follow `familyZoneShare` (apart from pixel
 * rounding). Landscape rooms deliberately rebalance extreme requests so both
 * actor zones keep `MIN_ZONE_HEIGHT`; callers that display layout diagnostics
 * should use this resolved value rather than the requested stage preference.
 */
export function effectiveFamilyZoneShare(
  room: RoomDimensions,
  stageId: string | undefined
): number {
  const socialMin = room.PY_MIN + ZONE_GATE_GAP;
  const familyMax = room.PY_MAX - 24;
  const playable = familyMax - socialMin;
  if (playable <= 0) return 0;
  return (familyMax - roomZoneGeometry(room, stageId).splitY) / playable;
}

export function roomZoneGeometry(
  room: RoomDimensions,
  stageId: string | undefined
): RoomZoneGeometry {
  const socialMin = room.PY_MIN + ZONE_GATE_GAP;
  const familyMax = room.PY_MAX - 24;
  const playable = familyMax - socialMin;
  const requestedSplit = Math.round(
    familyMax - playable * familyZoneShare(stageId)
  );
  const earliestSplit =
    socialMin + MIN_ZONE_HEIGHT + ZONE_GATE_GAP;
  const latestSplit =
    familyMax - MIN_ZONE_HEIGHT - ZONE_GATE_GAP;
  const splitY = Math.max(
    earliestSplit,
    Math.min(latestSplit, requestedSplit)
  );

  return {
    splitY,
    social: {
      min: socialMin,
      max: splitY - ZONE_GATE_GAP,
    },
    family: {
      min: splitY + ZONE_GATE_GAP,
      max: familyMax,
    },
  };
}
