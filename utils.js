Array.prototype.unify = function() {
	//assume sorted list of comparable elements
	var l = this.length;
	for (var i = 0; i < l; i++) {
		var x = 1;
		while ( this[i] == this[i+x] ) {
			x++;
		}
		this.splice(i, x-1);
		l -= x-1;
	}
}

Array.prototype.contains = function(element) {
	//assume sorted list of comparable elements
	var i = 0;
	while ( this[i] < element )
		i++;
	
	if ( this[i] === element )
		return true;

	return false;
}

Array.prototype.insert = function(element) {
	//assume sorted list of comparable elements
	var i = 0;
	while ( this[i] < element )
		i++;
	
	if ( !(this[i] === element) )
		this.splice(i, 0, element);
}

Array.prototype.remove = function(element) {
	//assume sorted list of comparable elements
	var i = 0;
	while ( this[i] < element )
		i++;

	if ( this[i] === element )
		this.splice(i, 1);
}
