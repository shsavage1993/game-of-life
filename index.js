import { GameOfLife } from './gameOfLife.js';

const controlsDiv = document.getElementById('controls-div');
const golStage = document.getElementById('gol-stage');
const canvas = document.getElementById('gol-canvas');
const canvasGrid = document.getElementById('gol-grid-canvas');
const ctx = canvas.getContext('2d');
const ctxGrid = canvasGrid.getContext('2d');

const resInput = document.getElementById('min-res-input');
const rowsInput = document.getElementById('rows-input');
const colsInput = document.getElementById('cols-input');

resizeCanvas();

window.addEventListener('resize', () => {
	resizeCanvas();
	if (pause) {
		gameOfLife.draw(true);
		drawSelectedCell(...selectedCell);
	} else {
		gameOfLife.draw();
	}
	gameOfLife.drawGrid();
});

/* ---------- Game Of Life ---------- */
const selectedCell = [0, 0]; // [row,col]

// Set initial max res, rows and cols
let minRes = 8;
let rows = Math.floor(canvas.getBoundingClientRect().height / minRes);
let columns = Math.floor(canvas.getBoundingClientRect().width / minRes);

resInput.value = minRes;
rowsInput.value = rows;
colsInput.value = columns;

const delay = 75;

let gameOfLife = new GameOfLife(
	canvas,
	ctx,
	canvasGrid,
	ctxGrid,
	rows,
	columns,
	minRes,
	true, // Modulus Grid
	// for glow effect, set alpha < 1
	//for rainbow aliveStyle, use deadStyle = "hsla(240, 30%, 20%, 0.5)"
	'rainbow',
	'hsla(240, 30%, 20%, 0.5)',
	true, // add glow
	'dimgrey',
	false // show grid
);

gameOfLife.initRandomState();
gameOfLife.draw();
let ani;
let pause = false;

function animate() {
	if (pause) {
		gameOfLife.draw(true); //bwMode ON
		drawSelectedCell(...selectedCell);
		return;
	}
	gameOfLife.update();
	gameOfLife.draw();

	setTimeout(() => {
		ani = requestAnimationFrame(animate);
	}, delay);
}

setTimeout(() => {
	ani = requestAnimationFrame(animate);
}, delay);

/* ---------- Controls Functions ---------- */

const togglePlayButton = document.getElementById('toggle-play');
const toggleGridButton = document.getElementById('toggle-grid');
const clearCanvasButton = document.getElementById('clear-canvas');
const saveStateButton = document.getElementById('save-canvas');
const loadStateButton = document.getElementById('load-canvas');

togglePlayButton.addEventListener('click', () => {
	if (togglePlayButton.textContent === 'Play') {
		runMode();
	} else {
		buildMode();
	}
	togglePlayButton.blur();
});

toggleGridButton.addEventListener('click', () => {
	gameOfLife._showGrid ? gameOfLife.hideGrid() : gameOfLife.showGrid();
});

clearCanvasButton.addEventListener('click', () => {
	gameOfLife.initBlankState();
	gameOfLife.draw(true); //bwMode ON
	drawSelectedCell(...selectedCell);
	buildMode();
	clearCanvasButton.blur();
});

[resInput, rowsInput, colsInput].forEach((input) =>
	input.addEventListener('keydown', function (event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			const value = parseFloat(input.value);

			if (value) {
				switch (input.id) {
					case 'min-res-input':
						minRes = value;
						gameOfLife.setMinRes(value);
						input.blur();
						break;
					case 'rows-input':
						rows = value;
						gameOfLife.setRows(value);
						input.blur();
						break;
					case 'cols-input':
						columns = value;
						gameOfLife.setCols(value);
						input.blur();
						break;
				}
				resetSelectedCell();
			} else {
				resetInput(event, input);
			}
		}
		if (event.key === 'Escape') {
			resetInput(event, input);
		}
	})
);

function resetInput(event, input) {
	event.preventDefault();
	switch (input.id) {
		case 'min-res-input':
			input.value = minRes;
			break;
		case 'rows-input':
			input.value = rows;
			break;
		case 'cols-input':
			input.value = columns;
			break;
	}
	input.blur();
}

/* ---------- Event Listener Helper Functions ---------- */

function resizeCanvas() {
	// Set game of life stage height to fill page
	golStage.style.height =
		window.innerHeight - controlsDiv.getBoundingClientRect().height + 'px';

	const canvasWidth = canvas.getBoundingClientRect().width;
	const canvasHeight = canvas.getBoundingClientRect().height;
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	canvasGrid.width = canvasWidth;
	canvasGrid.height = canvasHeight;
}

function resetSelectedCell() {
	selectedCell[0] = 0;
	selectedCell[1] = 0;
}

function runMode() {
	pause = false;
	toggleGridButton.disabled = false;
	togglePlayButton.textContent = 'Pause';

	gameOfLife._showGrid ? gameOfLife.showGrid() : gameOfLife.hideGrid();

	canvas.removeEventListener('click', mouseSelectCell);
	canvasGrid.removeEventListener('click', mouseSelectCell);

	ani = requestAnimationFrame(animate);
}

function buildMode() {
	pause = true;
	toggleGridButton.disabled = true;
	togglePlayButton.textContent = 'Play';

	// saveStateButton;
	// loadStateButton;
	canvasGrid.style.display = 'block'; //Show grid in build mode

	canvas.addEventListener('click', mouseSelectCell);
	canvasGrid.addEventListener('click', mouseSelectCell);
	window.addEventListener('keydown', arrowSelectCell);
}

function selectionMode() {}

function loadStateMode() {}

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
	return [row, col];
}

function mouseSelectCell(evt) {
	const [row, col] = canvasClick(evt);
	try {
		gameOfLife.cellArray[row][col] = gameOfLife.cellArray[row][col] ? 0 : 1;
		console.log(`row: ${row}, col: ${col}`);
		gameOfLife.draw(true); //bwMode ON
		selectedCell[0] = row;
		selectedCell[1] = col;
		drawSelectedCell(...selectedCell);
	} catch {
		return;
	}
}

function arrowSelectCell(evt) {
	const rows = gameOfLife.rows;
	const cols = gameOfLife.cols;
	const [row, col] = selectedCell;

	switch (evt.code) {
		case 'ArrowLeft':
			selectedCell[1] = (col + cols - 1) % cols;
			break;
		case 'ArrowRight':
			selectedCell[1] = (col + cols + 1) % cols;
			break;
		case 'ArrowUp':
			selectedCell[0] = (row + rows - 1) % rows;
			break;
		case 'ArrowDown':
			selectedCell[0] = (row + rows + 1) % rows;
			break;
		case 'Space':
			gameOfLife.cellArray[row][col] = gameOfLife.cellArray[row][col]
				? 0
				: 1;
	}

	gameOfLife.draw(true);
	drawSelectedCell(...selectedCell);
}

function drawSelectedCell(row, col) {
	const cellSize = gameOfLife.cellSize;
	const gridTop = gameOfLife.gridTop;
	const gridLeft = gameOfLife.gridLeft;

	ctx.fillStyle = gameOfLife.cellArray[row][col] ? 'red' : 'green';
	ctx.fillRect(
		gridLeft + col * cellSize,
		gridTop + row * cellSize,
		cellSize,
		cellSize
	);
}
