import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";

const CELL_SIZE = 256;
const COLUMNS = 4;
const MOTION_COLUMNS = 5;
const BASE_ROWS = 5;
const EXPANSION_ROWS = 3;
const MIN_VISIBLE_PIXELS_PER_CELL = 1_000;
const atlasDirectory = fileURLToPath(
  new URL("./assets/characters/", import.meta.url)
);
const expectedAtlases = [
  "character-atlas-asian-female.png",
  "character-atlas-asian-male.png",
  "character-atlas-black-female.png",
  "character-atlas-black-male.png",
  "character-atlas-middleEastern-female.png",
  "character-atlas-middleEastern-male.png",
  "character-atlas-western-female.png",
  "character-atlas-western-male.png",
];
const expectedExpansionAtlases = [
  "character-stage-expansion-asian-female.png",
  "character-stage-expansion-asian-male.png",
  "character-stage-expansion-black-female.png",
  "character-stage-expansion-black-male.png",
  "character-stage-expansion-middleEastern-female.png",
  "character-stage-expansion-middleEastern-male.png",
  "character-stage-expansion-western-female.png",
  "character-stage-expansion-western-male.png",
];
const expectedMotionBaseAtlases = [
  "character-motion-base-asian-female.png",
  "character-motion-base-asian-male.png",
  "character-motion-base-black-female.png",
  "character-motion-base-black-male.png",
  "character-motion-base-middleEastern-female.png",
  "character-motion-base-middleEastern-male.png",
  "character-motion-base-western-female.png",
  "character-motion-base-western-male.png",
];
const expectedMotionExpansionAtlases = [
  "character-motion-expansion-asian-female.png",
  "character-motion-expansion-asian-male.png",
  "character-motion-expansion-black-female.png",
  "character-motion-expansion-black-male.png",
  "character-motion-expansion-middleEastern-female.png",
  "character-motion-expansion-middleEastern-male.png",
  "character-motion-expansion-western-female.png",
  "character-motion-expansion-western-male.png",
];
const pngSignature = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

function paeth(left, up, upperLeft) {
  const estimate = left + up - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) {
    return left;
  }
  return upDistance <= upperLeftDistance ? up : upperLeft;
}

function decodeRgbaPng(path) {
  const png = readFileSync(path);
  if (!png.subarray(0, pngSignature.length).equals(pngSignature)) {
    throw new Error(`${path} is not a PNG file`);
  }

  let offset = pngSignature.length;
  let header;
  const imageDataChunks = [];
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > png.length) {
      throw new Error(`${path} contains a truncated ${type} chunk`);
    }

    if (type === "IHDR") {
      header = {
        width: png.readUInt32BE(dataStart),
        height: png.readUInt32BE(dataStart + 4),
        bitDepth: png[dataStart + 8],
        colorType: png[dataStart + 9],
        compression: png[dataStart + 10],
        filter: png[dataStart + 11],
        interlace: png[dataStart + 12],
      };
    } else if (type === "IDAT") {
      imageDataChunks.push(png.subarray(dataStart, dataEnd));
    } else if (type === "IEND") {
      break;
    }
    offset = dataEnd + 4;
  }

  if (!header) throw new Error(`${path} has no IHDR chunk`);
  if (
    header.bitDepth !== 8 ||
    header.colorType !== 6 ||
    header.compression !== 0 ||
    header.filter !== 0 ||
    header.interlace !== 0
  ) {
    throw new Error(
      `${path} must be an 8-bit, non-interlaced RGBA PNG; got ${JSON.stringify(header)}`
    );
  }

  const bytesPerPixel = 4;
  const rowBytes = header.width * bytesPerPixel;
  const filtered = inflateSync(Buffer.concat(imageDataChunks));
  const expectedLength = (rowBytes + 1) * header.height;
  if (filtered.length !== expectedLength) {
    throw new Error(
      `${path} inflated to ${filtered.length} bytes; expected ${expectedLength}`
    );
  }

  const rgba = Buffer.alloc(rowBytes * header.height);
  let sourceOffset = 0;
  for (let y = 0; y < header.height; y += 1) {
    const filterType = filtered[sourceOffset];
    sourceOffset += 1;
    for (let x = 0; x < rowBytes; x += 1) {
      const encoded = filtered[sourceOffset];
      sourceOffset += 1;
      const destination = y * rowBytes + x;
      const left =
        x >= bytesPerPixel ? rgba[destination - bytesPerPixel] : 0;
      const up = y > 0 ? rgba[destination - rowBytes] : 0;
      const upperLeft =
        y > 0 && x >= bytesPerPixel
          ? rgba[destination - rowBytes - bytesPerPixel]
          : 0;
      let predictor;
      switch (filterType) {
        case 0:
          predictor = 0;
          break;
        case 1:
          predictor = left;
          break;
        case 2:
          predictor = up;
          break;
        case 3:
          predictor = Math.floor((left + up) / 2);
          break;
        case 4:
          predictor = paeth(left, up, upperLeft);
          break;
        default:
          throw new Error(`${path} uses unsupported PNG filter ${filterType}`);
      }
      rgba[destination] = (encoded + predictor) & 0xff;
    }
  }

  return { ...header, rgba };
}

