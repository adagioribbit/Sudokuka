var BitwiseProbRange = class {
	
	constructor( basis ) {
		this.bitwiseProbRange = null;
		this.basis = basis;
		this.side = Math.sqrt(basis);
		
		// TODO : Try factorization for non-integer side value
		// TODO : If non-equal factors, distinguish between horizontal and vertical sides length
		// TODO : Throw error if basis is a prime number
		this.bitwiseProbRange = Math.pow( 2, this.basis ) - 1;
	}
	BitwiseProbRange_checkForDigitFlag( digit ){
		return this.bitwiseProbRange & Math.pow( 2, digit-1 );
	}
	BitwiseProbRange_addDigitFlag( digit ){
		this.bitwiseProbRange |= Math.pow( 2, digit-1 );
	}
	BitwiseProbRange_removeDigitFlag( digit ){
		this.bitwiseProbRange ^= Math.pow( 2, digit-1 );
	}
	BitwiseProbRange_extractProbableDigitsRange(){
		let probRange = [];
		for(let i=1; i<=this.basis; i++){
			if( this.BitwiseProbRange_checkForDigitFlag(i) )
				probRange.push(i);
		}
		return probRange;
	}
	BitwiseProbRange_computeGroupBitwiseProbRange( boxes ){
		this.bitwiseProbRange = 0;
		for(let i=0; i<boxes.length; i++){
			this.bitwiseProbRange |= boxes[i].bitwiseProbRange;
		}
	}
};