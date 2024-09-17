///@ts-check
import { gameTick, levelSize, unitsPerGridCell } from "./level-editor.js";
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const FPS = 60;
setInterval(() => {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2d context");
  const gameArea = canvas.getBoundingClientRect();
  ctx.scale(dpr, dpr);
  gameTick(ctx);
}, 1000 / FPS);
