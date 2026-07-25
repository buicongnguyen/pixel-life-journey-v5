import { describe, expect, it } from "vitest";
import { avatarLook } from "./sprites";
import {
  drawStorybookCharacter,
  storybookAgeBand,
  storybookFrameForLook,
  storybookGroundAnchorForFrame,
} from "./storybook-characters";
import type { CuteFacing } from "./cute-characters";
import type { Gender, HeritageStyle } from "./types";

const genders: Gender[] = ["male", "female"];
const heritages: HeritageStyle[] = [
  "western",
  "asian",
  "middleEastern",
  "black",
];
const facings: CuteFacing[] = ["front", "left", "back", "right"];

describe("v5 storybook sprite selection", () => {
  it("keeps male and female atlases separate for every heritage", () => {
    for (const heritage of heritages) {
      const male = storybookFrameForLook(
        avatarLook(7, "male", heritage),
        "front"
      );
      const female = storybookFrameForLook(
        avatarLook(7, "female", heritage),
        "front"
      );

      expect(male.atlasKey).toBe(`${heritage}-male`);
      expect(female.atlasKey).toBe(`${heritage}-female`);
      expect(male.atlasKey).not.toBe(female.atlasKey);
    }
  });

  it("maps all twelve life stages into the five coherent age rows", () => {
    const bands = Array.from({ length: 12 }, (_, stage) =>
      storybookAgeBand(avatarLook(stage, "female", "western"))
    );

    expect(bands).toEqual([
      "baby",
      "child",
      "child",
      "child",
      "child",
      "teen",
      "adult",
      "adult",
      "adult",
      "adult",
      "elder",
      "elder",
    ]);
  });

  it("selects a valid dedicated frame for every stage, gender, heritage, and facing", () => {
    for (let stage = 0; stage < 12; stage += 1) {
      for (const gender of genders) {
        for (const heritage of heritages) {
          for (const facing of facings) {
            const frame = storybookFrameForLook(
              avatarLook(stage, gender, heritage),
              facing
            );
            expect(frame.atlasKey).toBe(`${heritage}-${gender}`);
            expect(frame.row).toBeGreaterThanOrEqual(0);
            expect(frame.row).toBeLessThan(5);
            expect(frame.column).toBeGreaterThanOrEqual(0);
            expect(frame.column).toBeLessThan(4);
          }
        }
      }
    }
  });

  it("uses distinct front, side, and back columns", () => {
    const look = avatarLook(7, "male", "asian");
    const front = storybookFrameForLook(look, "front");
    const left = storybookFrameForLook(look, "left");
    const right = storybookFrameForLook(look, "right");
    const back = storybookFrameForLook(look, "back");

    expect(front.column).toBe(0);
    expect(left.column).toBe(1);
    expect(back.column).toBe(2);
    expect(right.column).toBe(3);
    expect(new Set([front.column, left.column, right.column, back.column]).size)
      .toBe(4);
  });

  it("has a valid ground anchor for all 160 populated atlas cells", () => {
    const representativeStages = [0, 1, 5, 7, 10];
    const visitedFrames = new Set<string>();

    for (const stage of representativeStages) {
      for (const gender of genders) {
        for (const heritage of heritages) {
          for (const facing of facings) {
            const frame = storybookFrameForLook(
              avatarLook(stage, gender, heritage),
              facing
            );
            const anchor = storybookGroundAnchorForFrame(frame);
            visitedFrames.add(
              `${frame.atlasKey}:${frame.row}:${frame.column}`
            );

            expect(anchor).not.toBeNull();
            expect(anchor?.[0]).toBeGreaterThanOrEqual(0);
            expect(anchor?.[0]).toBeLessThanOrEqual(256);
            expect(anchor?.[1]).toBeGreaterThanOrEqual(0);
            expect(anchor?.[1]).toBeLessThanOrEqual(256);
          }
        }
      }
    }

    expect(visitedFrames.size).toBe(160);
  });

  it("uses the procedural fallback instead of distorting a standing frame for seated poses", () => {
    const rendered = drawStorybookCharacter(
      {} as CanvasRenderingContext2D,
      100,
      100,
      avatarLook(7, "female", "western"),
      0,
      {
        moving: false,
        facing: "front",
        verticalBias: 0,
        pose: "sit",
      }
    );

    expect(rendered).toBe(false);
  });
});
