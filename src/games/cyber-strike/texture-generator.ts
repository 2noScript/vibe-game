import * as THREE from 'three';

export const createPixelTexture = (pixels: string[], colorMap: Record<string, string>) => {
  const width = pixels[0].length;
  const height = pixels.length;
  const size = width * height;
  const data = new Uint8Array(4 * size);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const char = pixels[y][x];
      const colorHex = colorMap[char];
      const i = ((height - 1 - y) * width + x) * 4;

      if (colorHex) {
        const color = new THREE.Color(colorHex);
        data[i] = color.r * 255;
        data[i + 1] = color.g * 255;
        data[i + 2] = color.b * 255;
        data[i + 3] = 255;
      } else {
        data[i + 3] = 0;
      }
    }
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
};

export const PLAYER_SHIP_PIXELS = [
  "    C    ",
  "   CCC   ",
  "  CCCCC  ",
  " CCHHHCC ",
  "CCCCWCCCC",
  "CC C C CC",
  "C  B B  C"
];

export const ENEMY_DRONE_PIXELS = [
  "  RRR  ",
  " RRRRR ",
  "RRMRMRR",
  " RRRRR ",
  "  R R  "
];

export const ENEMY_INTERCEPTOR_PIXELS = [
  "   G   ",
  "  GGG  ",
  " GGGGG ",
  "GG G GG",
  "G     G"
];

export const ENEMY_TURRET_PIXELS = [
  "  YYY  ",
  " YYYYY ",
  "YYMYMYY",
  " YYYYY ",
  "  YYY  "
];

export const BOSS_PIXELS = [
  "    MMMMM    ",
  "   MMMMMMM   ",
  "  MMMMMMMMM  ",
  " MMMMMMMMMMM ",
  "MMMMWMMMWMMMM",
  "MMMMMMMMMMMMM",
  " MMMMMMMMMMM ",
  "  MMM   MMM  ",
  " M       M "
];

export const BULLET_PIXELS = [
  "W",
  "C"
];

export const ENEMY_BULLET_PIXELS = [
  "R",
  "M"
];

export const POWERUP_SPREAD_PIXELS = [
  " CCC ",
  "C W C",
  " CCC "
];

export const POWERUP_RAPID_PIXELS = [
  " YYY ",
  "Y W Y",
  " YYY "
];

export const COLOR_MAP = {
  'R': '#ff2d55', // Cyber Red
  'W': '#ffffff', // White
  'G': '#32ff7e', // Cyber Green
  'Y': '#fffa65', // Cyber Yellow
  'B': '#18dcff', // Cyber Blue
  'C': '#7efff5', // Cyber Cyan
  'M': '#c56cf0', // Cyber Purple
  'H': '#4b4b4b', // Dark Gray
};
