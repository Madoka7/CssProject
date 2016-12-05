window.onload=function(){
	// canvas init
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");

	// canvas dimensions
	var W = window.innerWidth;
	var H = window.innerHeight;
	canvas.width = W;
	canvas.height = H;


	// snowflake particles
	var mp = 25; //max snowflakes
	var particles = [];
	for(var i = 0; i < mp;i++){
		particles.push({
			x : Math.random()*W, //x-coordinate
			y : Math.random()*H, //y-coordinate
			r : Math.random()*4 + 1, //radius
			d : Math.random()*mp //density
		})
	}

	// draw particles
	function draw(){
		ctx.clearRect(0,0,W,H);
		ctx.fillStyle = "rgba(255,255,255,0.8)"; //set color
		//ctx.clearRect(0,0,W,H);//clear
		ctx.beginPath();
		for(var i = 0; i < mp;i++){
			var p = particles[i];
			ctx.moveTo(p.x,p.y);
			ctx.arc(p.x,p.y,p.r,0,Math.PI*2,true);
		}
		ctx.fill();
		update();
	}

	var angle = 0;
	//update particles
	function update(){
		angle += 0.01;
		for(var i = 0;i < mp;i++){
			var p = particles[i];
			p.y += Math.cos(angle + p.d) + 1 + p.r/2;
			p.x += Math.sin(angle);

			if(p.x > W + 5||p.x < -5||p.y > H){
				if(i % 3 > 0){
					particles[i] = {
						x : Math.random()*W,
						y : -10,
						r : p.r,
						d : p.d
					}
				}
				else{
					if(Math.sin(angle) > 0){
						particles[i] = {
							x : -5,
							y : Math.random()*H,
							r : p.r,
							d : p.d
						}
					}
					else{
						particles[i] = {
							x : p.x + 5,
							y : Math.random()*H,
							r : p.r,
							d : p.d
						}
					}
				}
			}
		}
	}

	// animate loop
	setInterval(draw,33)
}