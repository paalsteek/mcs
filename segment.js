Segment = function(nRoads, segNumber) {
	this.x = Math.floor(segNumber / 2) % nRoads;
	this.y = Math.floor((segNumber / 2) / nRoads);
	this.orientation = segNumber % 2;
	this.M = nRoads;
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

Segment.prototype.calcPos = function(canvas) {
	xstep = canvas.width/(this.M+2);
	ystep = canvas.height/(this.M+2);
	this.startx = (this.x+1)*xstep;
	this.starty = (this.y+1)*ystep;
	if ( this.orientation ) // 0 = horizontal, 1 = vertical
	{
		this.stopx = this.startx;
		this.stopy = this.starty + ystep;
	} else {
		this.stopx = this.startx + xstep;
		this.stopy = this.starty;
	}
}

Segment.prototype.drawSegment = function(canvas, strokeStyle) {
	var ctx = canvas.getContext('2d');
	this.calcPos(canvas);

	oldStyle = ctx.strokeStyle;

	if ( strokeStyle )
		ctx.strokeStyle = strokeStyle;
	else
		ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";

	ctx.beginPath();
	ctx.moveTo(this.startx, this.starty);
	ctx.lineTo(this.stopx, this.stopy);
	ctx.stroke();

	xstep = canvas.width/(this.M+2);
	ystep = canvas.height/(this.M+2);
	if ( this.orientation ) // 0 = horizontal, 1 = vertical
	{
		if ( this.x == 0 )
		{
			ctx.beginPath();
			ctx.moveTo(this.startx + this.M*xstep, this.starty);
			ctx.lineTo(this.stopx + this.M*xstep, this.stopy);
			ctx.stroke();
		}
	} else {
		if ( this.y == 0 )
		{
			ctx.beginPath();
			ctx.moveTo(this.startx, this.starty + this.M*xstep);
			ctx.lineTo(this.stopx, this.stopy + this.M*xstep);
			ctx.stroke();
		}
	}

	ctx.strokeStyle = oldStyle;
}

Segment.prototype.drawCar = function(canvas, strokeStyle) {
	var ctx = canvas.getContext('2d');

	pos = Math.floor(Math.random() * ((this.stopx - this.startx) + (this.stopy - this.starty)));
	oldStyle = ctx.strokeStyle;

	if ( strokeStyle )
		ctx.strokeStyle = strokeStyle;
	else
		ctx.strokeStyle = "rgba(0, 0, 255, 1)";

	xstep = canvas.width/(this.M+2);
	ystep = canvas.height/(this.M+2);
	if ( this.orientation )
	{
		ctx.beginPath();
		ctx.arc(this.startx, this.starty+pos, 2, 0, Math.PI*2, true);
		ctx.stroke();
		if ( this.x == 0 )
		{
			ctx.beginPath();
			ctx.arc(this.startx + this.M*xstep, this.starty+pos, 2, 0, Math.PI*2, true);
			ctx.stroke();
		}
	} else {
		ctx.beginPath();
		ctx.arc(this.startx+pos, this.starty, 2, 0, Math.PI*2, true);
		ctx.stroke();
		if ( this.y == 0 )
		{
			ctx.beginPath();
			ctx.arc(this.startx+pos, this.starty + this.M*ystep, 2, 0, Math.PI*2, true);
			ctx.stroke();
		}
	}

	ctx.strokeStyle = oldStyle;
}
