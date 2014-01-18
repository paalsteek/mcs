Block = function(n, nRoads) {
	if ( !assertNumber(n, "Block") || !assertNumber(nRoads, "Block") )
		return;

	this.n = n;
	this.M = nRoads;
	this.tiers = new Array(A);
}

Block.prototype.topSegment = function() {
	return 2*this.n;
}

Block.prototype.leftSegment = function() {
	return 2*this.n+1;
}

Block.prototype.rightSegment = function() {
	var res = 2*this.n+3;
	if ( this.n % this.M == this.M - 1 )
		res -= 2*this.M
	return res;
}

Block.prototype.bottomSegment = function() {
	if ( this.n >= this.M*(this.M - 1) )
		return 2*((this.n+this.M)%this.M);
	else
		return 2*(this.n+this.M);
}

Block.prototype.upperLeft = function() {
	var res = this.n - this.M - 1;
	if ( this.n < this.M ) {
		res += Math.pow(this.M, 2);
	}
	if ( this.n % this.M == 0 ) {
		res += this.M;
	}
	return res;
}

Block.prototype.up = function() {
	var res = this.n - this.M;
	if ( this.n < this.M ) {
		res += Math.pow(this.M, 2);
	}
	return res;
}

Block.prototype.upperRight = function() {
	var res = this.n - this.M + 1;
	if ( this.n < this.M ) {
		res += Math.pow(this.M, 2);
	}
	if ( this.n % this.M == this.M - 1 ) {
		res -= this.M;
	}
	return res;
}

Block.prototype.left = function() {
	var res = this.n - 1;
	if ( this.n % this.M == 0 ) {
		res += this.M;
	}
	return res;
}

Block.prototype.right = function() {
	var res = this.n + 1;
	if ( this.n % this.M == this.M - 1 ) {
		res -= this.M;
	}
	return res;
}

Block.prototype.lowerLeft = function() {
	var res = this.n + this.M - 1;
	if ( this.n % this.M == 0 ) {
		res += this.M;
	}
	if ( this.n >= this.M*(this.M-1) ) {
		res -= Math.pow(this.M, 2);
	}
	return res;
}

Block.prototype.low = function() {
	var res = this.n + this.M;
	if ( this.n >= this.M*(this.M-1) ) {
		res -= Math.pow(this.M, 2);
	}
	return res;
}

Block.prototype.lowerRight = function() {
	var res = this.n + this.M + 1;
	if ( this.n % this.M == this.M - 1 ) {
		res -= this.M;
	}
	if ( this.n >= this.M*(this.M-1) ) {
		res -= Math.pow(this.M, 2);
	}
	return res;
}

Block.prototype.tier = function(n, blocks) {
	if ( !assertNumber(n, "tier") )
		return;

	if ( n < 0 ) return;

	if ( this.tiers[n] !== undefined )
		return this.tiers[n];

	if ( n == 1 ) {
		var s = new Array(this.topSegment(), this.rightSegment(), this.bottomSegment(), this.leftSegment()).sort();
		var b = new Array(1);
		b[0] = this.n;
		var c = new Array(1);
		c[0] = this.n;
		var res = {
			segments: s,
			blocks: b,
			seen: c
		};
		this.tiers[n] = res;
		return res;
	} else {
		var t = this.tier(n-1, blocks);
		var b = {
			segments: new Array(),
			blocks: new Array(),
			seen: t.seen
		};
		for ( var i = 0; i < t.blocks.length; i++ )
		{
			var block = blocks[t.blocks[i]];
			var a = new Array(block.upperLeft(), block.up(), block.upperRight(), block.left(), block.right(), block.lowerLeft(), block.low(), block.lowerRight());
			for ( var j = 0; j < a.length; j++ )
			{
				var nBlock = blocks[a[j]];
				if ( !b.seen.contains(a[j]) )
				{
					b.blocks.push(a[j]);
					b.seen.insert(a[j]);
					var s = new Array(nBlock.topSegment(), nBlock.rightSegment(), nBlock.bottomSegment(), nBlock.leftSegment());
					for ( var k = 0; k < s.length; k++ )
					{
						if ( !t.segments.contains(s[k]) )
							b.segments.insert(s[k]);
					}
				}
			}
		}
		this.tiers[n] = b;
		return b;
	}
}
