importScripts('block.js');
importScripts('car.js');
importScripts('segment.js');
importScripts('utils.js');

A = 10; //number of tiers (<= floor(M/2))
gamma = 1.5; // > 0
delta = 1; //guard factor for transmission
eta = 0.2; // average packet rate -> average inter-packet-interval 1/eta -> random inter-packet-interval between 1 and 2*(1/eta)

M = 20;
n = 2000;
r = 1/(M-1);
run = false;
canvasWidth = 0;
canvasHeight = 0;
p_ac = 2*Math.ceil(1+delta)*Math.ceil(2+delta);
timeslot = 0; //counter for the communication animation (used for synchronization of time slots)

self.addEventListener('message', function(e) {
	var data = e.data;
	switch(data.cmd) {
		case 'setDimensions':
			canvasWidth = +data.w;
			canvasHeight = +data.h;
			break;
		case 'setM':
			M = +data.value;
			r = 1/(M-1);
			break;
		case 'setN':
			n = +data.value;
			break;
		case 'setA':
			A = +data.value;
			break;
		case 'setDelta':
			delta = +data.value;
			p_ac = 1/(2*Math.ceil(1+delta)*Math.ceil(2+delta));
			break;
		case 'setGamma':
			gamma = +data.value;
			break;
		case 'init':
			init();
			break;
		case 'start':
			run = true;
			animate();
			break;
		case 'stop':
			run = false;
			break;
	}
});

function highlightBlock(block, strokeStyle) {
	Segments[block.topSegment()].drawSegment(strokeStyle);
	Segments[block.leftSegment()].drawSegment(strokeStyle);
	Segments[block.bottomSegment()].drawSegment(strokeStyle);
	Segments[block.rightSegment()].drawSegment(strokeStyle);
}

function log(message) {
	self.postMessage({'cmd': 'log', 'msg': message});
}

function init(){
	delete Segments;
	delete Blocks;
	delete Vehicles;
	Segments = new Array(2*Math.pow(M,2));
	for (var i = 0; i < Segments.length; i++)
	{
		Segments[i] = new Segment(M, i);
	}
	//drawGrid();

	Blocks = new Array(Math.pow(M,2));
	for (i=0; i < Blocks.length; i++)
	{
		Blocks[i] = new Block(i, M);
	}

	Vehicles = new Array(n);
	for (var i = 0; i < n; i+=2)
	{
		var home = Math.floor(Math.random()*(Math.pow(M,2)));
		var c1 = new Car(i, home, M, Blocks, Segments);
		var c2 = new Car(i+1, home, M, Blocks, Segments);
		Vehicles[i] = c1;
		var s1 = Segments[c1.getSegment()];
		s1.addCar(i);
		//s1.drawCar(Vehicles, i);
		Vehicles[i+1] = c2;
		var s2 = Segments[c2.getSegment()];
		s2.addCar(i+1);
		//s2.drawCar(Vehicles, i+1);
	}
};

function drawGrid() {
	for (i = 0; i < Segments.length; i++)
		Segments[i].drawSegment();
}

function draw() {
	self.postMessage({'cmd': 'clearCanvas'});
	drawGrid();
	for ( var i = 0; i < Vehicles.length; i++ )
	{
		var c = Vehicles[i];
		var s = Segments[c.getSegment()];
		s.drawCar(Vehicles, i);
	}
}

function animate(callback) {
	calculatePositions();
	calculateCommunication();
	draw();

	if ( run )
		setTimeout(function() { animate(callback) }, 1000);
	else if ( callback )
		callback.call();
}

function calculatePositions() {
	for (var i=0; i < Vehicles.length; i++)
	{
		Vehicles[i].calculatePosition(Blocks);
	}
}

function calculateCommunication() {
	var transmitters = new Array();
	for (var i = 0; i < Vehicles.length; i++ )
	{
		if ( Vehicles[i].backoff > 0 ) {
		(Vehicles[i].backoff)--;
		}
	}

	log("p_ac: " + p_ac);
	/* Every Segment becomes active every p_ac time slots,
	this is implementes as every p_ac segment becomes active
	and they are cycled every time slot */
	for ( var i = timeslot++; i < Segments.length; i+= Math.floor(p_ac) )
	{
		var s = Segments[i];
		if ( s.cars.length < 2 )
			continue;

		/* Look for S-D-Pairs in the current segment */
		var sdpairs = new Array();
		for ( var j = 0; j < s.cars.length; j++ )
		{
			var c = Vehicles[s.cars[j]].n;
			var target = undefined;
			if ( c % 2 === 0 ) {
				if ( Vehicles[c+1].getSegment() == i )
					target = c+1;
			} else {
				if ( Vehicles[c-1].getSegment() == i )
					target = c-1;
			}

			/* The transmission partner is in the same segment */
			if ( target != undefined ) {
				sdpairs.push({'source': c, 'destination': target});
				log("S-D-Pair found: " + c + " -> " + target + ": " + sdpairs);
			}
		}

		/* We have at least one S-D-Pair */
		if ( sdpairs.length > 0 )
		{
			/* Select one of the present S-D-Pairs */
			var pair = Math.floor(Math.random()*sdpairs.length);
			log("sdpairs[" + pair + "] = " + sdpairs[pair]);
			var source = sdpairs[pair].source;
			var destination = sdpairs[pair].destination;
			/* Check whether the selected pair has a packet pending */
			if ( Vehicles[source].backoff === 0 )
			{
				/* We transmit our packet */
				Vehicles[source].backoff = Math.floor(Math.random()*2*(1/eta)) * 1;
				Vehicles[source].state = 1;
				Vehicles[destination].state = 2;
				//s.drawCar(Vehicles, source);
				//s.drawCar(Vehicles, destination);
			}
		} else {
			/* Choose v_a randomly from the cars in the current segment */
			var v_a = Math.floor(Math.random()*s.cars.length);
			/* Choose v_b randomly and independent from the rest of the vehicles */
			var v_b = Math.floor(Math.random()*(s.cars.length-1));
			if ( v_b >= v_a )
				v_b++;

			/* One of the chosen cars is sender the other one is receiver
			 * Which is which is chosen randomly */
			var source, destination;
			if ( Math.floor(Math.random()*2) > 0 ) {
				source = s.cars[v_a];
				destination = s.cars[v_b];
			} else {
				source = s.cars[v_b];
				destination = s.cars[v_a];
			}

			if ( Vehicles[source] === undefined )
				log("Ooops: " + v_a + ", " + v_b + ", " + source + ", " + destination)
			/* Check whether there is data to be transmitted */
			if ( Vehicles[source].backoff === 0 ) {
				/* We transmit our packet */
				Vehicles[source].backoff = Math.floor(Math.random()*2*(1/eta)) * 1;
				Vehicles[source].state = 1;
				Vehicles[destination].state = 2;
				//s.drawCar(Vehicles, source);
				//s.drawCar(Vehicles, destination);
			}
		}
	}
}

function assertNumber(n, f) {
	if ( typeof(n) !== 'number' ) {
		self.postMessage({'cmd': 'log', 'msg': f + ": " + n + ' not a number!'});
		self.close();
		return false;
	}
	return true;
}
