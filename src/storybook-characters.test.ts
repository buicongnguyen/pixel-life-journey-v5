import { describe, expect, it } from "vitest";
import { avatarLook, personLook } from "./sprites";
import {
  drawStorybookCharacter,
  storybookAgeBand,
  storybookFrameForLook,
  storybookGroundAnchorForFrame,
  warmStorybookCharacterAtlases,
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
        avatarLook(6, "male", heritage),
        "front"
      );
      const female = storybookFrameForLook(
        avatarLook(6, "female", heritage),
        "front"
      );

      expect(male.atlasKey).toBe(`${heritage}-male`);
      expect(female.atlasKey).toBe(`${heritage}-female`);
      expect(male.atlasKey).not.toBe(female.atlasKey);
      expect(male.atlasFamily).toBe("expansion");
      expect(female.atlasFamily).toBe("expansion");
    }
  });

  it("maps all twelve life stages into eight coherent age bands", () => {
    const bands = Array.from({ length: 12 }, (_, stage) =>
      storybookAgeBand(avatarLook(stage, "female", "western"))
    );

    expect(bands).toEqual([
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
    ]);
  });

  it("uses the added age art to make NPC groups more varied", () => {
    expect(
      storybookAgeBand(personLook("sibling", "female", 4, "western"))
    ).toBe("earlyTeen");
    expect(
      storybookAgeBand(personLook("roommate", "female", 6, "asian"))
    ).toBe("youngAdult");
    expect(
      storybookAgeBand(personLook("boss", "female", 7, "middleEastern"))
    ).toBe("middleAge");
    expect(
      storybookAgeBand(personLook("spouse", "male", 9, "black"))
    ).toBe("middleAge");

    const laterSiblingBands = Array.from({ length: 8 }, (_, offset) =>
      storybookAgeBand(
        personLook("sibling", "female", offset + 4, "western")
      )
    );
    expect(laterSiblingBands).toEqual([
      "earlyTeen",
      "teen",
      "youngAdult",
      "adult",
      "adult",
      "middleAge",
      "elder",
      "elder",
    ]);

    expect(
      storybookAgeBand(personLook("mother", "male", 5, "asian"))
    ).toBe("adult");
    expect(
      storybookAgeBand(personLook("mother", "male", 6, "asian"))
    ).toBe("middleAge");
    expect(
      storybookAgeBand(personLook("father", "female", 9, "black"))
    ).toBe("elder");
  });

  it("warms all sixteen base and expansion sheets when no heritage is filtered", async () => {
    const originalImage = globalThis.Image;
    const requestedSources: string[] = [];

    class ImmediateImage {
      decoding = "";
      naturalWidth = 1024;
      private listeners = new Map<string, EventListenerOrEventListenerObject>();

      addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject
      ): void {
        this.listeners.set(type, listener);
      }

      set src(value: string) {
        requestedSources.push(value);
        queueMicrotask(() => {
          const listener = this.listeners.get("load");
          if (typeof listener === "function") listener(new Event("load"));
          else listener?.handleEvent(new Event("load"));
        });
      }
    }

    Object.defineProperty(globalThis, "Image", {
      configurable: true,
      value: ImmediateImage,
    });
    try {
      await warmStorybookCharacterAtlases();
    } finally {
      Object.defineProperty(globalThis, "Image", {
        configurable: true,
        value: originalImage,
      });
    }

    expect(requestedSources).toHaveLength(16);
    expect(new Set(requestedSources).size).toBe(16);
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
            expect(frame.row).toBeLessThan(
              frame.atlasFamily === "base" ? 5 : 3
            );
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

  it("has a valid ground anchor for all 256 populated base and expansion cells", () => {
    const representativeStages = [0, 1, 4, 5, 6, 7, 9, 10];
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
              `${frame.atlasFamily}:${frame.atlasKey}:${frame.row}:${frame.column}`
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

    expect(visitedFrames.size).toBe(256);
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
