/*
	jQuery plugin Boilerplate references :
		- https://github.com/h5bp/html5-boilerplate/blob/master/src/js/plugins.js
		- https://gist.github.com/addyosmani/1184226
*/


// Avoid `console` errors in browsers that lack a console.
(function() {
	var method;
	var noop = function () {};
	var methods = [
		'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
		'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
		'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
		'timeStamp', 'trace', 'warn'
	];
	var length = methods.length;
	var console = (window.console = window.console || {});

	while (length--) {
		method = methods[length];

		// Only stub undefined methods.
		if (!console[method]) {
			console[method] = noop;
		}
	}
}());

/* https://www.websudoku.com/ */
// TODO : Probabilités => Implémenter les stratégies probabilistes inter-carrés : https://www.mots-croises.ch/Manuels/Sudoku
( function( $, window, document, undefined ) {
	
	"use strict";
	var pluginName = "Sudokuka",
		pluginUrl = document.currentScript.src,
		pluginRoot = pluginUrl.substring(0, pluginUrl.lastIndexOf('/')),
		defaults = {
			side: 3,
			squareSwitch: null
		};
	
	function Sudokuka( element, options ) {
		this._name = pluginName;
		this._defaults = defaults;
		
		this.grid = null;
		this.boxes = [];
		this.rows = {};
		this.columns = {};
		this.squares = {};
		this.deductionsToCancel = [];
		
		this.element = element;
		this.$elmnt = $(element);
		this.settings = $.extend( {}, defaults, options );
		this.Sudokuka_init();
	}
	
	
	// Avoid Plugin.prototype conflicts
	$.extend( Sudokuka.prototype, {
		Sudokuka_init: function() {
			this.settings.basis = Math.pow( this.settings.side, 2);
			this.settings.squareSwitch = this.Sudokuka_generateSquareSwitchFunction(this.settings.basis);
			this.settings.boxSquareSwitch = this.Sudokuka_generateBoxSquareSwitchFunction(this.settings.basis);
			
			this.Sudokuka_createToggleBackgroundButtons();
			this.Sudokuka_createGrid();
			return this;
		},
		
		/** UI creation **/
		Sudokuka_createGrid: async function() {
			let dimension = (this.$elmnt.height() / this.settings.basis)-2, // Take 1px border into account
				grid = document.createElement('table');
			
			await loadExternalClass( pluginRoot + "/plugin_classes/BoxObjectStatistics.class.js" );
			await loadExternalClass( pluginRoot + "/plugin_classes/BitwiseProbRange.class.js" );
			await loadExternalClass( pluginRoot + "/plugin_classes/BoxObject.class.js" );
			await loadExternalClass( pluginRoot + "/plugin_classes/BoxGroupObject.class.js" );
			
			for(let i=1, line; i<=this.settings.basis; i++){
				line = document.createElement('tr');
				this.rows[i] = new BoxGroupObject(i, this.settings.basis);
				for(let j=1, box, squareIdx, boxSquareIdx, boxObj; j<=this.settings.basis; j++){
					squareIdx = this.settings.squareSwitch(i,j);
					boxSquareIdx = this.settings.boxSquareSwitch(i,j);
					let isLeftBorder = j%this.settings.side === 1,
						isRightBorder = j%this.settings.side === 0,
						isTopBorder = i%this.settings.side === 1,
						isBottomBorder = i%this.settings.side === 0;
					
					box = document.createElement('td');
					box.classList.add('box');
					
					// Take square thick border into account
					box.style.height = ( isTopBorder || isBottomBorder ? dimension-2 : dimension )+'px';
					box.style.width = ( isLeftBorder || isRightBorder ? dimension-2 : dimension )+'px';
					
					// Draw square thick border
					if(isTopBorder) box.classList.add('box-square-top');
					if(isBottomBorder) box.classList.add('box-square-bottom');
					if(isLeftBorder) box.classList.add('box-square-left');
					if(isRightBorder) box.classList.add('box-square-right');
					
					boxObj = new BoxObject( this, $(box), this.settings.basis );
					line.appendChild(box);
					
					// Make reference to boxObject inside respective row, column, and square
					this.boxes.push(boxObj);
					this.rows[i].BoxGroupObject_addBox(boxObj,'row');
					
					if(typeof this.columns[j] === 'undefined')
						this.columns[j] = new BoxGroupObject(j, this.settings.basis);
					this.columns[j].BoxGroupObject_addBox(boxObj,'column');
					
					if(typeof this.squares[squareIdx] === 'undefined')
						this.squares[squareIdx] = new BoxGroupObject(j, this.settings.basis);
					this.squares[squareIdx].BoxGroupObject_addBox(boxObj,'square');
				}
				grid.appendChild(line);
			}
			this.element.appendChild(grid);
			this.grid = grid;
		},
		Sudokuka_createToggleBackgroundButtons: function(){
			let dimension = (this.$elmnt.height() / this.settings.basis)-2,
				switchContainer = document.createElement('div');
			
			switchContainer.classList.add('switchBtn-container');
			
			for(let digit=1, switchBtn; digit<=this.settings.basis; digit++){
				switchBtn = document.createElement('div');
				switchBtn.style['height'] = dimension +'px';
				switchBtn.style['width'] = dimension +'px';
				switchBtn.style['line-height'] = dimension +'px';
				switchBtn.classList.add('switchBtn');
				switchBtn.classList.add('switchBtn-off');
				switchBtn.innerText = digit.toString();
				
				switchContainer.appendChild(switchBtn);
				$(switchBtn).on('click', $.proxy(this.Sudokuka_toggleBackgroundHint, this));
			}
			
			this.element.appendChild(switchContainer);
		},
		
		/** UX sugar **/
		Sudokuka_toggleBackgroundHint: function( e ){
			let btn = e.target,
				$btn = $(btn),
				$prevBtn = $('.switchBtn-on'),
				newDigit = parseInt($btn.text()),
				prevDigit = parseInt($prevBtn.text());
			
			$btn.removeClass('switchBtn-off').addClass('switchBtn-on');
			$prevBtn.removeClass('switchBtn-on').addClass('switchBtn-off');
			
			// Sort boxes groups
			this.boxes.forEach( box => {
				if( box.digit !== null || newDigit === prevDigit || (!isNaN(prevDigit) && box.BitwiseProbRange_checkForDigitFlag( prevDigit )) )
					box.$elmnt.removeClass('box-probability-on');
				if( box.digit === null && newDigit !== prevDigit && !isNaN(newDigit) && box.BitwiseProbRange_checkForDigitFlag( newDigit ) )
					box.$elmnt.addClass('box-probability-on');
			});
		},
		
		/** Resolution functions **/
		Sudokuka_updateBoxDigit: function( boxObject, newDigit, userDeduced ){
			boxObject.userDeduced = userDeduced;
			
			this.Sudokuka_updateGroupsDigitHints(boxObject, newDigit);
			this.Sudokuka_updateRelatedRanges(boxObject, newDigit, userDeduced);
			if( ! userDeduced ) boxObject.$elmnt.addClass('my-oh-my-you-should-have-guessed')
		},
		Sudokuka_updateGroupsDigitHints: function( boxObject, newDigit) {
			let prevDigit = boxObject.digit;
			
			boxObject.row.boxes.forEach( (box)=> this.Sudokuka_toggleBoxHints(box, newDigit, prevDigit) );
			boxObject.column.boxes.forEach( (box)=> this.Sudokuka_toggleBoxHints(box, newDigit, prevDigit) );
			boxObject.square.boxes.forEach( (box)=> this.Sudokuka_toggleBoxHints(box, newDigit, prevDigit) );
		},
		Sudokuka_toggleBoxHints: function( box, newDigit, prevDigit) {
			if( box.hasOwnProperty('hints') ) {
				let newDigitHint = (newDigit !== null) ? box.hints.filter( 'div.hint_' + newDigit ) : null,
					prevDigitHint = (prevDigit !== null) ? box.hints.filter( 'div.hint_' + prevDigit ) : null;
				
				if ( newDigitHint !== null && ! newDigitHint.hasClass('hint-disabled') )
					newDigitHint.addClass( 'hint-disabled' );
				if ( prevDigitHint !== null && prevDigitHint.hasClass('hint-disabled') )
					prevDigitHint.removeClass( 'hint-disabled' );
			}
		},
		Sudokuka_updateRelatedRanges: function( modifiedBoxObject, newDigit, userDeduced){
			let prevDigit = modifiedBoxObject.digit,
				row = modifiedBoxObject.row,
				col = modifiedBoxObject.column,
				square = modifiedBoxObject.square,
				allRelatedGroups = [row, col, square];

			// Update groups probabilities range
			this.Sudokuka_updateGroupListProbabilityRange(allRelatedGroups, prevDigit, newDigit);

			// Update related boxes probabilities range
			for ( let i = 0, group; i < allRelatedGroups.length; i++ ) {
				group = allRelatedGroups[i];
				
				for ( let j = 0, currentBox; j < group.boxes.length; j++ ) {
					currentBox = group.boxes[j];
					
					// Update each box only once
					if( i === 0
						|| (i===1
							&& currentBox !== modifiedBoxObject)
						|| (i===2
							&& currentBox.row !== modifiedBoxObject.row
							&& currentBox.column !== modifiedBoxObject.column) )
					{
						// Stack cancelable deductions
						if ( prevDigit !== null
							&& newDigit === null
							&& userDeduced
							&& currentBox.digit !== null
							&& !currentBox.userDeduced
							&& this.deductionsToCancel.indexOf( currentBox ) === -1 )
							this.deductionsToCancel.push( currentBox );
						
						
						let perpendicularGroupProb =
							( i===0 ) ? currentBox.column.BitwiseProbRange_checkForDigitFlag( prevDigit ) :
								( i===1 ) ? currentBox.row.BitwiseProbRange_checkForDigitFlag( prevDigit ) :
									true;
						let squareProb =
							( i < 2 && currentBox.square !== modifiedBoxObject.square ) ?
								currentBox.square.BitwiseProbRange_checkForDigitFlag( prevDigit ) :
								currentBox.row.BitwiseProbRange_checkForDigitFlag( prevDigit ) && currentBox.column.BitwiseProbRange_checkForDigitFlag( prevDigit );
						
						// Update box probabilities range
						if ( prevDigit !== null
							&& !currentBox.BitwiseProbRange_checkForDigitFlag( prevDigit )
							&& perpendicularGroupProb
							&& squareProb )
							currentBox.BitwiseProbRange_addDigitFlag( prevDigit );
						if ( newDigit !== null
							&& currentBox.digit === null
							&& currentBox.BitwiseProbRange_checkForDigitFlag( newDigit ) )
							currentBox.BitwiseProbRange_removeDigitFlag( newDigit );
						
					}
				}
			}
			modifiedBoxObject.digit = newDigit;
			modifiedBoxObject.editableDiv.text( newDigit !== null ? newDigit : "" );
			
			if(this.deductionsToCancel.length){
				this.Sudokuka_updateRelatedRanges( this.deductionsToCancel.shift(), null, false );
			}else{
				this.Sudokuka_checkAllSquares();
			}
		},
		Sudokuka_checkAllSquares: function(){
			let digitBackgroundHint = parseInt( $( '.switchBtn-on' ).text() );
			
			// Reset clues
			$('.hint-is-clue').removeClass('hint-is-clue');
			
			// For each square...
			for(let i = 1, square, probRange; i <= this.settings.basis; i++ ){
				square = this.squares[i];
				probRange = square.BitwiseProbRange_extractProbableDigitsRange();
				
				for(let i = 0, digit=probRange[i], digitIdxList; i < probRange.length; i++, digit = probRange[i] ) {
					digitIdxList = [];
					
					for ( let j = 0, currentBox, probableDigitList, boxEmpty; j < square.boxes.length; j++ ) {
						currentBox = square.boxes[j];
						boxEmpty = currentBox.digit === null;
						probableDigitList = currentBox.BitwiseProbRange_extractProbableDigitsRange();
						
						// Update background hint
						if ( boxEmpty && !isNaN( digitBackgroundHint ) && currentBox.BitwiseProbRange_checkForDigitFlag( digitBackgroundHint ) ) {
							currentBox.$elmnt.addClass( 'box-probability-on' );
						} else {
							currentBox.$elmnt.removeClass( 'box-probability-on' );
						}
						
						// List probabilities
						if( boxEmpty && currentBox.BitwiseProbRange_checkForDigitFlag( digit ) )
							digitIdxList.push(j);
						
						if(	boxEmpty && probableDigitList.length === 1 ) {
							this.Sudokuka_updateBoxDigit( currentBox, probableDigitList[0], false );
							return;
						}
					}
					
					switch(digitIdxList.length) {
						case 1:
							// Fill this.boxToUpdateList.push( [square.boxes[digitIdxList[0]], digit, false], lastBox
							this.Sudokuka_updateBoxDigit( square.boxes[digitIdxList[0]], digit, false );
							return 0;
						case 2:
							let box1 = square.boxes[digitIdxList[0]],
								box2 = square.boxes[digitIdxList[1]],
								alignedRow = box1.row === box2.row,
								alignedColumn = box1.column === box2.column,
								groupToReduce = ( alignedRow ) ? box1.row :
												( alignedColumn ) ? box1.column :
												null;
							
							if ( groupToReduce ) {
								groupToReduce.boxes.filter(
									box => (( box !== box1 && box !== box2 && box.digit === null ) && box.BitwiseProbRange_checkForDigitFlag( digit ))
								).forEach(
									box => { if(box.digit === null) box.BitwiseProbRange_removeDigitFlag( digit ) }
								);
								box1.hints[digit-1].classList.add('hint-is-clue');
								box2.hints[digit-1].classList.add('hint-is-clue');
								
								let singleProbBoxList = groupToReduce.BoxGroupObject_checkForSingleProbBoxes();
								if( singleProbBoxList.length ) {
									this.Sudokuka_updateBoxDigit( singleProbBoxList[0].box, singleProbBoxList[0].digit, false );
									return;
								}
							}
							break;
						default:
							break;
					}
				}
			}
		},
		Sudokuka_updateGroupListProbabilityRange: function( groupList, prevDigit, newDigit ) {
			for ( let i = 0, group; i < groupList.length; i++ ) {
				group = groupList[i];
				if ( prevDigit !== null && !group.BitwiseProbRange_checkForDigitFlag( prevDigit ) ) {
					group.BitwiseProbRange_addDigitFlag( prevDigit );
				}
				if ( newDigit !== null && group.BitwiseProbRange_checkForDigitFlag( newDigit ) ) {
					group.BitwiseProbRange_removeDigitFlag( newDigit );
				}
			}
		},
		
		
		/** UI creation helper functions **/
		Sudokuka_generateSquareSwitchFunction : function( basis){
			let maxBoxesPerSquareRow = Math.sqrt(basis),
				functionInstructions = "";
			
			for(let i=1, sqrIdx=1; i<=maxBoxesPerSquareRow; i++){
				functionInstructions += "if(row <= "+(i*maxBoxesPerSquareRow)+"){\n";
				for(let j=1; j<=maxBoxesPerSquareRow; j++){
					functionInstructions += "\tif(column <= "+(j*maxBoxesPerSquareRow)+") return "+ sqrIdx +";\n";
					sqrIdx++;
				}
				functionInstructions += "}\n";
			}
			
			return new Function( 'row', 'column', functionInstructions );
		},
		Sudokuka_generateBoxSquareSwitchFunction : function( basis){
			let maxBoxesPerSquareRow = Math.sqrt(basis),
				functionInstructions = "";
			
			for(let i=1, sqrIdx=1; i<=maxBoxesPerSquareRow; i++){
				functionInstructions += "if(row%"+ maxBoxesPerSquareRow +" == "+(i%maxBoxesPerSquareRow)+"){\n";
				for(let j=1; j<=maxBoxesPerSquareRow; j++){
					functionInstructions += "\tif(column%"+ maxBoxesPerSquareRow +" == "+(j%maxBoxesPerSquareRow)+") return "+ sqrIdx +";\n";
					sqrIdx++;
				}
				functionInstructions += "}\n";
			}
			return new Function( 'row', 'column', functionInstructions );
		},
		Sudokuka_destroy: function() {
			this._name = null;
			this._defaults = null;
			this.settings = null;
			
			this.boxes.forEach( box=> {
				box.$elmnt.remove();
				box = null;
			});
			Object.keys(this.rows).forEach( (i)=> {
				this.rows[i] = null;
			});
			this.element.removeChild(this.grid);
			this.$elmnt.unbind().removeData();
		}
	} );
	
	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function( options ) {
		return this.each( function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" +
					pluginName, new Sudokuka( this, options ) );
			}
		} );
	};
	
	function loadExternalClass ( url ){
		return new Promise( (resolve)=> {
			$.getScript( url, function ( text ) {
				resolve(text);
			} );
		});
	}
	
} )( jQuery, window, document );