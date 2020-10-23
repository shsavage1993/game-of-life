import { GameOfLife } from "./gameOfLife.js";
// import utils from "./utils";

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
	gameOfLife.drawGrid();
});

const columns = 250;
const rows = Math.ceil(
	0.8 * (window.screen.height / window.screen.width) * columns
);
const delay = 0;

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
	"black",
	"dimgrey",
	true
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

const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");

pauseButton.addEventListener("click", () => {
	pause = true;
});

playButton.addEventListener("click", () => {
	pause = false;
	ani = requestAnimationFrame(animate);
});

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
