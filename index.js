///@ts-check
import { gameTick, levelSize, unitsPerGridCell } from "./level-editor.js";
let changeWindow = false;
const spawnx = 0;
const spawny = 0;
let playerx = spawnx;
let playery = spawny;
let playerdy = 0;
let playerdx = 0;
let playerSize = 5;
let aIsDown = false;
let dIsDown = false;
let onSurface = false;
let playerDirection = 1;
const jumpForce = 5;
const moveForce = 0.75;
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

document.body.onkeydown = (e) => {
  if (e.key === "w" && onSurface === true) {
    playerdy = -jumpForce;
  }
  if (e.key === "d") {
    dIsDown = true;
    playerDirection = 1;
  }
  if (e.key === "a") {
    aIsDown = true;
    playerDirection = -1;
  }
};
document.body.onkeyup = (e) => {
  if (e.key === "a") {
    aIsDown = false;
  }
  if (e.key === "d") {
    dIsDown = false;
  }
};

const FPS = 60;
setInterval(() => {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2d context");
  const gameArea = canvas.getBoundingClientRect();
  ctx.scale(dpr, dpr);
  //updating
  if (dIsDown === true) {
    playerx += moveForce;
  }
  if (aIsDown === true) {
    playerx -= moveForce;
  }
  onSurface = false;
  playerdy += 0.5;
  const prevPlayerY = playery;
  playery += playerdy;
  if (playery >= levelSize.height) {
    playery = levelSize.height;
    if (playerdy > 0) {
      playerdy = 0;
      onSurface = true;
    }
  }

  //drawing

  // if (changeWindow === false) {
  //   ctx.fillStyle = "black";
  //   ctx.fillRect(0, 0, levelSize.width, levelSize.height);
  //   //ctx.fillRect(0, 0, gameArea.width, gameArea.height);
  //} else {
  gameTick(ctx);
  //}
  //camera
  ctx.save();

  // ctx.translate(
  //   -playerx + 200 - playerSize / 2,
  //   -playery + 300 - playerSize / 2
  // );
  //player
  ctx.fillStyle = "white";
  let playerAnimateSpeed = 150;
  const playerAnimateFrames = Math.round(
    performance.now() / playerAnimateSpeed
  );
  ctx.fillRect(playerx, playery - 10, 0.5 * playerSize, 2 * playerSize);
  ctx.restore;
}, 1000 / FPS);
