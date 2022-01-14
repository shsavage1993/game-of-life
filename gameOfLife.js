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
		addGlow,
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
		this.mod = mod; //looped grid
		this.aliveStyle = aliveStyle;
		this.deadStyle = deadStyle;
		this.addGlow = addGlow;
		this.gridStyle = gridStyle;
		this.drawGrid();
		this._showGrid;
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

	setMinRes(val) {
		this.maxCellSize = val;
		this.drawGrid();
		this.draw(true);
	}

	setRows(val) {
		if (val > this.rows) {
			// pad
			const padLength = val - this.rows;
			this.cellArray = [
				...this.cellArray,
				...new Array(padLength).fill(new Array(this.cols).fill(0)),
			];
		}
		if (val < this.rows) {
			// remove
			this.cellArray = this.cellArray.slice(0, val);
		}
		this.rows = val;
		this.draw(true);
		this.drawGrid();
	}

	setCols(val) {
		if (val > this.cols) {
			// pad
			const padLength = val - this.cols;
			this.cellArray.map((row) => [
				...row,
				...new Array(padLength).fill(0),
			]);
		} else if (val < this.cols) {
			// remove
			this.cellArray = this.cellArray.map((row) => row.slice(0, val));
		}
		this.cols = val;
		this.draw(true);
		this.drawGrid();
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

	draw(bwMode = false) {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		let aliveStyle;
		let deadStyle;
		let addGlow;
		if (bwMode) {
			aliveStyle = 'white';
			deadStyle = 'black';
			addGlow = false;
		} else {
			aliveStyle = this.aliveStyle;
			deadStyle = this.deadStyle;
			addGlow = this.addGlow;
		}

		const cellSize = this.cellSize;
		const gridTop = this.gridTop;
		const gridLeft = this.gridLeft;
		const sumRowsCols = this.rows + this.cols;

		for (let c = 0; c < this.cols; c++) {
			for (let r = 0; r < this.rows; r++) {
				//cell
				this.ctx.fillStyle = this.cellArray[r][c]
					? aliveStyle.toLowerCase() === 'rainbow'
						? 'hsla(' +
						  ((1000 * c) / this.cols +
								((500 * r) / this.rows) *
									0.1 *
									Math.floor(
										(7 * (c - 0.8 * r)) / sumRowsCols
									)) +
						  ', 80%, 80%, 1)'
						: aliveStyle
					: deadStyle;
				//   "hsla(240, 30%, 20%, 0.5)";
				this.ctx.fillRect(
					gridLeft + c * cellSize,
					gridTop + r * cellSize,
					addGlow ? cellSize + 1 : cellSize + 1,
					addGlow ? cellSize + (r * 100) / this.rows : cellSize + 1
				);
			}
		}

		if (addGlow || bwMode) {
			// Fill Grid Borders On Canvas
			// set borderStyle alpha to 1
			let borderStyle = deadStyle.split(',');
			if (borderStyle.length == 1) {
				borderStyle = deadStyle;
			} else {
				borderStyle[3] = ' 1)';
				borderStyle = borderStyle.join(',');
			}
			this.ctx.fillStyle = borderStyle;
			// fill top border
			this.ctx.fillRect(0, 0, this.canvas.width, gridTop + 1);
			// fill bottom border
			this.ctx.fillRect(
				0,
				gridTop + this.rows * cellSize - 1,
				this.canvas.width,
				gridTop + 1
			);
			// fill left border
			this.ctx.fillRect(0, 0, this.gridLeft + 1, this.canvas.height);
			// fill right border
			this.ctx.fillRect(
				gridLeft + this.cols * cellSize - 1,
				0,
				gridLeft,
				this.canvas.height
			);
		}
	}

	drawGrid() {
		this.ctxGrid.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
		this._showGrid = true;
		this.canvasGrid.style.display = 'block';
	}

	hideGrid() {
		this._showGrid = false;
		this.canvasGrid.style.display = 'none';
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
