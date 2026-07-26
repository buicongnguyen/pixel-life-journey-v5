# Occupation character atlases

These assets add a visibly different adult occupation cast to the v5 career
picker without replacing the player's chosen face, hair, or everyday outfit.
Only Asian and Western representatives are included in this set, matching the
requested scope. Other heritages retain the existing emoji career cards.

## Runtime contract

- Jobs: `doctor`, `trainer`, `dancer`, `soldier`, `farmer`
- Heritages: `western`, `asian`
- Genders: `male`, `female`
- One physically separate PNG for every job/heritage/gender combination
- Atlas size: `2048 × 256`
- Cell size: `256 × 256`
- Columns:
  1. front neutral
  2. screen-left neutral
  3. back neutral
  4. screen-right neutral
  5. front walking step
  6. screen-left walking step
  7. back walking step
  8. screen-right walking step

Doctors and farmers are deliberately middle-aged. Trainers, dancers, and
soldiers are adults. `occupation-anchors.json` records the reviewed age and
per-cell ground anchors.

## Production

The eight versioned authoring sheets live under the `source/` folder: neutral
and motion sheets for Western male/female and Asian male/female. Keeping the
inputs with the runtime assets makes a clean-clone rebuild reproducible. They
were created with the built-in ImageGen workflow on a flat `#ff00ff` screen.
The shared prompt contract required:

- exactly four columns and five rows;
- doctor, fitness trainer, dancer, unarmed soldier, and tool-free farmer rows;
- front, true left profile, faceless back, and true right profile columns;
- separate male and female generations;
- respectful modern Asian and Western identities;
- full-body adult storybook/chibi figures at compact 3.5–4-head proportions,
  using the Western male sheet as the shared style and silhouette reference,
  with identical identity and clothing across neutral and walking sheets;
- no text, logos, flags, weapons, floor, embedded shadow, or watermark.

Rebuild the checked-in alpha atlases and anchors with:

```text
python scripts/build-occupation-atlases.py
```

The builder removes connected and enclosed chroma, detects the authored four
column and five row bands from their transparent gaps, normalizes every figure
into a five-pixel safety inset, aligns the feet, computes ground anchors,
validates the complete 20-file set in staging, and publishes the manifest last.

## Review

- `avatar-preview.html?occupations` shows every occupation and identity.
- `avatar-preview.html?occupations&job=doctor` shows all eight doctor frames.
- Replace `doctor` with `trainer`, `dancer`, `soldier`, or `farmer` for the
  other detail matrices.

The source sheets are intentionally versioned alongside their prompt contract,
builder, transparent runtime atlases, and anchor manifest.
