var BoxObject = class extends BitwiseProbRange{
	constructor(parent, elmnt, basis){
		super(basis);
		this.$elmnt = elmnt;
		this.row = null;
		this.column = null;
		this.square = null;
		this.hints = null;
		this.editableDiv = null;
		this.digit = null;
		this.userDeduced = false;
		this.sudokuka = parent;
		
		this.BoxObject_createHintsDiv();
		
		this.$elmnt.on('mouseover', $.proxy(function(){
			this.hints.removeClass('hint-hidden');
		}, this)).on('mouseout', $.proxy(function(){
			this.hints.addClass('hint-hidden');
		}, this));
	}
	BoxObject_createHintsDiv(){
		let hintContainer = document.createElement('div'),
			editableDiv = document.createElement('div');
		
		editableDiv.classList.add('editable-div');
		editableDiv.setAttribute('contenteditable', true);
		
		for(let i=1, hint; i<=this.basis; i++){
			hint = document.createElement('div');
			hint.classList.add('hint_'+i);
			hint.classList.add('hint-hidden');
			
			if( i%this.side !== 0 )
				hint.classList.add('hint-border-right');
			if( i <= this.side )
				hint.classList.add('hint-border-bottom');
			
			hint.innerText = i.toString();
			hintContainer.appendChild(hint);
			$(hint).on('mouseover mouseout', this.BoxObject_toggleHintActive);
			$(hint).on('click', $.proxy(this.BoxObject_modifyBoxDigit, this));
		}
		hintContainer.classList.add('hint-container');
		
		this.$elmnt.append(hintContainer);
		this.$elmnt.append(editableDiv);
		this.hints = this.$elmnt.find('div[class^="hint_"]');
		this.editableDiv = $(editableDiv);
	}
	BoxObject_toggleHintActive( e ){
		let elmnt = e.target, // the hint the mouse is hovering
			isActive = elmnt.classList.contains('hint-active');
		if(isActive){
			elmnt.classList.remove('hint-active');
		}else{
			elmnt.classList.add('hint-active');
		}
	}
	BoxObject_modifyBoxDigit( e ){
		let elmnt = e.target, // the hint that was clicked on
			newDigit = parseInt(elmnt.innerHTML);
		
		if( ! elmnt.classList.contains('hint-disabled') ) {
			this.sudokuka.Sudokuka_updateBoxDigit( this, newDigit, true );
		}else{
			this.sudokuka.Sudokuka_updateBoxDigit( this, null, true );
		}
	}
};
