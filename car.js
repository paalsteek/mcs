/*
 * Vehicle stats
 * 0: sleeping
 * 1: transmitting
 * 2: receiving
 */

Car = function(n, home, nRoads, blocks, segments) {
	if ( !assertNumber(n, 'car') || !assertNumber(home, 'car') || !assertNumber(nRoads, 'car') )
		return;

	this.n = n;
	this.home = home;
	var r = Math.random();
	this.calculatePosition(blocks);
	this.M = nRoads;
	this.backoff = Math.floor(Math.random()*2*(1/eta)) + 1; // draw initial random backoff
	this.offset = Math.random(); //offset of the position within a segment
	this.state = 0;
}

Car.prototype.getSegment = function() {
	return this.segment;
}

Car.prototype.calculatePosition = function(blocks) {
	this.tier = 0;
	while ( (r > 0 || this.tier == 0) && this.tier < A )
	{
		this.tier++;
		r -= (16*this.tier - 12)*pi_alpha(this.tier);
	}
	var pos = Math.floor(Math.random()*(16*this.tier-12)); //entspricht den werten zwischen 0 und 16*alpha - 13, also 16*alpha - 12 werten
	this.segment = blocks[this.home].tier(this.tier, blocks).segments[pos];
}

Car.prototype.move = function(direction) {
	if ( !assertNumber(direction, 'move') )
		return;

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

pi_1 = function() {
	var res = 0;
	for ( var i = 1; i <= A; i++ )
	{
		res += (16*i - 12)*Math.pow(i, -gamma);
	}
	return 1/res;
}

pi_alpha = function(alpha) {
	if ( !assertNumber(alpha, "pi_alpha") )
		return;

	return Math.pow(alpha, gamma * -1)*pi_1();
}
