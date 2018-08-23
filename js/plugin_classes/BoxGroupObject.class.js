var BoxGroupObject = class extends BitwiseProbRange{
	constructor(rank, basis){
		super(basis);
		this.boxes = [];
		this.hints = $(''); // init with an empty collection : https://stackoverflow.com/a/2400808
	}
	BoxGroupObject_addBox(boxObject, groupType){
		boxObject[groupType] = this;
		this.boxes.push( boxObject );
		this.hints.add( boxObject.hints ); // merge all related boxes hints collections
	}
	BoxGroupObject_checkForSingleProbBoxes(){
		return this.boxes.filter( box =>
			box.digit === null
			&& box.BitwiseProbRange_extractProbableDigitsRange.length === 1
		).map( box => {
			return {
				box: box,
				digit : box.BitwiseProbRange_extractProbableDigitsRange[0]
			};
		});
	}
};