import { GameOfLife } from "./gameOfLife.js";

const canvas = document.getElementById("gol-canvas");
const ctx = canvas.getContext("2d");
const canvasGrid = document.getElementById("gol-grid-canvas");
const ctxGrid = canvasGrid.getContext("2d");
const windowScreenRatio = () => {
	return (0.8 * window.innerWidth) / window.screen.width;
};
canvas.width = window.innerWidth - 8;
canvas.height = windowScreenRatio() * window.screen.height;
canvasGrid.width = window.innerWidth - 8;
canvasGrid.height = windowScreenRatio() * window.screen.height;

window.addEventListener("resize", () => {
	canvas.width = window.innerWidth - 8;
	canvas.height = windowScreenRatio() * window.screen.height;
	canvasGrid.width = window.innerWidth - 8;
	canvasGrid.height = windowScreenRatio() * window.screen.height;
	if (pause) {
		gameOfLife.draw(true);
		drawCell(...selectedCell);
	} else {
		gameOfLife.draw();
	}
	gameOfLife.drawGrid();
});

/* ---------- Game Of Life ---------- */

const columns = 250;
const rows = Math.ceil(
	0.8 * (window.screen.height / window.screen.width) * columns
);
const delay = 75;

let gameOfLife = new GameOfLife(
	canvas,
	ctx,
	canvasGrid,
	ctxGrid,
	rows,
	columns,
	100,
	true, // Modulus Grid
	// for glow effect, set alpha < 1
	//for rainbow aliveStyle, use deadStyle = "hsla(240, 30%, 20%, 0.5)"
	"rainbow",
	"hsla(240, 30%, 20%, 0.5)",
	true, // add glow
	"dimgrey",
	false // show grid
);

gameOfLife.initRandomState();
gameOfLife.draw();
let ani;
let pause = false;

function animate() {
	if (pause) {
		gameOfLife.draw(true); //bwMode ON
		drawCell(...selectedCell);
		return;
	}
	gameOfLife.update();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	gameOfLife.draw();

	setTimeout(() => {
		ani = requestAnimationFrame(animate);
	}, delay);
}

setTimeout(() => {
	ani = requestAnimationFrame(animate);
}, delay);

/* ---------- Button Functions ---------- */

const togglePlayButton = document.getElementById("toggle-play");
const toggleGridButton = document.getElementById("toggle-grid");
const clearCanvasButton = document.getElementById("clear-canvas");

togglePlayButton.addEventListener("click", () => {
	if (togglePlayButton.textContent === "Play") {
		runMode();
	} else {
		buildMode();
	}
	togglePlayButton.blur();
});

toggleGridButton.addEventListener("click", () => {
	gameOfLife._showGrid ? gameOfLife.hideGrid() : gameOfLife.showGrid();
});

clearCanvasButton.addEventListener("click", () => {
	gameOfLife.initBlankState();
	gameOfLife.draw(true); //bwMode ON
	drawCell(...selectedCell);
	buildMode();
	clearCanvasButton.blur();
});

/* ---------- Event Listener Helper Functions ---------- */

const selectedCell = [0, 0]; // [row,col]

function runMode() {
	pause = false;
	toggleGridButton.disabled = false;
	togglePlayButton.textContent = "Pause";

	gameOfLife._showGrid ? gameOfLife.showGrid() : gameOfLife.hideGrid();

	canvas.removeEventListener("click", canvasClick);
	canvasGrid.removeEventListener("click", canvasClick);

	ani = requestAnimationFrame(animate);
}

function buildMode() {
	pause = true;
	toggleGridButton.disabled = true;
	togglePlayButton.textContent = "Play";

	canvasGrid.style.display = "block"; //Show grid in build mode

	canvas.addEventListener("click", canvasClick);
	canvasGrid.addEventListener("click", canvasClick);
	window.addEventListener("keydown", canvasSelectCell);
}

function canvasClick(evt) {
	const cellSize = gameOfLife.cellSize;
	console.log(`Cellsize: ${cellSize}`);
	const rect = canvas.getBoundingClientRect();

	console.log(
		`X: ${evt.pageX - rect.left - gameOfLife.gridLeft}, Y: ${
			evt.pageY - rect.top - gameOfLife.gridTop
		}`
	);
	const row = Math.floor(
		(evt.pageY - rect.top - gameOfLife.gridTop) / cellSize
	);
	const col = Math.floor(
		(evt.pageX - rect.left - gameOfLife.gridLeft) / cellSize
	);
	try {
		gameOfLife.cellArray[row][col] = gameOfLife.cellArray[row][col] ? 0 : 1;
		console.log(`row: ${row}, col: ${col}`);
		gameOfLife.draw(true); //bwMode ON
		drawCell(...selectedCell);
	} catch {
		return;
	}
}

function canvasSelectCell(evt) {
	const rows = gameOfLife.rows;
	const cols = gameOfLife.cols;
	const [row, col] = selectedCell;

	switch (evt.code) {
		case "ArrowLeft":
			selectedCell[1] = (col + cols - 1) % cols;
			break;
		case "ArrowRight":
			selectedCell[1] = (col + cols + 1) % cols;
			break;
		case "ArrowUp":
			selectedCell[0] = (row + rows - 1) % rows;
			break;
		case "ArrowDown":
			selectedCell[0] = (row + rows + 1) % rows;
			break;
		case "Space":
			gameOfLife.cellArray[row][col] = gameOfLife.cellArray[row][col]
				? 0
				: 1;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	gameOfLife.draw(true);
	drawCell(...selectedCell);
}

function drawCell(row, col) {
	const cellSize = gameOfLife.cellSize;
	const gridTop = gameOfLife.gridTop;
	const gridLeft = gameOfLife.gridLeft;

	ctx.fillStyle = gameOfLife.cellArray[row][col] ? "red" : "green";
	ctx.fillRect(
		gridLeft + col * cellSize,
		gridTop + row * cellSize,
		cellSize + 1,
		cellSize + 1
	);
}
