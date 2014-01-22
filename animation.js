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

sdtransmissions = 0; //source-destination
srtransmissions = 0; //source-relay
rdtransmissions = 0; //relay-destination
transmissions = {
	'sd': new Array(),
	'sr': new Array(),
	'rd': new Array(),
	'average': new Array(),
	'delays': new Array(),
};
delays = new Array();

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
	transmissions['sd'].push(sdtransmissions/n);
	transmissions['sr'].push(srtransmissions/n);
	transmissions['rd'].push(rdtransmissions/n);
	var average = transmissions['sd'].reduce(function(a,b) { return a+b; })/transmissions['sd'].length;
	transmissions['average'] = Array.apply(0, Array(transmissions['sd'].length)).map(function() { return average; })
	transmissions['delays'].push(delays.reduce(function(a,b) { return a+b; })/delays.length);
	self.postMessage({'cmd': 'drawChart', 'data': transmissions });

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
	sdtransmissions = 0;
	srtransmissions = 0;
	rdtransmissions = 0;
	var transmitters = new Array();
	for (var i = 0; i < Vehicles.length; i++ )
	{
		var v = Vehicles[i];
		v.backoff--;
		for ( var j = 0; j < v.buffer.length; j++ )
			(v.buffer[j]['backoff'])--;
		v.state = 0;
	}

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
			}
		}

		/* We have at least one S-D-Pair */
		if ( sdpairs.length > 0 )
		{
			/* Select one of the present S-D-Pairs */
			var pair = Math.floor(Math.random()*sdpairs.length);
			var source = sdpairs[pair].source;
			var destination = sdpairs[pair].destination;
			/* Check whether the selected pair has a packet pending */
			if ( Vehicles[source].backoff <= 0 )
			{
				delays.push(Vehicles[source].backoff*-1);
				/* We transmit our packet */
				Vehicles[source].backoff = Math.floor(Math.random()*2*(1/eta)) * 1;
				Vehicles[source].state = 1;
				Vehicles[destination].state = 2;
				//s.drawCar(Vehicles, source);
				//s.drawCar(Vehicles, destination);
				sdtransmissions += 1;
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
			if ( Math.floor(Math.random()*2) > 0 ) {
				/* Check whether there is data to be transmitted */
				if ( Vehicles[v_a].backoff <= 0 ) {
					var backoff = Vehicles[v_a].backoff;
					/* We transmit our packet */
					Vehicles[v_a].backoff = Math.floor(Math.random()*2*(1/eta)) * 1;
					Vehicles[v_a].state = 1;
					Vehicles[v_b].state = 2;
					c = Vehicles[v_a].n;
					if ( c % 2 === 0 ) {
						Vehicles[v_b].buffer.insert({ 'target': c+1, 'backoff': backoff });
					} else {
						Vehicles[v_b].buffer.insert({ 'target': c-1, 'backoff': backoff });
					}
					srtransmissions += 1;
				}
			} else {
				for ( var i = 0; i < Vehicles[v_b].buffer.length; i++ )
				{
					if ( Vehicles[v_b].buffer[i]['target'] === v_a ) {
						delays.push(Vehicles[v_b].buffer[i]['backoff']*-1);
						Vehicles[v_b].state = 1;
						Vehicles[v_a].state = 2;
						Vehicles[v_b].buffer.splice(i, 1);
						rdtransmissions += 1;
					}
				}
			}
		}
	}
	log('sd: ' + sdtransmissions + ', sr: ' + srtransmissions + ', rd: ' + rdtransmissions);
}

function assertNumber(n, f) {
	if ( typeof(n) !== 'number' ) {
		self.postMessage({'cmd': 'log', 'msg': f + ": " + n + ' not a number!'});
		self.close();
		return false;
	}
	return true;
}
