import { describe, expect, it } from "vitest";
import { avatarLook, personLook } from "./sprites";
import {
  storybookAgeBand,
  storybookAnimationFrameForLook,
  storybookFrameForLook,
  storybookGroundAnchorForFrame,
  storybookUsesMotionFrame,
  warmStorybookCharacterAtlases,
} from "./storybook-characters";
import type { CuteFacing } from "./cute-characters";
import type {
  Gender,
  HeritageStyle,
  PersonKind,
} from "./types";
import { isSameStagePeerKind } from "./friends";
import { STAGES } from "./stages";

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

  it("keeps every school and campus peer in the player's life stage", () => {
    for (let stageIndex = 1; stageIndex <= 6; stageIndex += 1) {
      const peerKinds = STAGES[stageIndex].options
        .map((option) => option.person)
        .filter(
          (kind): kind is PersonKind =>
            !!kind && isSameStagePeerKind(kind)
        );
      for (const kind of peerKinds) {
        for (const gender of genders) {
          for (const heritage of heritages) {
            const peer = personLook(
              kind,
              gender,
              stageIndex,
              heritage
            );
            const player = avatarLook(
              stageIndex,
              gender,
              heritage
            );
            expect(peer.lifeStageIndex).toBe(stageIndex);
            expect(storybookAgeBand(peer)).toBe(
              storybookAgeBand(player)
            );
            expect(
              storybookFrameForLook(peer, "front").atlasKey
            ).toBe(`${heritage}-${peer.gender}`);
          }
        }
      }
    }
  });

  it("warms all 40 classic and alternate sheets when no heritage is filtered", async () => {
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

    expect(requestedSources).toHaveLength(40);
    expect(new Set(requestedSources).size).toBe(40);
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

  it("keeps every alternate gender and heritage in its own unified atlas", () => {
    for (const gender of genders) {
      for (const heritage of heritages) {
        for (let stage = 0; stage < 12; stage += 1) {
          for (const facing of facings) {
            const frame = storybookFrameForLook(
              avatarLook(stage, gender, heritage, "alternate"),
              facing
            );
            expect(frame.appearance).toBe("alternate");
            expect(frame.atlasFamily).toBe("alternate");
            expect(frame.atlasKey).toBe(`${heritage}-${gender}`);
            expect(frame.row).toBeGreaterThanOrEqual(0);
            expect(frame.row).toBeLessThan(8);
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

  it("alternates a neutral and a true motion cell in every direction", () => {
    const motionPhase = Math.PI / (2 * 1.85);
    expect(storybookUsesMotionFrame(0)).toBe(false);
    expect(storybookUsesMotionFrame(motionPhase)).toBe(true);

    for (const stage of [0, 1, 4, 5, 6, 7, 9, 10]) {
      for (const gender of genders) {
        for (const heritage of heritages) {
          for (const facing of facings) {
            const look = avatarLook(stage, gender, heritage);
            const motion = {
              moving: true,
              facing,
              verticalBias: 0,
            } as const;
            const neutral = storybookAnimationFrameForLook(
              look,
              motion,
              0
            );
            const step = storybookAnimationFrameForLook(
              look,
              motion,
              motionPhase
            );

            expect(neutral.atlasFamily).toMatch(
              /^(base|expansion)$/
            );
            expect(step.atlasFamily).toBe(
              neutral.atlasFamily === "base"
                ? "motionBase"
                : "motionExpansion"
            );
            expect(step.column).toBe(neutral.column);
            expect(step.row).toBe(neutral.row);
            expect(step.atlasKey).toBe(neutral.atlasKey);
          }
        }
      }
    }
  });

  it("uses genuine floor-seated motion art for all 64 character identities", () => {
    const visited = new Set<string>();
    for (const stage of [0, 1, 4, 5, 6, 7, 9, 10]) {
      for (const gender of genders) {
        for (const heritage of heritages) {
          const frame = storybookAnimationFrameForLook(
            avatarLook(stage, gender, heritage),
            {
              moving: false,
              facing: "back",
              verticalBias: 0,
              pose: "sit",
            },
            0
          );
          const anchor = storybookGroundAnchorForFrame(frame);
          visited.add(
            `${frame.atlasFamily}:${frame.atlasKey}:${frame.row}:${frame.column}`
          );

          expect(frame.atlasFamily).toMatch(
            /^motion(Base|Expansion)$/
          );
          expect(frame.column).toBe(4);
          expect(anchor).not.toBeNull();
        }
      }
    }
    expect(visited.size).toBe(64);
  });

  it("shows an idle newborn seated, then switches to directional crawl frames", () => {
    const look = avatarLook(0, "female", "asian");
    const idle = storybookAnimationFrameForLook(
      look,
      { moving: false, facing: "back", verticalBias: 0 },
      0
    );
    const crawlNeutral = storybookAnimationFrameForLook(
      look,
      { moving: true, facing: "left", verticalBias: 0 },
      0
    );
    const crawlStep = storybookAnimationFrameForLook(
      look,
      { moving: true, facing: "left", verticalBias: 0 },
      Math.PI / (2 * 1.85)
    );

    expect(idle.atlasFamily).toBe("motionBase");
    expect(idle.column).toBe(4);
    expect(crawlNeutral.atlasFamily).toBe("base");
    expect(crawlNeutral.column).toBe(1);
    expect(crawlStep.atlasFamily).toBe("motionBase");
    expect(crawlStep.column).toBe(1);
  });

  it("has valid anchors for all 320 generated motion and seated cells", () => {
    const motionPhase = Math.PI / (2 * 1.85);
    const visited = new Set<string>();
    for (const stage of [0, 1, 4, 5, 6, 7, 9, 10]) {
      for (const gender of genders) {
        for (const heritage of heritages) {
          const look = avatarLook(stage, gender, heritage);
          for (const facing of facings) {
            const frame = storybookAnimationFrameForLook(
              look,
              { moving: true, facing, verticalBias: 0 },
              motionPhase
            );
            const anchor = storybookGroundAnchorForFrame(frame);
            visited.add(
              `${frame.atlasFamily}:${frame.atlasKey}:${frame.row}:${frame.column}`
            );
            expect(anchor).not.toBeNull();
            expect(anchor?.[0]).toBeGreaterThanOrEqual(0);
            expect(anchor?.[0]).toBeLessThanOrEqual(256);
            expect(anchor?.[1]).toBeGreaterThanOrEqual(0);
            expect(anchor?.[1]).toBeLessThanOrEqual(256);
          }
          const seated = storybookAnimationFrameForLook(
            look,
            {
              moving: false,
              facing: "front",
              verticalBias: 0,
              pose: "sit",
            },
            0
          );
          visited.add(
            `${seated.atlasFamily}:${seated.atlasKey}:${seated.row}:${seated.column}`
          );
          expect(storybookGroundAnchorForFrame(seated)).not.toBeNull();
        }
      }
    }
    expect(visited.size).toBe(320);
  });

  it("has valid anchors for all 576 alternate neutral, motion, and seated cells", () => {
    const motionPhase = Math.PI / (2 * 1.85);
    const visited = new Set<string>();
    for (const stage of [0, 1, 4, 5, 6, 7, 9, 10]) {
      for (const gender of genders) {
        for (const heritage of heritages) {
          const look = avatarLook(
            stage,
            gender,
            heritage,
            "alternate"
          );
          for (const facing of facings) {
            const neutral = storybookAnimationFrameForLook(
              look,
              { moving: true, facing, verticalBias: 0 },
              0
            );
            const motion = storybookAnimationFrameForLook(
              look,
              { moving: true, facing, verticalBias: 0 },
              motionPhase
            );
            expect(neutral.atlasFamily).toBe("alternate");
            expect(neutral.column).toBeLessThan(4);
            expect(motion.atlasFamily).toBe("alternate");
            expect(motion.column).toBe(neutral.column + 4);
            for (const frame of [neutral, motion]) {
              visited.add(
                `${frame.atlasKey}:${frame.row}:${frame.column}`
              );
              expect(storybookGroundAnchorForFrame(frame)).not.toBeNull();
            }
          }
          const seated = storybookAnimationFrameForLook(
            look,
            {
              moving: false,
              facing: "back",
              verticalBias: 0,
              pose: "sit",
            },
            0
          );
          expect(seated.atlasFamily).toBe("alternate");
          expect(seated.column).toBe(8);
          visited.add(
            `${seated.atlasKey}:${seated.row}:${seated.column}`
          );
          expect(storybookGroundAnchorForFrame(seated)).not.toBeNull();
        }
      }
    }
    expect(visited.size).toBe(576);
  });
});
