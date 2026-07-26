import { describe, expect, it } from "vitest";
import {
  ROOM_LANDSCAPE,
  ROOM_PORTRAIT,
  roomZoneGeometry,
} from "./background-layout";
import { STAGES } from "./stages";
import { drawRoom } from "./sprites";
import type { UpperSceneKind } from "./types";

const upperScenes: UpperSceneKind[] = [
  "nurseryGarden",
  "park",
  "amusementPark",
  "schoolIndoor",
  "schoolOutdoor",
  "campusIndoor",
  "campusOutdoor",
  "officeIndoor",
  "officeOutdoor",
  "mountain",
  "beach",
  "ship",
  "flowerField",
];

interface RecordedCall {
  name: string;
  args: unknown[];
}

function recordingContext(): {
  context: CanvasRenderingContext2D;
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];
  const target: Record<PropertyKey, unknown> = {};
  const gradient = {
    addColorStop: (...args: unknown[]) => {
      calls.push({ name: "addColorStop", args });
    },
  };
  const context = new Proxy(target, {
    get(object, property) {
      if (property === "createLinearGradient" ||
          property === "createRadialGradient") {
        return (...args: unknown[]) => {
          calls.push({ name: String(property), args });
          return gradient;
        };
      }
      if (property === "measureText") {
        return (text: string) => ({
          width: text.length * 6,
        });
      }
      if (!(property in object)) {
        object[property] = (...args: unknown[]) => {
          calls.push({ name: String(property), args });
        };
      }
      return object[property];
    },
    set(object, property, value) {
      object[property] = value;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  return { context, calls };
}

describe("background renderer matrix", () => {
  it("draws every real stage and upper scene in both layouts with finite geometry", () => {
    for (const room of [ROOM_PORTRAIT, ROOM_LANDSCAPE]) {
      for (const stage of STAGES) {
        for (const upperScene of upperScenes) {
          const { context, calls } = recordingContext();
          const geometry = roomZoneGeometry(room, stage.id);
          drawRoom(
            context,
            stage.theme,
            room.W,
            room.H,
            room.FLOOR_Y,
            false,
            2.4,
            {
              scene: stage.scene,
              upperScene,
              atHome: true,
              homeQuality: 5,
              splitY: geometry.splitY,
              ownedVehicles: [
                { id: "bicycle", name: "Bicycle" },
                { id: "sportscar", name: "Sports car" },
              ],
              ownedHome: {
                id: "villa",
                name: "Luxury villa",
                quality: 5,
              },
            }
          );

          expect(calls.length).toBeGreaterThan(50);
          for (const call of calls) {
            for (const argument of call.args) {
              if (typeof argument === "number") {
                expect(
                  Number.isFinite(argument),
                  `${stage.id}/${stage.scene}/${upperScene} ${call.name}`
                ).toBe(true);
              }
            }
          }
        }
      }
    }
  });
});
