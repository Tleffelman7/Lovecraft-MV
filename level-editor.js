// CONSTANTS
////////////////

export const levelSize = {
  width: 160,
  height: 90,
};
export const unitsPerGridCell = 5;
const rowGridCells = levelSize.width / unitsPerGridCell;
const colGridCells = levelSize.height / unitsPerGridCell;
const colors = ["black", "#6F4E37", "red", "green", "purple"];
let colorPen = 0;

// LEVEL EDITOR STATE
////////////////
const state = {
  level: [],
  cursorPosition: { x: 0, y: 0 },
  leftClicking: false,
  rightClicking: false,

  game: {
    player: {
      grounded: false,
      x: 0,
      y: 0,
      dy: 0,
      dx: 0,
      width: unitsPerGridCell,
      height: unitsPerGridCell,
    },
  },
};

const keysDown = new Set();
const keysJustPressed = new Set();
document.addEventListener("keydown", (e) => {
  keysDown.add(e.key);
  keysJustPressed.add(e.key);
});
document.addEventListener("keyup", (e) => keysDown.delete(e.key));

for (let i = 0; i < rowGridCells; i++) {
  state.level.push([]);
  for (let j = 0; j < colGridCells; j++) {
    state.level[i].push(j === 17 ? 1 : 0);
  }
}

const rowSize = 4;

/**
 * @param {CanvasRenderingContext2D} ctx
 */
export function gameTick(ctx) {
  // UPDATE
  //////////////
  const x = Math.floor(state.cursorPosition.x / unitsPerGridCell);
  const y = Math.floor(state.cursorPosition.y / unitsPerGridCell);
  const inBounds = x >= 0 && x < rowGridCells && y >= 0 && y < colGridCells;
  if (inBounds) {
    if (state.rightClicking) {
      state.level[x][y] = 0;
    }
    if (state.leftClicking) {
      state.level[x][y] = colorPen;
    }
  }

  // GAME UPDATE
  //////////////
  const player = state.game.player;
  handleCollision();
  keysJustPressed.clear();

  // DRAW
  //////////////
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, levelSize.width, levelSize.height);
  ctx.fillStyle = "black";
  drawGrid(ctx);
  ctx.fillStyle = "white";
  ctx.fillRect(
    state.game.player.x,
    state.game.player.y,
    state.game.player.width,
    state.game.player.height
  );
}

/**
 * @param {CanvasRenderingContext2D} ctx
 */
function drawGrid(ctx) {
  for (let i = 0; i < rowGridCells; i++) {
    for (let j = 0; j < colGridCells; j++) {
      ctx.fillStyle = colors[state.level[i][j]];
      ctx.fillRect(
        i * unitsPerGridCell,
        j * unitsPerGridCell,
        unitsPerGridCell,
        unitsPerGridCell
      );
    }
  }

  ctx.strokeStyle = "#bbb";
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 0.5;
  for (let x = 0; x < levelSize.width; x += unitsPerGridCell) {
    ctx.beginPath();
    ctx.lineTo(x, 0);
    ctx.lineTo(x, levelSize.height);
    ctx.stroke();
  }
  for (let y = 0; y < levelSize.height; y += unitsPerGridCell) {
    ctx.beginPath();
    ctx.lineTo(0, y);
    ctx.lineTo(levelSize.width, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

document.oncontextmenu = (e) => {
  e.preventDefault();
};

document.onpointerdown = (e) => {
  if (e.button === 0) {
    state.leftClicking = true;
  }
  if (e.button === 2) {
    state.rightClicking = true;
  }
};

document.onpointerup = (e) => {
  if (e.button === 0) {
    state.leftClicking = false;
  }
  if (e.button === 2) {
    state.rightClicking = false;
  }
};

document.onpointermove = (e) => {
  state.cursorPosition.x = e.clientX;
  state.cursorPosition.y = e.clientY;
};

let levels = JSON.parse(localStorage.getItem("levels")) || [];
document.onkeydown = (e) => {
  if (e.key === "s") {
    // console.log(JSON.stringify(state.level));
    const name = prompt("Enter level name to save");
    localStorage.setItem(name, JSON.stringify(state.level));
    levels.push(name);
    // delete duplicates
    const uniqueLevels = [...new Set(levels)];
    levels = uniqueLevels;
    localStorage.setItem("levels", JSON.stringify(levels));
  }

  if (e.key === "l") {
    const name = prompt("Enter level name to load");
    const level = JSON.parse(localStorage.getItem(name));
    if (!level) {
      alert("Level not found");
    } else if (level) {
      state.level = level;
    }
  }

  // list levels
  if (e.key === "p") {
    alert(levels.join(", "));
  }
  if (e.key === "1") {
    colorPen = 0;
  }
  if (e.key === "2") {
    colorPen = 1;
  }
  if (e.key === "3") {
    colorPen = 2;
  }
  if (e.key === "4") {
    colorPen = 3;
  }
  if (e.key === "5") {
    colorPen = 4;
  }
};

function handleCollision() {
  const player = state.game.player;
  // console.log(player.y);
  const gravity = 0.2;

  let newY = player.y;
  const jumpKeys = ["w", "ArrowUp"];
  if (jumpKeys.some((key) => keysJustPressed.has(key)) && player.grounded) {
    player.dy = -3;
  }
  player.dy += gravity;
  newY += player.dy;

  // if (newY > levelSize.height - player.height) {
  //   newY = levelSize.height - player.height;
  //   player.dy = 0;
  // }

  //console.log(keysDown);
  let newX = player.x;
  const leftKeys = ["a", "ArrowLeft"];
  if (leftKeys.some((key) => keysDown.has(key))) newX -= 1;
  const rightKeys = ["d", "ArrowRight"];
  if (rightKeys.some((key) => keysDown.has(key))) newX += 1;

  {
    let touchingBlock = false;
    for (let i = 0; i < rowGridCells; i++) {
      for (let j = 0; j < colGridCells; j++) {
        const blockX = i * unitsPerGridCell;
        const blockY = j * unitsPerGridCell;
        if (
          state.level[i][j] === 1 &&
          playerTouchingTile(newX, player.y, blockX, blockY)
        ) {
          touchingBlock = true;

          const dx = newX - player.x;
          if (dx >= 0) {
            player.x = blockX - player.width;
          } else {
            player.x = blockX + unitsPerGridCell;
          }

          break;
        }
      }
    }

    if (touchingBlock) {
    } else {
      player.x = newX;
    }
  }

  {
    // handling the Y direction
    let touchingBlock = false;
    for (let i = 0; i < rowGridCells; i++) {
      for (let j = 0; j < colGridCells; j++) {
        const blockX = i * unitsPerGridCell;
        const blockY = j * unitsPerGridCell;
        if (
          state.level[i][j] === 1 &&
          playerTouchingTile(player.x, newY, blockX, blockY)
        ) {
          touchingBlock = true;

          if (player.dy >= 0) {
            player.y = blockY - player.height;
            player.grounded = true;
          } else {
            player.y = blockY + unitsPerGridCell;
          }

          break;
        }
      }
    }

    player.grounded = false;
    if (!touchingBlock) {
      player.y = newY;
    } else {
      if (player.dy > 0) {
        player.dy = 0;
        player.grounded = true;
      } else {
        player.dy = 0;
      }
    }
  }

  return false;
}

function playerTouchingTile(px, py, tileX, tileY) {
  return (
    px < tileX + unitsPerGridCell &&
    px + state.game.player.width > tileX &&
    py < tileY + unitsPerGridCell &&
    py + state.game.player.height > tileY
  );
}
