# V5 storybook character atlases

These are original ImageGen assets made for Pixel Life Journey v5. No sprite,
costume, pose, or source image from Sidewalk Iced Tea is included.

## Runtime contract

- One base file and one stage-expansion file per heritage and gender; male and
  female are never mixed.
- Base canvas size: `1024 × 1280`.
- Expansion canvas size: `1024 × 768`.
- Cell size: `256 × 256`.
- Base rows: baby, child, teen, adult, elder.
- Expansion rows: early teen, young adult, middle age.
- Columns: front, screen-left profile, back, screen-right profile.
- Packed sprites retain a five-pixel safety inset. The renderer uses
  `character-anchors.json` to map each reviewed body/foot contact point to the
  world shadow, so bags, hair and canes do not make a character jump when it
  turns.

The source generations used a strict five-row/four-column turnaround prompt:
one coherent identity aging through all five rows, with an orthographic front,
true profile, back-with-no-face, and opposite-profile view; full bodies,
direction-consistent hair/outfits/accessories, warm outlined storybook-chibi
rendering, an isolated flat chroma background, and no labels, grid, shadows,
watermarks, or copied characters.

`scripts/build-character-atlases.py` packs the base sheets.
`scripts/build-character-stage-expansions.py` performs the same normalization
for the three-row expansion, including clearing enclosed chroma islands and
writing `character-stage-expansion-anchors.json`. The generated chroma sources
are working material and are intentionally not shipped.
