function linePlaneIntersect(planeNormal, planePoint, linePointOne, linePointTwo){
	//solve for d = ( (planePoint - linePointOne) dot planeNormal ) / (vector_in_direction_of_line dot planeNormal) 
	//from https://en.wikipedia.org/wiki/Line%E2%80%93plane_intersection
	let lineVector = [];
	for(let i = 0; i<linePointOne.length; i++){
		lineVector.push(linePointTwo[i] - linePointOne[i]);
	}
	let denom = dotProduct(lineVector, planeNormal);
	if (denom === 0) return [10000,10000,10000]; //line/plane are parallel, return a value guaranteed to be off-screen
	let difference = [];
	for(let i = 0; i<linePointOne.length; i++){
		difference.push(planePoint[i] - linePointTwo[i]);
	}
	let numerator = dotProduct(difference, planeNormal);
	if (numerator === 0) return [10000,10000,10000]; //I think this means the line is in the plane, should also be off screen?
	let d = numerator/denom;
	let intersection = [];
	for(let i = 0; i<linePointOne.length; i++){
		intersection.push(d*lineVector[i] + linePointTwo[i]);
	}
	return intersection;
}

function matrixVectorMultiply(A, v){
	b = [];
	for(let i = 0; i < v.length; i++){
		b.push([v[i]]);
	}
	rec = matrixMultiply(A,b);
	rtn = [];
	for(let i = 0; i < rec.length; i++){
		rtn.push(rec[i][0]);
	}
	return rtn;
}

function matrixMultiply(a, b){
	if(a[0].length != b.length){
		console.log("attemping to multiply " + a.length + "x" + a[0].length + " & " + b.length + "x" + b[0].length + " matrix");
		return null;
	}
	rtn = [];
	for(let i = 0; i < a.length; i++){
		temp = [];
		for(let j = 0;j < b[0].length; j++){
			sm = 0;
			for(let k = 0; k < a[0].length; k++){
				sm += a[i][k]*b[k][j];
			}
			temp.push(sm);
		}
		rtn.push(temp);
	}
	return rtn;
}


function dotProduct(v1, v2){
	if(v1.length !== v2.length) console.log("different size vectors");
	let sum = 0;
	for(let i = 0; i<v1.length; ++i){
		sum += v1[i]*v2[i];
	}
	return sum;
}

