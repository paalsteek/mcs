Car = function(nRoads) {
	this.home = Math.floor( Math.random() * (2*Math.pow(nRoads,2) - 0.5) );
	this.segment = this.home;
	this.M = nRoads;
}

Car.prototype.getSegment = function() {
	return this.segment;
}

Car.prototype.move = function(direction) {
	if ( direction === undefined )
		direction = Math.floor( Math.random() * 6 );

	segment = Segments[this.segment];
	if ( segment.getOrientation() )
	{
		switch ( direction )
		{
			case 0:
				if ( this.segment % (2*this.M) == 1 )
					this.segment += 2*this.M;
				this.segment = this.segment - 3;
				break;
			case 1:
				this.segment = this.segment - 2*this.M;
				break;
			case 2:
				this.segment = this.segment - 1;
				break;
			case 3:
				this.segment = this.segment + 2*this.M - 1;
				break;
			case 4:
				this.segment = this.segment + 2*this.M;
				break;
			case 5:
				if ( this.segment % (2*this.M) == 1 )
					this.segment += 2*this.M;
				this.segment = this.segment + 2*this.M - 3;
				break;
			default:
				console.log("Error: unkown direction " + direction);
		}
	} else {
		switch ( direction )
		{
			case 0:
				this.segment = this.segment + 1;
				break;
			case 1:
				if ( this.segment % (2*this.M) == 0 )
					this.segment += 2*this.M;
				this.segment = this.segment - 2;
				break;
			case 2:
				this.segment = this.segment - 2*this.M + 1;
				break;
			case 3:
				this.segment = this.segment - 2*this.M + 3;
				break;
			case 4:
				this.segment = this.segment + 2;
				break;
			case 5:
				this.segment = this.segment + 3;
				break;
			default:
				console.log("Error: unkown direction " + direction);
		}
	}
	if ( this.segment >= 2*Math.pow(this.M,2) )
		this.segment = this.segment - 2*Math.pow(this.M,2);
	else if ( this.segment < 0 )
		this.segment = this.segment + 2*Math.pow(this.M,2);
}
