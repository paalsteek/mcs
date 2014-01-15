importScripts('block.js');
importScripts('car.js');
importScripts('segment.js');
importScripts('utils.js');

A = 10; //number of tiers (<= floor(M/2))
gamma = 1.5 // > 0

M = 20;
n = 2000;
run = false;
canvasWidth = 0;
canvasHeight = 0;

self.addEventListener('message', function(e) {
	var data = e.data;
	switch(data.cmd) {
		case 'setDimensions':
			canvasWidth = +data.w;
			canvasHeight = +data.h;
			break;
		case 'setM':
			M = +data.value;
			break;
		case 'setN':
			n = +data.value;
			break;
		case 'setA':
			A = +data.value;
			break;
		case 'setGamma':
			gamma = +data.value;
			break;
		case 'init':
			init();
			break;
		case 'start':
			run = true;
			animate(self.close);
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

function init(){
	delete Segments;
	delete Blocks;
	delete Vehicles;
	Segments = new Array(2*Math.pow(M,2));
	for (i = 0; i < Segments.length; i++)
	{
		Segments[i] = new Segment(M, i);
	}
	drawGrid();

	Blocks = new Array(Math.pow(M,2));
	for (i=0; i < Blocks.length; i++)
	{
		Blocks[i] = new Block(i, M);
	}

	Vehicles = new Array(n);
	for (i = 0; i < n; i+=2)
	{
		var home = Math.floor(Math.random()*(Math.pow(M,2)));
		var c1 = new Car(home, M);
		var c2 = new Car(home, M);
		Vehicles[i] = c1;
		var b1 = Blocks[c1.home];
		var s1 = Segments[b1.tier(c1.tier, Blocks).segments[c1.segment]];
		s1.drawCar();
		var c2 = new Car(home, M);
		Vehicles[i+1] = c2;
		var b2 = Blocks[c2.home];
		var s2 = Segments[b2.tier(c2.tier, Blocks).segments[c2.segment]];
		s2.drawCar();
	}
};

function drawGrid() {
	for (i = 0; i < Segments.length; i++)
		Segments[i].drawSegment();
}

function animate(callback) {
	self.postMessage({'cmd': 'clearCanvas'});
	drawGrid();
	for (i=0; i < Vehicles.length; i++)
	{
		Vehicles[i].move();
		s = Segments[Vehicles[i].getSegment()];
		s.drawCar(i==0 ? "red" : null);
	}
	if ( run )
		setTimeout(function() { animate() }, 1000);
	else if ( callback )
		callback.call();
}
