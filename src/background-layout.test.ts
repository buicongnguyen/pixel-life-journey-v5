import { describe, expect, it } from "vitest";
import { STAGES } from "./stages";
import {
  FAMILY_FLOOR_REVEAL,
  MIN_ZONE_HEIGHT,
  ROOM_LANDSCAPE,
  ROOM_PORTRAIT,
  ZONE_GATE_GAP,
  effectiveFamilyZoneShare,
  familyFloorY,
  roomZoneGeometry,
} from "./background-layout";

describe("background grounding geometry", () => {
  const expectedPortrait = {
    newborn: [466, 418, 514],
    toddler: [466, 418, 514],
    early: [466, 418, 514],
    elementary: [543, 495, 591],
    middle: [543, 495, 591],
    high: [543, 495, 591],
    university: [697, 649, 745],
    career: [697, 649, 745],
    marriage: [635, 587, 683],
    midlife: [635, 587, 683],
    senior: [574, 526, 622],
    retirement: [574, 526, 622],
  } as const;

  const expectedLandscape = {
    newborn: [330, 282, 378],
    toddler: [330, 282, 378],
    early: [330, 282, 378],
    elementary: [330, 282, 378],
    middle: [330, 282, 378],
    high: [330, 282, 378],
    university: [354, 306, 402],
    career: [354, 306, 402],
    marriage: [354, 306, 402],
    midlife: [354, 306, 402],
    senior: [342, 294, 390],
    retirement: [342, 294, 390],
  } as const;

  it("keeps the portrait stage layout contract pixel-exact", () => {
    for (const stage of STAGES) {
      const geometry = roomZoneGeometry(ROOM_PORTRAIT, stage.id);
      const expected =
        expectedPortrait[stage.id as keyof typeof expectedPortrait];
      expect(
        [geometry.splitY, geometry.social.max, geometry.family.min],
        stage.id
      ).toEqual(expected);
      expect(geometry.social.min).toBe(190);
      expect(geometry.family.max).toBe(958);
    }
  });

  it("keeps the intentionally rebalanced landscape layout pixel-exact", () => {
    for (const stage of STAGES) {
      const geometry = roomZoneGeometry(ROOM_LANDSCAPE, stage.id);
      const expected =
        expectedLandscape[stage.id as keyof typeof expectedLandscape];
      expect(
        [geometry.splitY, geometry.social.max, geometry.family.min],
        stage.id
      ).toEqual(expected);
      expect(geometry.social.min).toBe(164);
      expect(geometry.family.max).toBe(520);
    }
  });

  it("reports the effective landscape share after clamping", () => {
    expect(effectiveFamilyZoneShare(ROOM_LANDSCAPE, "newborn")).toBeCloseTo(
      190 / 356,
      12
    );
    expect(effectiveFamilyZoneShare(ROOM_LANDSCAPE, "middle")).toBeCloseTo(
      190 / 356,
      12
    );
    expect(effectiveFamilyZoneShare(ROOM_LANDSCAPE, "career")).toBeCloseTo(
      166 / 356,
      12
    );
    expect(effectiveFamilyZoneShare(ROOM_LANDSCAPE, "midlife")).toBeCloseTo(
      166 / 356,
      12
    );
    expect(effectiveFamilyZoneShare(ROOM_LANDSCAPE, "senior")).toBe(0.5);
  });

  it("shows floor before every legal family foot position", () => {
    for (const room of [ROOM_PORTRAIT, ROOM_LANDSCAPE]) {
      for (const stage of STAGES) {
        const geometry = roomZoneGeometry(room, stage.id);
        expect(
          geometry.family.min - familyFloorY(geometry.splitY),
          `${stage.id} in ${room.W}x${room.H}`
        ).toBe(FAMILY_FLOOR_REVEAL);
      }
    }
  });

  it("keeps exact gate gaps and minimum-height actor zones inside the room", () => {
    for (const room of [ROOM_PORTRAIT, ROOM_LANDSCAPE]) {
      for (const stage of STAGES) {
        const geometry = roomZoneGeometry(room, stage.id);
        expect(geometry.social.min).toBeGreaterThan(room.FLOOR_Y);
        expect(geometry.splitY - geometry.social.max).toBe(ZONE_GATE_GAP);
        expect(geometry.family.min - geometry.splitY).toBe(ZONE_GATE_GAP);
        expect(geometry.social.max - geometry.social.min).toBeGreaterThanOrEqual(
          MIN_ZONE_HEIGHT
        );
        expect(geometry.family.max - geometry.family.min).toBeGreaterThanOrEqual(
          MIN_ZONE_HEIGHT
        );
        expect(geometry.family.max).toBeLessThan(room.H);
      }
    }
  });

  it("gives the newborn a coherent nursery-safe upper scene", () => {
    expect(STAGES[0].upperScenes).toEqual(["nurseryGarden"]);
  });
});
