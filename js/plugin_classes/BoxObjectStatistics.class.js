var BoxDigitStatistics = class {
	constructor(nominator, denominator){
		this.numerator = nominator;
		this.denominator = denominator;
		this.approximation = 0;
		this.BoxDigitStatistics_updateApproximation();
	}
	BoxDigitStatistics_updateApproximation(){
		this.approximation = this.numerator / this.denominator;
	}
	BoxDigitStatistics_anthypheresis( a, b ){
		let absA = Math.abs(a),
			absB = Math.abs(b);
		
		let largest = ( absA < absB ) ? absB : absA,
			smallest = ( absA > absB ) ? absB : absA,
			remainder = 1;
		while( remainder > 0 ){
			remainder = largest%smallest;
			largest = smallest;
			if(remainder > 0) smallest = remainder;
		}
		return smallest;
	}
};