function visiblePixelsInCell(image, row, column) {
  let visiblePixels = 0;
  const startX = column * CELL_SIZE;
  const startY = row * CELL_SIZE;
  for (let y = startY; y < startY + CELL_SIZE; y += 1) {
    for (let x = startX; x < startX + CELL_SIZE; x += 1) {
      const alpha = image.rgba[(y * image.width + x) * 4 + 3];
      if (alpha > 8) visiblePixels += 1;
    }
  }
  return visiblePixels;
}

function visibleBoundsInCell(image, row, column) {
  const startX = column * CELL_SIZE;
  const startY = row * CELL_SIZE;
  let minX = CELL_SIZE;
  let minY = CELL_SIZE;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < CELL_SIZE; y += 1) {
    for (let x = 0; x < CELL_SIZE; x += 1) {
      const alpha =
        image.rgba[
          ((startY + y) * image.width + startX + x) * 4 + 3
        ];
      if (alpha <= 8) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return maxX < 0
    ? undefined
    : { minX, minY, maxX: maxX + 1, maxY: maxY + 1 };
}

describe("v5 character atlas assets", () => {
  it("checks in exactly the eight expected runtime atlases", () => {
    const actualAtlases = readdirSync(atlasDirectory)
      .filter((name) => /^character-atlas-.*\.png$/.test(name))
      .sort();
    expect(actualAtlases).toEqual(expectedAtlases);
  });

  for (const filename of expectedAtlases) {
    it(`${filename} is a populated 4 x 5 RGBA atlas`, () => {
      const image = decodeRgbaPng(`${atlasDirectory}/${filename}`);
      expect([image.width, image.height]).toEqual([
        COLUMNS * CELL_SIZE,
        BASE_ROWS * CELL_SIZE,
      ]);

      const populatedCells = [];
      for (let row = 0; row < BASE_ROWS; row += 1) {
        for (let column = 0; column < COLUMNS; column += 1) {
          const visiblePixels = visiblePixelsInCell(image, row, column);
          if (visiblePixels >= MIN_VISIBLE_PIXELS_PER_CELL) {
            populatedCells.push(`${row}:${column}`);
          }
        }
      }
      expect(populatedCells).toHaveLength(BASE_ROWS * COLUMNS);
    });
  }

  it("checks in exactly the eight expected stage-expansion atlases", () => {
    const actualAtlases = readdirSync(atlasDirectory)
      .filter((name) => /^character-stage-expansion-.*\.png$/.test(name))
      .sort();
    expect(actualAtlases).toEqual(expectedExpansionAtlases);
  });

  for (const filename of expectedExpansionAtlases) {
    it(`${filename} is a populated 4 x 3 RGBA atlas`, () => {
      const image = decodeRgbaPng(`${atlasDirectory}/${filename}`);
      expect([image.width, image.height]).toEqual([
        COLUMNS * CELL_SIZE,
        EXPANSION_ROWS * CELL_SIZE,
      ]);

      const populatedCells = [];
      for (let row = 0; row < EXPANSION_ROWS; row += 1) {
        for (let column = 0; column < COLUMNS; column += 1) {
          const visiblePixels = visiblePixelsInCell(image, row, column);
          if (visiblePixels >= MIN_VISIBLE_PIXELS_PER_CELL) {
            populatedCells.push(`${row}:${column}`);
          }
        }
      }
      expect(populatedCells).toHaveLength(EXPANSION_ROWS * COLUMNS);
    });
  }

  it("checks in exactly the sixteen expected motion companion atlases", () => {
    const actualAtlases = readdirSync(atlasDirectory)
      .filter((name) =>
        /^character-motion-(base|expansion)-.*\.png$/.test(name)
      )
      .sort();
    expect(actualAtlases).toEqual(
      [...expectedMotionBaseAtlases, ...expectedMotionExpansionAtlases].sort()
    );
  });

  for (const [filenames, rows, motionPrefix, neutralPrefix] of [
    [
      expectedMotionBaseAtlases,
      BASE_ROWS,
      "character-motion-base-",
      "character-atlas-",
    ],
    [
      expectedMotionExpansionAtlases,
      EXPANSION_ROWS,
      "character-motion-expansion-",
      "character-stage-expansion-",
    ],
  ]) {
    for (const filename of filenames) {
      it(`${filename} is a clean populated 5 x ${rows} RGBA atlas`, () => {
        const image = decodeRgbaPng(`${atlasDirectory}/${filename}`);
        const neutral = decodeRgbaPng(
          `${atlasDirectory}/${neutralPrefix}${filename.slice(motionPrefix.length)}`
        );
        expect([image.width, image.height]).toEqual([
          MOTION_COLUMNS * CELL_SIZE,
          rows * CELL_SIZE,
        ]);

        const populatedCells = [];
        let opaqueChromaPixels = 0;
        for (let row = 0; row < rows; row += 1) {
          for (let column = 0; column < MOTION_COLUMNS; column += 1) {
            const visiblePixels = visiblePixelsInCell(
              image,
              row,
              column
            );
            const bounds = visibleBoundsInCell(image, row, column);
            if (visiblePixels >= MIN_VISIBLE_PIXELS_PER_CELL) {
              populatedCells.push(`${row}:${column}`);
            }
            expect(bounds).toBeDefined();
            expect(bounds.minX).toBeGreaterThanOrEqual(5);
            expect(bounds.minY).toBeGreaterThanOrEqual(5);
            expect(bounds.maxX).toBeLessThanOrEqual(CELL_SIZE - 5);
            expect(bounds.maxY).toBeLessThanOrEqual(CELL_SIZE - 5);
            if (column < COLUMNS) {
              const neutralBounds = visibleBoundsInCell(
                neutral,
                row,
                column
              );
              expect(neutralBounds).toBeDefined();
              const motionHeight = bounds.maxY - bounds.minY;
              const neutralHeight =
                neutralBounds.maxY - neutralBounds.minY;
              expect(motionHeight / neutralHeight).toBeGreaterThanOrEqual(
                0.98
              );
              expect(motionHeight / neutralHeight).toBeLessThanOrEqual(
                1.05
              );
            }
          }
        }
        for (let offset = 0; offset < image.rgba.length; offset += 4) {
          const red = image.rgba[offset];
          const green = image.rgba[offset + 1];
          const blue = image.rgba[offset + 2];
          const alpha = image.rgba[offset + 3];
          if (
            alpha > 8 &&
            red >= 250 &&
            green <= 8 &&
            blue >= 250
          ) {
            opaqueChromaPixels += 1;
          }
        }
        expect(populatedCells).toHaveLength(rows * MOTION_COLUMNS);
        expect(opaqueChromaPixels).toBe(0);
      });
    }
  }
});
