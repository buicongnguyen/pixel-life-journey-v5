# V5 Storybook Background Plan

## Goal

Bring the procedural v4-era rooms closer to the warm illustrated v5 character
style without reintroducing painted perspective, mismatched collision geometry,
or the appearance that characters are standing on furniture.

The backgrounds remain responsive canvas drawings. Full-room generated images
are out of scope because their perspective and object footprints cannot follow
the game's walk bounds.

## Visual and geometry rules

- Treat every scene as a flat storybook playmat.
- Paint rear scenery first, then a clearly visible flat walk surface.
- Show at least 16 pixels of floor before the first legal family foot anchor.
- Keep raised props at the rear boundary or clipped canvas edges.
- Allow only flat decals—rugs, courts, paths, and subtle texture—in the live
  center lane.
- Use sparse, non-converging surface marks instead of perspective grids.
- Keep backgrounds softer and less saturated than the characters.
- Preserve character contact shadows and constant character scale.
- Do not derive architecture or décor from a character's race. Future replay
  variety should use independent décor packs such as cozy, garden, coastal,
  modern, or city while retaining identical geometry.

## Phase 1: implemented locally

- Added one shared portrait/landscape zone-layout calculation used by gameplay
  and visual review.
- Aligned the player's upper movement limit with the social actor floor, so the
  player cannot walk into the decorative sky, water, railing, or rear-wall band.
- Fixed the family floor/foot mismatch: the floor now begins 16 pixels before
  the first legal family foot position.
- Clamped landscape zone splits so both social and family areas retain at least
  118 pixels of walkable height. This is an intentional gameplay-layout
  migration, not only a visual change: the short canvas cannot preserve every
  requested stage proportion and the minimum height at the same time.
- Replaced strong family-floor grids with soft gradients, sparse flecks, and
  flat rugs.
- Added a coherent nursery garden for the newborn instead of silently falling
  back to the general park.
- Reworked nursery wall décor, crib, curtains, mobile, and toy storage as
  rear-bound props.
- Reworked school and office interiors so desks and furniture remain on the
  rear wall rather than occupying the walk lane.
- Moved ponds, swings, rides, cabins, umbrellas, hoops, trees, and the coffee
  stand toward safe rear/edge bands.
- Reduced the flower field to a raised rear ribbon plus flat walk-lane petals.
- Kept each life stage on one coherent background instead of rotating through
  unrelated locations every 12 seconds.
- Converted the owned-home display into a small wall picture.
- Restored a real background review route.

### Landscape rebalance contract

The portrait canvas is tall enough to follow each stage's requested family-zone
share. The landscape canvas is only 356 pixels tall between its outer actor
bounds, so the divider is clamped to keep a 48-pixel empty passage on each side
and at least 118 pixels for both actor zones.

| Stage group | Requested family share | Landscape split | Effective share |
| --- | ---: | ---: | ---: |
| Newborn through early childhood | 64% | 330 | 53.37% |
| Elementary through high school | 54% | 330 | 53.37% |
| University and career | 34% | 354 | 46.63% |
| Marriage and midlife | 42% | 354 | 46.63% |
| Senior and retirement | 50% | 342 | 50% |

The effective share is calculated from the resolved divider and is the value
layout diagnostics should report. Pixel-exact tests protect these split and
actor-bound values in both orientations, while a renderer matrix exercises
every real stage against every supported upper scene.

## Review routes

```text
avatar-preview.html?backgrounds&stage=newborn
avatar-preview.html?backgrounds&stage=newborn&guides
avatar-preview.html?backgrounds&stage=middle
avatar-preview.html?backgrounds&stage=career
avatar-preview.html?backgrounds&stage=toddler&upper=park
```

Each route renders portrait and landscape layouts together with representative
characters. `&guides` overlays the painted family-floor line and the first legal
family foot line.

## Next phases

1. Tune playroom, home, campus, senior, and retirement palettes against the new
   character atlases after a longer gameplay review.
2. Let explicit travel choices select and persist an alternate stage scene;
   ordinary play should remain stage-stable.
3. Add independent décor packs that swap curtains, rugs, wall art, and accent
   colors while preserving identical walk geometry.
4. If solid floor props are ever added, give them collision rectangles and
   ground anchors and include them in the existing depth-sorted draw list.

## Acceptance checks

- Every legal foot anchor is on or below the painted floor.
- No opaque raised prop occupies the central station rows.
- Portrait and landscape previews remain readable.
- Characters remain the strongest visual contrast.
- Type checking, all tests, production build, and browser gameplay review pass.
