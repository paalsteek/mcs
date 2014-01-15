Segment = function(nRoads, segNumber) {
	this.x = Math.floor(segNumber / 2) % nRoads;
	this.y = Math.floor((segNumber / 2) / nRoads);
	this.orientation = segNumber % 2;
	this.M = nRoads;
	this.startx = 0;
}

Segment.prototype.getX = function() {
	return this.x;
}

Segment.prototype.getY = function() {
	return this.y;
}

Segment.prototype.getOrientation = function() {
	return this.orientation;
}

Segment.prototype.calcPos = function() {
	if ( this.startx !== 0 )
		return;

	xstep = canvasWidth/(this.M+2);
	ystep = canvasHeight/(this.M+2);
	this.startx = (this.x+1)*xstep;
	this.starty = (this.y+1)*ystep;
	if ( this.orientation ) // 0 = horizontal, 1 = vertical
	{
		this.stopx = this.startx;
		this.stopy = this.starty + ystep;

		if ( this.x == 0 )
		{
			this.startx2 = this.startx + this.M*xstep;
			this.starty2 =this.starty;
			this.stopx2 = this.stopx + this.M*xstep;
			this.stopy2 =this.stopy;
		}
	} else {
		this.stopx = this.startx + xstep;
		this.stopy = this.starty;

		if ( this.y == 0 )
		{
			this.startx2 = this.startx;
			this.starty2 =this.starty + this.M*xstep;
			this.stopx2 = this.stopx;
			this.stopy2 =this.stopy + this.M*xstep;
		}
	}
}

Segment.prototype.drawSegment = function(strokeStyle) {
	this.calcPos();

	if ( !strokeStyle )
		strokeStyle = "rgba(0, 0, 0, 0.2)";

	self.postMessage({'cmd': 'drawLine', 'startx': this.startx, 'starty': this.starty, 'stopx': this.stopx, 'stopy': this.stopy, 'stroke': strokeStyle});

	if ( (this.x == 0) || (this.y == 0) ) {
		self.postMessage({'cmd': 'drawLine', 'startx': this.startx2, 'starty': this.starty2, 'stopx': this.stopx2, 'stopy': this.stopy2, 'stroke': strokeStyle});
	}
}

Segment.prototype.drawCar = function(strokeStyle) {
	this.calcPos();
	pos = Math.floor(Math.random() * ((this.stopx - this.startx) + (this.stopy - this.starty)));

	if ( !strokeStyle )
		strokeStyle = "rgba(0, 0, 255, 1)";

	var startx = this.startx;
	var starty = this.starty;
	var startx2 = this.startx2;
	var starty2 = this.starty2;
	if ( this.orientation )
	{
		starty += pos;
		starty2 += pos;
	} else {
		startx += pos;
		startx2 += pos;
	}

	self.postMessage({'cmd': 'drawArc', 'x': startx, 'y': starty, 'radius': 2, 'startAngle': 0, 'endAngle': Math.PI*2, 'anticlockwise': true, 'stroke': strokeStyle});

	if ( (this.x == 0) || (this.y == 0) ) {
		self.postMessage({'cmd': 'drawArc', 'x': startx2, 'y': starty2, 'radius': 2, 'startAngle': 0, 'endAngle': Math.PI*2, 'anticlockwise': true, 'stroke': strokeStyle});
	}
}
