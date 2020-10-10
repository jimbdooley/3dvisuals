var mainCanvas = document.getElementById("mainCanvas");
var mainCtx = mainCanvas.getContext("2d");

document.getElementById("mainCanvas").addEventListener("wheel", zoom);
function zoom(e) {
	if(e.deltaY > 0)
		TD.viewer.alpha = Math.max(0.04,TD.viewer.alpha/1.1);
	if(e.deltaY < 0)
		TD.viewer.alpha = Math.min(1,TD.viewer.alpha*1.1)
} 

document.getElementById("mainCanvas").addEventListener("mousedown", waitForUp);
waitingForUp = false;
initialY =0;
currentY = 0;
initialX =0;
currentX = 0;
holdSpin= 0;
function waitForUp(e){ 
	waitingForUp = true; 
	rect = mainCanvas.getBoundingClientRect();
	initialY = e.clientY - rect.top
	currentY = initialY;
	initialX = e.clientX - rect.left
	currentX = initialX;
	document.getElementById("mainCanvas").addEventListener("mousemove",updatePos);
	
}
function updatePos(e){
	if (holdSpin == 0) holdSpin = TD.viewer.turn_rate;
	tempY = e.clientY-mainCanvas.getBoundingClientRect().top;
	if(Math.abs(tempY-currentY)> 3) {
		TD.viewer.rotate_up( (currentY-tempY)/600 );
		currentY = tempY;
	}
	tempX = e.clientX-mainCanvas.getBoundingClientRect().left;
	if(Math.abs(tempX-currentX)> 3) {
		TD.viewer.rotate( (currentX-tempX)/20 );
		currentX = tempX;
	}
	if( Math.abs(initialX - currentX) > 50) {
		TD.viewer.turn_rate=0;
	}
}

document.getElementById("mainCanvas").addEventListener("mouseup", cameUp);
document.getElementById("mainCanvas").addEventListener("mouseleave", cameUp);
function cameUp(e){
	waitingForUp = false;
	document.getElementById("mainCanvas").removeEventListener("mousemove",updatePos);
	if (TD.viewer.turn_rate == 0)	TD.viewer.turn_rate=holdSpin;
	holdSpin =0;
}

t=0
function bowl(x, y){
	//return 1*Math.sin(1*x-1*t)*Math.cos(1*y-2*t);
	return Math.sin(x)+Math.cos(y)
}

function createInitialPaths(){
	TD.paths.push([[0,0,0],[1,0,0]]);
	TD.paths.push([[0,0,0],[0,1,0]]);
	TD.paths.push([[0,0,0],[0,0,1]]);
	TD.paths.push([[0,3.5,0],[2.5,3.5,0]])
	TD.paths.push([[2.5,3.5,0],[2.5,0,0]])
	TD.paths.push([[2.5,0,0],[0,0,0]])
	TD.paths.push([[0,0,0],[0,3.5,0]])
	zRotate = [[Math.sqrt(0.5),Math.sqrt(0.5),0],[-Math.sqrt(0.5),Math.sqrt(0.5),0],[0,0,1]];
	xRotate = [[1,0,0],[0,Math.sqrt(0.5),Math.sqrt(0.5)],[0,-Math.sqrt(0.5),Math.sqrt(0.5)]];
	
	/*
	temp1 = []
	for(let i = TD.paths.length-4; i < TD.paths.length; i++){
		temp1.push([matrixVectorMultiply(xRotate, TD.paths[i][0]), matrixVectorMultiply(xRotate, TD.paths[i][1])]);
	}
	for(let i = 0; i < 4; i++) TD.paths.push(temp1[i]);
	*/
	
	temp1 = []
	for(let i = TD.paths.length-4; i < TD.paths.length; i++){
		temp1.push([matrixVectorMultiply(zRotate, TD.paths[i][0]), matrixVectorMultiply(zRotate, TD.paths[i][1])]);
	}
	for(let i = 0; i < 4; i++) TD.paths.push(temp1[i]);
	
}

