import { describe, expect, it } from "vitest";
import {
  PROFESSION_NPC_STAGE_IDS,
  PROFESSION_ROLES,
  professionLifeOptions,
  professionNpcsForStage,
  sameProfessionVisual,
  stageHasProfessionNpcs,
} from "./profession-npcs";

describe("adult profession NPC cast", () => {
  it("appears only after university", () => {
    for (const stageId of [
      "newborn",
      "elementary",
      "high",
      "university",
    ]) {
      expect(stageHasProfessionNpcs(stageId)).toBe(false);
      expect(professionNpcsForStage("life-a", stageId)).toEqual([]);
    }
    for (const stageId of PROFESSION_NPC_STAGE_IDS) {
      expect(stageHasProfessionNpcs(stageId)).toBe(true);
      expect(professionNpcsForStage("life-a", stageId)).toHaveLength(3);
    }
  });

  it("keeps a chapter cast stable, distinct, and gender separated", () => {
    for (const stageId of PROFESSION_NPC_STAGE_IDS) {
      const first = professionNpcsForStage("life-a", stageId);
      expect(professionNpcsForStage("life-a", stageId)).toEqual(first);
      expect(new Set(first.map((npc) => npc.id)).size).toBe(3);
      expect(new Set(first.map((npc) => npc.gender))).toEqual(
        new Set(["male", "female"])
      );
      expect(new Set(first.map((npc) => npc.heritage))).toEqual(
        new Set(["western", "asian"])
      );
      expect(
        new Set(
          first.map(
            (npc) =>
              `${npc.uniform}:${npc.gender}:${npc.heritage}`
          )
        ).size
      ).toBe(first.length);
    }
  });

  it("never renders doctor and nurse as the same medical character", () => {
    for (const stageId of PROFESSION_NPC_STAGE_IDS) {
      for (let seed = 0; seed < 50; seed += 1) {
        const cast = professionNpcsForStage(
          `medical-${seed}`,
          stageId
        );
        const keys = cast.map(
          (npc) =>
            `${npc.uniform}:${npc.gender}:${npc.heritage}`
        );
        expect(new Set(keys).size).toBe(keys.length);
      }
    }
  });

  it("never reuses the active player's complete career character", () => {
    const reserved = {
      uniform: "doctor",
      gender: "female",
      heritage: "asian",
    } as const;
    for (const stageId of PROFESSION_NPC_STAGE_IDS) {
      for (let seed = 0; seed < 50; seed += 1) {
        const cast = professionNpcsForStage(
          `player-${seed}`,
          stageId,
          3,
          reserved
        );
        expect(
          cast.some((npc) =>
            sameProfessionVisual(npc, reserved)
          )
        ).toBe(false);
      }
    }
  });

  it("varies the cast across lives and chapters", () => {
    const casts = new Set(
      ["life-a", "life-b", "life-c", "life-d"].flatMap((seed) =>
        PROFESSION_NPC_STAGE_IDS.map((stageId) =>
          professionNpcsForStage(seed, stageId)
            .map((npc) => npc.id)
            .join(",")
        )
      )
    );
    expect(casts.size).toBeGreaterThan(5);
  });

  it("can surface every reviewed profession, including nurse", () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 30; seed += 1) {
      for (const stageId of PROFESSION_NPC_STAGE_IDS) {
        for (const npc of professionNpcsForStage(
          `coverage-${seed}`,
          stageId
        )) {
          seen.add(npc.id);
        }
      }
    }
    expect(seen).toEqual(
      new Set(PROFESSION_ROLES.map((role) => role.id))
    );
  });

  it("builds unique interactable station options with matching fallback gender", () => {
    const options = professionLifeOptions(
      "life-a",
      "career",
      3,
      {
        uniform: "dancer",
        gender: "male",
        heritage: "western",
      }
    );
    expect(new Set(options.map((option) => option.id)).size).toBe(3);
    for (const option of options) {
      expect(option.professionNpc).toBeDefined();
      expect(option.person).toBe(
        option.professionNpc?.gender === "female"
          ? "coworker"
          : "gymBuddy"
      );
      expect(["western", "asian"]).toContain(
        option.professionNpc?.heritage
      );
      expect(
        option.professionNpc
          ? `${option.professionNpc.uniform}:${option.professionNpc.gender}:${option.professionNpc.heritage}`
          : ""
      ).not.toBe("dancer:male:western");
    }
  });
});
