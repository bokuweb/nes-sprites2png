#!/usr/bin/env node

'use strict';

const fs = require('fs');
const Canvas = require('canvas');

const NES_HEADER_SIZE = 0x0010;
const PROGRAM_ROM_SIZE = 0x4000;
const CHARACTOR_ROM_SIZE = 0x2000;
const DEFAULT_CANVAS_WIDTH = 800;

const NES_PATH = process.argv[2];
const DIST_PATH = process.argv[3] || 'sprite.png';
const PIXEL_RATIO = ~~(process.argv[4] || 1);

let nes;
try {
  nes = fs.readFileSync(NES_PATH);
} catch (error) {
  throw new Error(error);
}

if ([].slice.call(nes, 0, 3).map(v => String.fromCharCode(v)).join('') !== 'NES') {
  throw new Error(`${NES_PATH} is not an NES file.`);
}

const programROMPages = nes[4];
const characterROMPages = nes[5];
const spritesPerRow = DEFAULT_CANVAS_WIDTH / (8 * PIXEL_RATIO);
const spritesNum = CHARACTOR_ROM_SIZE * characterROMPages / 16;
const rowNum = ~~(spritesNum / spritesPerRow) + 1;

const height = rowNum * 8 * PIXEL_RATIO;
const canvas = new Canvas(DEFAULT_CANVAS_WIDTH, height);
const ctx = canvas.getContext('2d');

ctx.fillStyle = "rgb(0, 0, 0)";
ctx.fillRect(0, 0, DEFAULT_CANVAS_WIDTH, height);

const charactorROMsart = NES_HEADER_SIZE + programROMPages * PROGRAM_ROM_SIZE;
const buildSprite = (spriteNum) => {
  const sprite = Array.apply(null, Array(8)).map((_) => [0,0,0,0,0,0,0,0]);
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 8; j++) {
      if (nes[charactorROMsart + spriteNum * 16 + i] & (0x80 >> j )) {
        sprite[i % 8][j] = sprite[i % 8][j] ? 3 : 1;
      }
    }
  }
  return sprite;
}
const renderSprite = (sprite, spriteNum) => {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      ctx.fillStyle = `rgb(${85 * sprite[i][j]}, ${85 * sprite[i][j]}, ${85 * sprite[i][j]})`;
      const x = (j + (spriteNum % spritesPerRow) * 8) * PIXEL_RATIO;
      const y = (i + ~~(spriteNum / spritesPerRow) * 8) * PIXEL_RATIO;
      ctx.fillRect(x, y, PIXEL_RATIO, PIXEL_RATIO);
    }
  }
};

for(let i = 0; i < spritesNum; i++) {
  const sprite =  buildSprite(i);
  renderSprite(sprite, i);
}

const data = canvas.toDataURL().split(',')[1];
const buffer = new Buffer(data, 'base64');
fs.writeFileSync(DIST_PATH, buffer);
