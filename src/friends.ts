import { STAGES } from "./stages";
import type {
  HeritageStyle,
  PersonKind,
} from "./types";

export const SAME_STAGE_PEER_KINDS = [
  "playmate",
  "studyFriend",
  "bestFriend",
  "crush",
  "smokerFriend",
  "gangster",
  "playboy",
  "roommate",
  "gymBuddy",
] as const satisfies readonly PersonKind[];

const SAME_STAGE_PEERS = new Set<PersonKind>(
  SAME_STAGE_PEER_KINDS
);
const SCHOOL_STAGE_IDS = new Set([
  "elementary",
  "middle",
  "high",
  "university",
]);
const PEER_HERITAGES: readonly HeritageStyle[] = [
  "western",
  "asian",
  "middleEastern",
  "black",
];

export function isSameStagePeerKind(
  kind: PersonKind
): boolean {
  return SAME_STAGE_PEERS.has(kind);
}

/** Keep legacy and newly generated school friends inside the current stage. */
export function friendAgeForStage(
  playerAge: number,
  stageIndex: number,
  ageOffset: number
): number {
  const rounded = Math.max(
    0,
    Math.round(playerAge + ageOffset)
  );
  const stage = STAGES[stageIndex];
  if (!stage || !SCHOOL_STAGE_IDS.has(stage.id)) return rounded;
  return Math.max(
    stage.ageStart,
    Math.min(stage.ageEnd - 1, rounded)
  );
}

/** Give recurring peer roles a stable heritage independent of their age. */
export function peerHeritage(
  lifeSeed: string,
  kind: PersonKind
): HeritageStyle {
  const text = `${lifeSeed}:${kind}:heritage`;
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return PEER_HERITAGES[(hash >>> 0) % PEER_HERITAGES.length];
}
