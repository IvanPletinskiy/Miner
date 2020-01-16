var field;
var fieldSize;
var fieldDiv;
var minesTotal;
var flagsLeft;
var isFirstClick;
var colors = ["#FF0000", "#00FF00", "#00000FF", "#c62828", "#E91E63", "#29B6F6", "#F9A825", "#4E342E", "#4DB6AC"];
var seconds;
var counterDiv;
var counter;
//Состояния ячеек поля
var cellStates = {
	HIDDEN_EMPTY : 0,
	HIDDEN_MINE: 1,
	OPEN: 2,
	FLAG_EMPTY: 3,
	FLAG_MINE: 4
}

$(document).ready(function() {
	fieldDiv = $("#field");
	counterDiv  = $("#secondsCounter");
	initialize();
});

function initialize() {
	field = [];
	fieldSize = 16;
	fieldDiv.html("");
	minesTotal = 30;
	flagsLeft = minesTotal;
	isFirstClick = true;
	seconds = 0;

	fillField();

	$('#endGameTextDiv').html("<h1></h1>");
	updateFlagsTextView();

	$("#field").css("pointer-events","auto");

	bindListeners();
	if(counter)
		clearInterval(counter);
	counter = setInterval(incrementSeconds, 1000);
}

function incrementSeconds() {
	seconds += 1;
	$("#secondsCounter").text("Прошло времени: " + seconds + " секунд");
}

function fillField() {
	for (var i = 0; i < fieldSize; i++) {
		field.push([]);
		var newRow = document.createElement("div");
		newRow.classList.add("row");
		newRow.id = "row" + i;
		document.getElementById("field").appendChild(newRow);
		for (var j = 0; j < fieldSize; j++) {
			field[i][j] = 0;
			var newColumn = document.createElement("div");
			newColumn.classList.add("column");
			newColumn.setAttribute("style", "background-color: #BBBBBB; border:1px solid black");
			newColumn.id = "cell" + (i * fieldSize + j);
			newRow.appendChild(newColumn);
		}
	}
}
//Заполняет минами ячейки, кроме ячейки position
function fillMines(position) {
	var cellY = position / fieldSize;
	var cellX = position % fieldSize;
	var k = minesTotal;
	while (k > 0) {
		var y = Math.floor(Math.random() * fieldSize);
		var x = Math.floor(Math.random() * fieldSize);

		if (field[y][x] == cellStates.HIDDEN_MINE || cellY == y || cellX == x)
			continue;
		field[y][x] = cellStates.HIDDEN_MINE;
		k--;
	}
}
//Привязка слушателей jQuery
function bindListeners() {
	$('.column').on("mousedown",function(e) { 
	var id = this.id;
	var intId = parseInt(id.substring(4, 10));

	if(isFirstClick) {
		isFirstClick = false;
		fillMines(intId);
	}
	if (e.button === 0) {
		handleCellClick.call(this, intId, true);
		return false;
	}
    if (e.button === 2) { 
      handleCellClick.call(this, intId, false);
      return false; 
    } 
    return true; 
 	}); 

 	$('#startButton').click(function() {
 		initialize();
 	})
}

function handleCellClick(position, isLeftClick) {
	var cell = this;
	var y = Math.floor(position / fieldSize);
	var x = position % fieldSize;

	if (field[y][x] === cellStates.OPEN) {		
		return;
	}

	if (isLeftClick) {
		//Если кликнули по мине, конец игры, иначе обновляем игровое поле
		if (field[y][x] === cellStates.HIDDEN_MINE) {
			this.setAttribute("style", "background-color: #FF0000; border:1px solid black");
			endGame(false);
		} else {
			updateCell(x, y);
		}
	} else {
		//Обновляем флаг в клетке
		updateCellFlag(x, y);
	}
}
//Рекурсивный метод для открытия и обновления поля. Считает количество мин в соседних клетках, открывает клетку, если в ней нет мины.
function updateCell(x, y) {
	if (field[y][x] === cellStates.HIDDEN_MINE || field[y][x] === cellStates.FLAG_MINE)
		return;
	if (field[y][x] === cellStates.OPEN || field[y][x] === cellStates.FLAG_EMPTY)
		return;

	field[y][x] = cellStates.OPEN;
	var count = getAdjacentMinesCount(x, y);

	var intId = y * fieldSize + x;
	var element = document.getElementById("cell" + intId);
	element.setAttribute("style", "background-color: #FFFFFF; border:1px solid black");
	if(count > 0) {
		element.innerHTML = '<p style="width: 12px; margin: 15px auto; color:' + colors[count] + '">' + count + '</p>';
	} else {
		if (y > 0 && x > 0)
			updateCell(x - 1, y - 1);
		if (y > 0)
			updateCell(x, y - 1);
		if (y > 0 && x < fieldSize - 1)
			updateCell(x + 1, y - 1);
		if (x < fieldSize - 1)
			updateCell(x + 1, y);
		if (y < fieldSize - 1 && x < fieldSize - 1)
			updateCell(x + 1, y + 1);
		if (y < fieldSize - 1) 
			updateCell(x, y + 1);
		if (y < fieldSize - 1 && x > 0)
			updateCell(x - 1, y + 1);
		if (x > 0)
			updateCell(x - 1, y);
	}
}

