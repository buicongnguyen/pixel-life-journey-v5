import { describe, expect, it } from "vitest";
import {
  friendAgeForStage,
  peerHeritage,
  SAME_STAGE_PEER_KINDS,
} from "./friends";
import { STAGES } from "./stages";

describe("school friend identity rules", () => {
  it("keeps displayed school ages inside the player's current stage", () => {
    for (const stageId of [
      "elementary",
      "middle",
      "high",
      "university",
    ]) {
      const stageIndex = STAGES.findIndex(
        (stage) => stage.id === stageId
      );
      const stage = STAGES[stageIndex];
      expect(
        friendAgeForStage(stage.ageStart, stageIndex, -20)
      ).toBe(stage.ageStart);
      expect(
        friendAgeForStage(stage.ageEnd - 1, stageIndex, 20)
      ).toBe(stage.ageEnd - 1);
    }
  });

  it("does not clamp adult friends to a school chapter", () => {
    const careerIndex = STAGES.findIndex(
      (stage) => stage.id === "career"
    );
    expect(friendAgeForStage(25, careerIndex, 4)).toBe(29);
  });

  it("assigns recurring peer roles stable but varied heritages", () => {
    for (const kind of SAME_STAGE_PEER_KINDS) {
      expect(peerHeritage("life-a", kind)).toBe(
        peerHeritage("life-a", kind)
      );
    }
    const heritages = new Set(
      ["life-a", "life-b", "life-c"].flatMap((seed) =>
        SAME_STAGE_PEER_KINDS.map((kind) =>
          peerHeritage(seed, kind)
        )
      )
    );
    expect(heritages.size).toBeGreaterThanOrEqual(3);
  });
});
