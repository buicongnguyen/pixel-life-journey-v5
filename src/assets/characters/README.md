# V5 storybook character atlases

These are original ImageGen assets made for Pixel Life Journey v5. No sprite,
costume, pose, or source image from Sidewalk Iced Tea is included.

## Runtime contract

- One neutral base file, one neutral stage-expansion file, and matching motion
  companion files per heritage and gender; male and female are never mixed.
- Base canvas size: `1024 × 1280`.
- Expansion canvas size: `1024 × 768`.
- Motion-base canvas size: `1280 × 1280`.
- Motion-expansion canvas size: `1280 × 768`.
- Cell size: `256 × 256`.
- Base rows: baby, child, teen, adult, elder.
- Expansion rows: early teen, young adult, middle age.
- Neutral columns: front, screen-left profile, back, screen-right profile.
- Motion columns: front step/crawl, screen-left step/crawl, back step/crawl,
  screen-right step/crawl, front floor-seated.
- Packed sprites retain a five-pixel safety inset. The renderer uses
  `character-anchors.json` to map each reviewed body/foot contact point to the
  world shadow, so bags, hair and canes do not make a character jump when it
  turns. Motion cells use `character-motion-anchors.json`; the four movement
  roots are aligned to the corresponding neutral frame, and seated roots are
  centered on the same world ground line.

The source generations used a strict five-row/four-column turnaround prompt:
one coherent identity aging through all five rows, with an orthographic front,
true profile, back-with-no-face, and opposite-profile view; full bodies,
direction-consistent hair/outfits/accessories, warm outlined storybook-chibi
rendering, an isolated flat chroma background, and no labels, grid, shadows,
watermarks, or copied characters.

Motion companions use the same identity references and a strict five-column
contract: a strongly different mid-step/crawl beat in all four canonical
directions plus a genuine floor-seated front pose. Newborns sit upright with
their legs visible; older ages sit cross-legged or with naturally folded legs.
The prompts explicitly forbid chairs, compressed standing poses, gender
ambiguity, duplicate directions, visible faces in back views, grids, labels,
cast shadows, and copied characters. Runtime animation alternates the reviewed
neutral frame with the generated motion frame, producing a real two-frame body
cycle instead of translating one still image.

`scripts/build-character-atlases.py` packs the base sheets.
`scripts/build-character-stage-expansions.py` performs the same normalization
for the three-row expansion, including clearing enclosed chroma islands and
writing `character-stage-expansion-anchors.json`. The generated chroma sources
are working material and are intentionally not shipped.

`scripts/build-character-motion-atlases.py` packs both motion families, clears
the flat chroma key and unmistakable detached shadow fragments, normalizes
scale against the matching neutral age/direction, writes all 320 motion/seated
anchors, and validates every populated cell. Motion source generations remain
working material and are also intentionally not shipped.
