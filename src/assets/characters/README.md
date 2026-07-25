# V5 storybook character atlases

These are original ImageGen assets made for Pixel Life Journey v5. No sprite,
costume, pose, or source image from Sidewalk Iced Tea is included.

## Runtime contract

- One file per heritage and gender; male and female are never mixed.
- Canvas size: `1024 × 1280`.
- Cell size: `256 × 256`.
- Rows: baby, child, teen, adult, elder.
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

`scripts/build-character-atlases.py` removes border-connected chroma, finds the
real gaps in a generated sheet, trims each figure, canonicalizes profile
directions, repairs reviewed green-key remnants, mirrors the rare duplicated
profile into a true opposite side, and packs the runtime files. The generated
chroma sources are working material and are intentionally not shipped.
