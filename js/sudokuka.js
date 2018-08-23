
var sudoku = $('#grid-container').Sudokuka();

Array.prototype.reduceRowColumnStats = function(modifiedBox, valueInt){
	return sudoku.data().plugin_Sudokuka.Sudokuka_reduceRowColumnStats(this, modifiedBox, valueInt);
};
Array.prototype.reduceSquareStats = function(modifiedBox, valueInt){
	return sudoku.data().plugin_Sudokuka.Sudokuka_reduceSquareStats(this, modifiedBox, valueInt);
};

function sudokukaDestroy(){
	$('#grid-container').data().removeProperty('_plugin_Sudokuka');
}