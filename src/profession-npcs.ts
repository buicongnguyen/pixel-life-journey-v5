import type {
  Gender,
  HeritageStyle,
  JobUniform,
  LifeOption,
  ProfessionNpcSpec,
  Stats,
} from "./types";

type ProfessionHeritage = Extract<
  HeritageStyle,
  "western" | "asian"
>;

interface ProfessionRole {
  id: string;
  label: string;
  icon: string;
  uniform: JobUniform;
  desc: string;
  effects: Partial<Stats>;
}

export interface ProfessionNpc extends ProfessionNpcSpec {
  label: string;
  icon: string;
  desc: string;
  effects: Partial<Stats>;
}

/**
 * The nurse uses the reviewed medical-scrubs character sheet shared with the
 * doctor. Its label, interaction copy, gender, and heritage remain independent.
 */
export const PROFESSION_ROLES: readonly ProfessionRole[] = [
  {
    id: "doctor",
    label: "Doctor",
    icon: "🩺",
    uniform: "doctor",
    desc: "Meet a doctor between rounds and hear what caring for patients is really like.",
    effects: { health: 4, smarts: 2, happiness: 1 },
  },
  {
    id: "nurse",
    label: "Nurse",
    icon: "🩹",
    uniform: "doctor",
    desc: "Chat with a nurse whose skill and kindness keep a busy ward moving.",
    effects: { health: 4, happiness: 3 },
  },
  {
    id: "trainer",
    label: "Gym trainer",
    icon: "🏋️",
    uniform: "trainer",
    desc: "Meet a gym trainer who makes strength and confidence feel achievable.",
    effects: { health: 6, happiness: 2, fun: 2 },
  },
  {
    id: "dancer",
    label: "Dancer",
    icon: "🩰",
    uniform: "dancer",
    desc: "Talk with a professional dancer about practice, courage, and life on stage.",
    effects: { health: 3, happiness: 3, fun: 5 },
  },
  {
    id: "soldier",
    label: "Army soldier",
    icon: "🪖",
    uniform: "soldier",
    desc: "Meet a soldier and learn how discipline and teamwork shape a working life.",
    effects: { health: 4, smarts: 2, happiness: 1 },
  },
  {
    id: "farmer",
    label: "Farmer",
    icon: "🌾",
    uniform: "farmer",
    desc: "Meet a farmer who works with the seasons and grows food for the community.",
    effects: { health: 4, happiness: 3, fun: 2 },
  },
] as const;

export const PROFESSION_NPC_STAGE_IDS = [
  "career",
  "marriage",
  "midlife",
  "senior",
  "retirement",
] as const;

const PROFESSION_NPC_STAGES = new Set<string>(
  PROFESSION_NPC_STAGE_IDS
);
const PROFESSION_HERITAGES: readonly ProfessionHeritage[] = [
  "western",
  "asian",
];
const PROFESSION_GENDERS: readonly Gender[] = [
  "male",
  "female",
];

function stableHash(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function stageHasProfessionNpcs(stageId: string): boolean {
  return PROFESSION_NPC_STAGES.has(stageId);
}

/**
 * Pick a stable random-looking adult cast. Rebuilding the room, rotating the
 * device, saving, or rewinding cannot change the people for that life chapter.
 */
export function professionNpcsForStage(
  lifeSeed: string,
  stageId: string,
  count = 3
): ProfessionNpc[] {
  if (!stageHasProfessionNpcs(stageId) || count <= 0) return [];
  const ordered = [...PROFESSION_ROLES].sort((a, b) => {
    const aRank = stableHash(
      `${lifeSeed}:${stageId}:profession-order:${a.id}`
    );
    const bRank = stableHash(
      `${lifeSeed}:${stageId}:profession-order:${b.id}`
    );
    return aRank - bRank || a.id.localeCompare(b.id);
  });
  const selected = ordered.slice(
    0,
    Math.min(Math.floor(count), ordered.length)
  );
  const firstGender =
    stableHash(`${lifeSeed}:${stageId}:profession-gender`) % 2;
  const firstHeritage =
    stableHash(`${lifeSeed}:${stageId}:profession-heritage`) % 2;
  const usedVisuals = new Set<string>();

  return selected.map((role, index) => {
    let gender =
      PROFESSION_GENDERS[(firstGender + index) % 2];
    let heritage =
      PROFESSION_HERITAGES[(firstHeritage + index) % 2];
    // Doctor and nurse intentionally share reviewed medical art. When both are
    // selected, choose a different explicit gender/heritage sheet so they can
    // never become pixel-identical people.
    for (let variant = 0; variant < 4; variant += 1) {
      const candidateGender =
        PROFESSION_GENDERS[
          (firstGender + index + Math.floor(variant / 2)) % 2
        ];
      const candidateHeritage =
        PROFESSION_HERITAGES[
          (firstHeritage + index + variant) % 2
        ];
      const visualKey =
        `${role.uniform}:${candidateGender}:${candidateHeritage}`;
      if (!usedVisuals.has(visualKey)) {
        gender = candidateGender;
        heritage = candidateHeritage;
        usedVisuals.add(visualKey);
        break;
      }
    }
    return {
      ...role,
      gender,
      heritage,
    };
  });
}

export function professionLifeOptions(
  lifeSeed: string,
  stageId: string,
  count = 3
): LifeOption[] {
  return professionNpcsForStage(lifeSeed, stageId, count).map(
    (profession) => ({
      id: `profession-${stageId}-${profession.id}`,
      label: profession.label,
      icon: profession.icon,
      person:
        profession.gender === "female"
          ? "coworker"
          : "gymBuddy",
      professionNpc: {
        id: profession.id,
        uniform: profession.uniform,
        gender: profession.gender,
        heritage: profession.heritage,
      },
      desc: profession.desc,
      category: "social",
      effects: profession.effects,
      storyTag: `profession_${profession.id}`,
    })
  );
}
