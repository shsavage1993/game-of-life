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
	gameOfLife.draw();
	gameOfLife.drawGrid();
});

const columns = 100;
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
	true,
	"white",
	"black", //for glow effect, set alpha < 1 //for rainbow aliveStyle, use deadStyle = "hsla(240, 30%, 20%, 0.5)"
	false,
	"dimgrey",
	false
);

// gameOfLife.initBlankState();
gameOfLife.initRandomState();
gameOfLife.draw();
let ani;
let pause = false;

function animate() {
	if (pause) {
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

const togglePlayButton = document.getElementById("toggle-play");
const toggleGridButton = document.getElementById("toggle-grid");
const clearCanvasButton = document.getElementById("clear-canvas");

togglePlayButton.addEventListener("click", () => {
	if (togglePlayButton.textContent === "Play") {
		runMode();
	} else {
		buildMode();
	}
});

toggleGridButton.addEventListener("click", () => {
	gameOfLife._showGrid ? gameOfLife.hideGrid() : gameOfLife.showGrid();
});

clearCanvasButton.addEventListener("click", () => {
	buildMode();
	gameOfLife.initBlankState();
	gameOfLife.draw();
});

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
		gameOfLife.draw();
	} catch {
		return;
	}
}

function runMode() {
	pause = false;
	togglePlayButton.textContent = "Pause";
	// canvas.removeEventListener("mouseover", canvasHover);
	canvas.removeEventListener("click", canvasClick);
	canvasGrid.removeEventListener("click", canvasClick);
	ani = requestAnimationFrame(animate);
}

function buildMode() {
	pause = true;
	togglePlayButton.textContent = "Play";
	// canvas.addEventListener("mouseover", canvasHover)
	canvas.addEventListener("click", canvasClick);
	canvasGrid.addEventListener("click", canvasClick);
}

// function canvasHover() {

// }

// setTimeout(() => {
// 	pause = true;
// }, 2000);

// function timeit(func) {
// 	let then = Date.now();
// 	for (let i = 0; i < 1000; i++) {
// 		func();
// 	}
// 	console.log(Date.now() - then);
// }