var TD = {
	func:function(){},
	paths:[],
	screen:{
		H:0,
		W:0,
	},
	viewer:{
		turn_rate:0.5,
		default_distance:2,
		yaw:Math.PI/2,
		pitch:Math.atan(-8/15),
		angle_from_horizontal:Math.atan(-8/15),
		distance_from_center:17,
		
		loc:[0,-20,10],
		gaze:[0,.8,-0.1],
		d:20,
		alpha:0.14,
		speed:0.02,
		w:0,
		h:0,
		
		rotate_up:function(delta){
			let previous_distance = Math.sqrt(Math.pow(TD.viewer.distance_from_center,2) - Math.pow(TD.viewer.loc[2],2));
			TD.viewer.angle_from_horizontal += delta;
			TD.viewer.angle_from_horizontal = Math.min(TD.viewer.angle_from_horizontal, 0.95*Math.PI/2);
			TD.viewer.angle_from_horizontal = Math.max(TD.viewer.angle_from_horizontal, -0.95*Math.PI/2);
			TD.viewer.loc[2] = -TD.viewer.distance_from_center * Math.sin(TD.viewer.angle_from_horizontal);
			let remaining_distance = Math.sqrt(Math.pow(TD.viewer.distance_from_center,2) - Math.pow(TD.viewer.loc[2],2));
			TD.viewer.loc[0] *= remaining_distance/previous_distance;
			TD.viewer.loc[1] *= remaining_distance/previous_distance;
			
			TD.viewer.pitch = TD.viewer.angle_from_horizontal;
			TD.viewer.update_from_pitch_yaw();
			TD.draw();
		},
		
		change_pitch:function(delta){
			TD.viewer.pitch += delta;
			TD.viewer.pitch = Math.min( Math.PI/2,TD.viewer.pitch);
			TD.viewer.pitch = Math.max(-Math.PI/2,TD.viewer.pitch);
			TD.viewer.update_from_pitch_yaw();
		},
		
		change_yaw:function(delta){
			TD.viewer.yaw += delta;
			TD.viewer.update_from_pitch_yaw();
		},
		
		update_from_pitch_yaw:function(){
			TD.viewer.gaze[2] = Math.sin(TD.viewer.pitch);
			let xy_dist = Math.sqrt(1-Math.pow(TD.viewer.gaze[2],2));
			TD.viewer.gaze[0] = xy_dist*Math.cos(TD.viewer.yaw);
			TD.viewer.gaze[1] = xy_dist*Math.sin(TD.viewer.yaw);
			TD.viewer.normalize_gaze();
			TD.viewer.set_hw();
		},
		
		set_hw:function(){
			TD.viewer.h = Math.sqrt(1-Math.pow(TD.viewer.gaze[2],2))*TD.viewer.d*TD.viewer.alpha/2;
			if (TD.viewer.gaze[2] < 0){
				TD.viewer.w = Math.abs(TD.viewer.gaze[2]*TD.viewer.d*TD.viewer.alpha/2);
			}
			else{
				TD.viewer.w = -Math.abs(TD.viewer.gaze[2]*TD.viewer.d*TD.viewer.alpha/2);
			}
		},
		
		normalize_gaze:function(){
			let gaze_d = Math.sqrt(Math.pow(TD.viewer.gaze[0],2) + Math.pow(TD.viewer.gaze[1],2)+ Math.pow(TD.viewer.gaze[2],2));
			for(let i = 0; i < 3; ++i){
				TD.viewer.gaze[i] /= gaze_d;
			}
		},
		
		get_theta_from_center:function(){
			if((TD.viewer.loc[0] >= 0 ) && (TD.viewer.loc[1] >= 0 ) ){
				return Math.atan(TD.viewer.loc[1]/TD.viewer.loc[0]);
			}
			if(TD.viewer.loc[0] < 0){
				return Math.PI + Math.atan(TD.viewer.loc[1]/TD.viewer.loc[0]);
			}
			else{
				return 2*Math.PI + Math.atan(TD.viewer.loc[1]/TD.viewer.loc[0]);
			}
		},
		
		rotate:function(direction){
			let d = Math.sqrt(Math.pow(TD.viewer.loc[0],2) + Math.pow(TD.viewer.loc[1],2));
			let theta = TD.viewer.get_theta_from_center();
			theta += direction*TD.viewer.speed;
			TD.viewer.loc[0] = d*Math.cos(theta);
			TD.viewer.loc[1] = d*Math.sin(theta);
			TD.viewer.yaw = theta-Math.PI;
			TD.viewer.update_from_pitch_yaw();
		},
		
	},
	
	
	draw:function(){
		mainCtx.clearRect(0,0,mainCanvas.width, mainCanvas.height);
		
		for(let i = 0; i < TD.paths.length; ++i){
			plot3d(TD.paths[i]);
			for(let j =0; j < TD.paths[i].length-1; j++){
				plotPoint(TD.paths[i][j], TD.viewer)
			}
		}
	},
	
	control:function(){
		//TD.viewer.rotate(TD.viewer.turn_rate);
		TD.viewer.rotate(0);
		TD.draw();
		
		let funTheta = 0.1;
		rotator = [[Math.cos(funTheta),Math.sin(funTheta),0],[-Math.sin(funTheta),Math.cos(funTheta),0],[0,0,1]];
		rotator2 = [[1,0,0],[0,Math.cos(funTheta),Math.sin(funTheta)],[0,-Math.sin(funTheta),Math.cos(funTheta)]];
		rotator3 = [[Math.cos(funTheta),0,-Math.sin(funTheta)],[0,1,0],[Math.sin(funTheta),0,Math.cos(funTheta)]];
		for(let i = TD.paths.length-4; i < TD.paths.length; i++){
			TD.paths[i][0] = matrixVectorMultiply(rotator3, TD.paths[i][0]);
			TD.paths[i][1] = matrixVectorMultiply(rotator3, TD.paths[i][1]);
		}
		t += 1/60;
		setTimeout(function(){ TD.control() }, 33);
	},
	
	init:function(){
		TD.viewer.alpha *= TD.viewer.default_distance;
		TD.screen.H = document.getElementById("mainCanvas").height + 0;
		TD.screen.W = document.getElementById("mainCanvas").width + 0;
		TD.viewer.update_from_pitch_yaw();
		TD.func = bowl;
		createInitialPaths();
		
		TD.control();
	},
};
TD.init();

