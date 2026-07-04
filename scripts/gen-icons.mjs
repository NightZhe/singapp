// 產生 PWA 佔位圖示(靛藍底 + 白色音符),免外部依賴的最小 PNG 編碼器
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

function makeIcon(size) {
  const px = Buffer.alloc(size * size * 4);
  const bg = [79, 70, 229]; // indigo-600
  const fg = [255, 255, 255];
  const cx = size * 0.42, cy = size * 0.62, r = size * 0.15;
  const stemX0 = cx + r * 0.75, stemX1 = stemX0 + size * 0.045;
  const stemY0 = size * 0.24, stemY1 = cy;
  const flagY1 = stemY0 + size * 0.1;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let c = bg;
      const inHead = (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
      const inStem = x >= stemX0 && x <= stemX1 && y >= stemY0 && y <= stemY1;
      const inFlag =
        y >= stemY0 && y <= flagY1 && x >= stemX1 && x <= stemX1 + (flagY1 - y) * 1.2;
      if (inHead || inStem || inFlag) c = fg;
      const i = (y * size + x) * 4;
      px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255;
    }
  }

  // 每列前置 filter byte 0
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

mkdirSync(new URL("../public/icons/", import.meta.url), { recursive: true });
for (const size of [192, 512]) {
  writeFileSync(new URL(`../public/icons/icon-${size}.png`, import.meta.url), makeIcon(size));
  console.log(`✓ public/icons/icon-${size}.png`);
}