function getAdjacentMinesCount(x, y) {
	var count = 0;
	if (y > 0 && x > 0 && (field[y - 1][x - 1] === cellStates.HIDDEN_MINE || field[y - 1][x - 1] === cellStates.FLAG_MINE))
		count++;
	if (y > 0 && (field[y - 1][x] === cellStates.HIDDEN_MINE || field[y - 1][x] === cellStates.FLAG_MINE))
		count++;
	if (y > 0 && x < fieldSize - 1 && (field[y - 1][x + 1] === cellStates.HIDDEN_MINE || field[y - 1][x + 1] === cellStates.FLAG_MINE))
		count++;
	if (x < fieldSize - 1 && (field[y][x + 1] === cellStates.HIDDEN_MINE || field[y][x + 1] === cellStates.FLAG_MINE))
		count++;
	if (y < fieldSize - 1 && x < fieldSize - 1 && (field[y + 1][x + 1] === cellStates.HIDDEN_MINE || field[y + 1][x + 1] === cellStates.FLAG_MINE))
		count++;
	if (y < fieldSize - 1 && (field[y + 1][x] === cellStates.HIDDEN_MINE || field[y + 1][x] === cellStates.FLAG_MINE))
		count++;
	if (y < fieldSize - 1 && x > 0 && (field[y + 1][x - 1] === cellStates.HIDDEN_MINE || field[y + 1][x - 1] === cellStates.FLAG_MINE))
		count++;
	if (x > 0 && (field[y][x - 1] === cellStates.HIDDEN_MINE || field[y][x - 1] === cellStates.FLAG_MINE))
		count++;
	return count;
}

//Устанавливает/убирает флаг в клетке
function updateCellFlag(x, y) {
	if (flagsLeft === 0)
		return;
	var intId = y * fieldSize + x;
	var element = document.getElementById("cell" + intId);
	if (field[y][x] ===  cellStates.HIDDEN_MINE || field[y][x] === cellStates.HIDDEN_EMPTY) {
		flagsLeft--;
		//element.innerHTML = '<p style="width: 12px; margin: 15px auto;">F</p>';
		element.innerHTML = '<img src="https://img.icons8.com/color/48/000000/filled-flag.png">';
		field[y][x] = (field[y][x] == cellStates.HIDDEN_MINE) ? cellStates.FLAG_MINE : cellStates.FLAG_EMPTY; 
	} else {
		element.innerHTML = "";
		flagsLeft++;
		field[y][x] = (field[y][x] === cellStates.FLAG_MINE) ? cellStates.HIDDEN_MINE : cellStates.HIDDEN_EMPTY;
	}
	updateFlagsTextView();
	//Если все флаги установлены и нет скрытых клеток -> конец игры
	if (flagsLeft === 0) {
		if(!checkHasHiddenCells())
			endGame(true);
	}
}

function checkHasHiddenCells() {
	for (var i = 0; i < fieldSize; i++) {
		for (var j = 0; j < fieldSize; j++) {
			if (field[i][j] === cellStates.HIDDEN_MINE || field[i][j] === cellStates.HIDDEN_EMPTY) {
				return true;				
			}
			
		}
	}
	return false;
}

function updateFlagsTextView() {
	$("#flagsLeftTextDiv").html('<h2>' + "осталось флагов: " + flagsLeft + '</h2>');
}

function endGame(isWin) {
	$(".field").css("pointer-events","none");

	if(counter)
		clearInterval(counter);

	var text;
	if (isWin) {
		text = "Победа";
	} else {
		text = "Поражение";
		for (var i = 0; i < fieldSize; i++) {
			for (var j = 0; j < fieldSize; j++) {
				if (field[i][j] === cellStates.HIDDEN_MINE || field[i][j] === cellStates.FLAG_MINE) {
					var id = (i * fieldSize + j);
					document.getElementById("cell" + id).innerHTML = '<img src="https://img.icons8.com/emoji/48/000000/bomb-emoji.png">';
				}
			}
		}
	}
	$('#endGameTextDiv').html("<h1>" + text + "</h1>");
}