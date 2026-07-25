import type { Partner } from "./types";

// ---------------------------------------------------------------------------
// Marriage candidates. The Marriage & Baby stage shows these and asks the
// player to choose one. The chosen partner's modifiers are applied passively at
// every stage transition afterwards — so who you marry shapes the rest of your
// life. Eight archetypes (a mix of women and men).
//
// Partners are people, not prizes for hitting a body, IQ, or wealth threshold.
// Every candidate is available; the meaningful choice is the lifestyle each
// relationship brings to the chapters that follow.
// ---------------------------------------------------------------------------

export const PARTNERS: Partner[] = [
  {
    id: "maya",
    name: "Maya",
    title: "the Doctor",
    gender: "female",
    emoji: "👩‍⚕️",
    blurb: "Caring and brilliant. A life together supports health, with busy days along the way.",
    modifiers: { health: 3, happiness: 1 },
    moneyMod: 6000,
    storyTag: "mate_doctor",
  },
  {
    id: "leo",
    name: "Leo",
    title: "the Entrepreneur",
    gender: "male",
    emoji: "👨‍💼",
    blurb: "Ambitious and driven. Builds wealth, but works long hours.",
    modifiers: { fun: -1 },
    moneyMod: 9000,
    storyTag: "mate_entrepreneur",
  },
  {
    id: "ravi",
    name: "Ravi",
    title: "the Engineer",
    gender: "male",
    emoji: "👨‍🔧",
    blurb: "Steady and clever. A dependable, comfortable home.",
    modifiers: { smarts: 2 },
    moneyMod: 5000,
    storyTag: "mate_engineer",
  },
  {
    id: "sam",
    name: "Sam",
    title: "the Teacher",
    gender: "male",
    emoji: "👨‍🏫",
    blurb: "Patient and wise. Makes you and the kids a little smarter.",
    modifiers: { smarts: 3, happiness: 1 },
    storyTag: "mate_teacher",
  },
  {
    id: "nina",
    name: "Nina",
    title: "the Athlete",
    gender: "female",
    emoji: "🏃‍♀️",
    blurb: "Energetic and active. Life together brings movement, play and busy weekends.",
    modifiers: { health: 3, fun: 2 },
    storyTag: "mate_athlete",
  },
  {
    id: "jude",
    name: "Jude",
    title: "the Chef",
    gender: "male",
    emoji: "👨‍🍳",
    blurb: "Generous and cosy. Every meal is healthy and delicious.",
    modifiers: { health: 2, happiness: 2 },
    moneyMod: 500,
    storyTag: "mate_chef",
  },
  {
    id: "elena",
    name: "Elena",
    title: "the Traveller",
    gender: "female",
    emoji: "🧳",
    blurb: "Adventurous and joyful. You'll see the world together — if you can fund it.",
    modifiers: { fun: 3, happiness: 1 },
    moneyMod: -2000,
    storyTag: "mate_traveller",
  },
  {
    id: "aria",
    name: "Aria",
    title: "the Artist",
    gender: "female",
    emoji: "👩‍🎨",
    blurb: "Free-spirited and warm. Life together favors creativity over financial comfort.",
    modifiers: { fun: 3, happiness: 2 },
    moneyMod: -1500,
    storyTag: "mate_artist",
  },
];
