// import utils from "./utils";

class GameOfLife {
	constructor(
		canvas,
		ctx,
		canvasGrid,
		ctxGrid,
		rows,
		cols,
		maxCellSize,
		mod,
		aliveStyle,
		deadStyle,
		gridStyle,
		showGrid
	) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.canvasGrid = canvasGrid;
		this.ctxGrid = ctxGrid;
		this.rows = rows;
		this.cols = cols;
		this.maxCellSize = maxCellSize;
		this.mod = mod;
		this.aliveStyle = aliveStyle;
		this.deadStyle = deadStyle;
		this.gridStyle = gridStyle;
		this.drawGrid();
		showGrid ? this.showGrid() : this.hideGrid();
		this.cellArray = this.initCellArray();
		this.initBlankState();
	}

	get canvasSize() {
		return this.canvas.getBoundingClientRect();
	}

	get cellSize() {
		let cellWidth = this.canvasSize.width / this.cols;
		let cellHeight = this.canvasSize.height / this.rows;
		let cellSize = Math.min(cellWidth, cellHeight);
		cellSize = cellSize > this.maxCellSize ? this.maxCellSize : cellSize;
		return cellSize;
	}

	get gridTop() {
		return (this.canvasSize.height - this.rows * this.cellSize) / 2;
	}

	get gridLeft() {
		return (this.canvasSize.width - this.cols * this.cellSize) / 2;
	}

	initCellArray() {
		let arr = new Array(this.rows);
		for (let i = 0; i < this.rows; i++) {
			arr[i] = new Array(this.cols);
		}
		return arr;
	}

	initBlankState() {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				this.cellArray[i][j] = 0;
			}
		}
	}

	initRandomState() {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				const state = Math.random() > 0.6 ? 1 : 0;
				this.cellArray[i][j] = state;
			}
		}
	}

	draw() {
		const cellSize = this.cellSize;
		const gridTop = this.gridTop;
		const gridLeft = this.gridLeft;

		for (let c = 0; c < this.cols; c++) {
			for (let r = 0; r < this.rows; r++) {
				//cell
				this.ctx.fillStyle = this.cellArray[r][c]
					? this.aliveStyle
					: this.deadStyle;
				//   "hsla(0, 0%, 0%, 0.8)";
				//   "hsla(" +
				//   (c + r < 100 ? c + r * 10 : c + r * 5) +
				//   ", 80%, 80%, 1)"
				// : "hsla(240, 30%, 20%, 0.5)";
				this.ctx.fillRect(
					gridLeft + c * cellSize,
					gridTop + r * cellSize,
					cellSize + 1,
					cellSize + 1
				);
				// //grid
				// if (this.gridStyle) {
				// 	this.ctx.strokeStyle = this.gridStyle;
				// 	this.ctx.strokeRect(
				// 		gridLeft + c * cellSize,
				// 		gridTop + r * cellSize,
				// 		cellSize,
				// 		cellSize
				// 	);
				// }
			}
		}

		// //Fill Grid Borders On Canvas
		// this.ctx.fillStyle = this.deadStyle;
		// this.ctx.fillRect(0, 0, this.canvas.width, gridTop + 1);
		// this.ctx.fillRect(0, 0, this.gridLeft + 1, this.canvas.height);
		// this.ctx.fillRect(
		// 	0,
		// 	gridTop + this.rows * cellSize - 1,
		// 	this.canvas.width,
		// 	gridTop
		// );
		// this.ctx.fillRect(
		// 	gridLeft + this.cols * cellSize - 1,
		// 	0,
		// 	gridLeft,
		// 	this.canvas.height
		// );
	}

	drawGrid() {
		const cellSize = this.cellSize;
		const gridTop = this.gridTop;
		const gridLeft = this.gridLeft;
		this.ctxGrid.strokeStyle = this.gridStyle;

		this.ctxGrid.lineWidth = Math.sqrt(this.cellSize) / 3;

		this.ctxGrid.beginPath();
		for (let r = 0; r < this.rows + 1; r++) {
			this.ctxGrid.moveTo(gridLeft, gridTop + r * cellSize);
			this.ctxGrid.lineTo(
				this.canvas.width - gridLeft,
				gridTop + r * cellSize
			);
		}

		for (let c = 0; c < this.cols + 1; c++) {
			this.ctxGrid.moveTo(gridLeft + c * cellSize, gridTop);
			this.ctxGrid.lineTo(
				gridLeft + c * cellSize,
				this.canvas.height - gridTop
			);
		}
		this.ctxGrid.stroke();

		// for (let c = 0; c < this.cols; c++) {
		// 	for (let r = 0; r < this.rows; r++) {
		// 		//grid
		// 		this.ctxGrid.strokeRect(
		// 			gridLeft + c * cellSize,
		// 			gridTop + r * cellSize,
		// 			cellSize,
		// 			cellSize
		// 		);
		// 	}
		// }
	}

	showGrid() {
		this.canvasGrid.style.display = "block";
	}

	hideGrid() {
		this.canvasGrid.style.display = "none";
	}

	getCellState(row, col) {
		if (this.mod) {
			return this.cellArray[this.modRow(row)][this.modCol(col)];
		} else {
			if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
				return this.cellArray[row][col];
			} else {
				return 0;
			}
		}
	}

	modRow(row) {
		return (row + this.rows) % this.rows;
	}

	modCol(col) {
		return (col + this.cols) % this.cols;
	}

	cellCountNeighbours(row, col) {
		return (
			this.getCellState(row + 1, col - 1) +
			this.getCellState(row + 1, col) +
			this.getCellState(row + 1, col + 1) +
			this.getCellState(row, col - 1) +
			this.getCellState(row, col + 1) +
			this.getCellState(row - 1, col - 1) +
			this.getCellState(row - 1, col) +
			this.getCellState(row - 1, col + 1)
		);
	}

	updateCellState(row, col) {
		const neighbours = this.cellCountNeighbours(row, col);
		const currentState = this.cellArray[row][col];

		if (neighbours < 2 || neighbours > 3) {
			return 0;
		} else if (neighbours === 3 && !currentState) {
			return 1;
		} else {
			return currentState;
		}
	}

	update() {
		let newCellArray = this.initCellArray();
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				newCellArray[i][j] = this.updateCellState(i, j);
			}
		}

		this.cellArray = newCellArray;
	}
}

export { GameOfLife };
