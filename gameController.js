var field;
var field_size;
var field_div;
var mines_total;
var flagsLeft;
//Состояния ячеек поля
var cellStates = {
	HIDDEN_EMPTY : 0,
	HIDDEN_MINE: 1,
	OPEN: 2,
	FLAG_EMPTY: 3,
	FLAG_MINE: 4
}

$(document).ready(function() {
	field_div = $("#field");
	initialize();
});

function initialize() {
	field = [];
	field_size = 5;
	field_div.html("");
	mines_total = 10;
	flagsLeft = mines_total;
	for (var i = 0; i < field_size; i++) {
		field.push([]);
		var new_row = document.createElement("div");
		new_row.classList.add("row");
		new_row.id = "row" + i;
		document.getElementById("field").appendChild(new_row);
		for (var j = 0; j < field_size; j++) {
			field[i][j] = 0;
			var new_column = document.createElement("div");
			new_column.classList.add("column");
			new_column.setAttribute("style", "background-color: #BBBBBB; border:1px solid black");
			new_column.id = "cell" + (i * field_size + j);
			new_row.appendChild(new_column);
		}
	}
	var k = mines_total;
	while (k > 0) {
		var y = Math.floor(Math.random() * field_size);
		var x = Math.floor(Math.random() * field_size);

		if (field[y][x] == cellStates.HIDDEN_MINE)
			continue;
		field[y][x] = cellStates.HIDDEN_MINE;
		k--;
	}
	$('#endGameTextDiv').html("<h1></h1>");
	updateFlagsTextView();

	$("#field").css("pointer-events","auto");

	bindListeners();
}
//Привязка слушателей jQuery
function bindListeners() {
	$('.column').on("mousedown",function(e){ 
	var id = this.id;
	var intId = parseInt(id.substring(4, 10));
	if (e.button == 0) {
		handleCellClick.call(this, intId, true);
		return false;
	}
    if (e.button == 2) { 
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
	var y = Math.floor(position / field_size);
	var x = position % field_size;
	if (field[y][x] == cellStates.OPEN) {		
		return;
	}
	if (isLeftClick) {
		//Если кликнули по мине, конец игры, иначе обновляем игровое поле
		if (field[y][x] == cellStates.HIDDEN_MINE) {
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
	if (field[y][x] == cellStates.HIDDEN_MINE || field[y][x] == cellStates.FLAG_MINE)
		return 1;
	if (field[y][x] == cellStates.OPEN || field[y][x] == cellStates.FLAG_EMPTY)
		return 0;
	field[y][x] = cellStates.OPEN;
	var count = 0;
	if (y > 0 && x > 0)
		count += updateCell(x - 1, y - 1);
	if (y > 0)
		count += updateCell(x, y - 1);
	if (y > 0 && x < field_size - 1)
		count += updateCell(x + 1, y - 1);
	if (x < field_size - 1)
		count += updateCell(x + 1, y);
	if (y < field_size - 1 && x < field_size - 1)
		count += updateCell(x + 1, y + 1);
	if (y < field_size - 1) 
		count += updateCell(x, y + 1);
	if (y < field_size - 1 && x > 0)
		count += updateCell(x - 1, y + 1);
	if (x > 0)
		count += updateCell(x - 1, y);
	var intId = y * field_size + x;
	var element = document.getElementById("cell" + intId);
	element.setAttribute("style", "background-color: #FFFFFF; border:1px solid black");
	element.innerHTML = '<p style="width: 50px; margin: 40px auto;">' + count + '</p>';
	return 0;
}

//Устанавливает/убирает флаг в клетке
function updateCellFlag(x, y) {
	if (flagsLeft == 0)
		return;
	var intId = y * field_size + x;
	var element = document.getElementById("cell" + intId);
	if (field[y][x] ==  cellStates.HIDDEN_MINE || field[y][x] == cellStates.HIDDEN_EMPTY) {
		flagsLeft--;
		element.innerHTML = '<p style="width: 50px; margin: 40px auto;">F</p>';
		field[y][x] = (field[y][x] == cellStates.HIDDEN_MINE)? cellStates.FLAG_MINE : cellStates.FLAG_EMPTY; 
	} else {
		element.innerHTML = "";
		flagsLeft++;
		field[y][x] = (field[y][x] == cellStates.FLAG_MINE)? cellStates.HIDDEN_MINE : cellStates.HIDDEN_EMPTY;
	}
	updateFlagsTextView();
	//Если все флаги установлены и нет скрытых клеток -> конец игры
	if (flagsLeft == 0) {
		var found = false;
		for (var i = 0; i < field_size; i++) {
			for (var j = 0; j < field_size; j++) {
				if (field[i][j] == cellStates.HIDDEN_MINE || field[i][j] == cellStates.HIDDEN_EMPTY) {
					found = true;
					break;
				}

			}
			if (found)
				break;
		}
		if (!found)
			endGame(true);
	}
}

function updateFlagsTextView() {
	$("#flagsLeftTextDiv").html('<h2>' + "осталось флагов: " + flagsLeft + '</h2>');
}

function endGame(isWin) {
	$(".field").css("pointer-events","none");
	var text;
	if (isWin) {
		text = "Победа";
	} else {
		text = "Поражение";
	}
	$('#endGameTextDiv').html("<h1>" + text + "</h1>");
}