var $ = require('jquery');
var _ = require('underscore');

var main = (function(){

	var origCanvas1 = document.querySelector('#original-1');
	var origCtx1 = origCanvas1.getContext('2d');
	var origCanvas2 = document.querySelector('#original-2');
	var origCtx2 = origCanvas2.getContext('2d');
	var destCanvas = document.querySelector('#dest');
	var destCtx = destCanvas.getContext('2d');
	var destImgData = destCtx.createImageData(400, 800);
	var img1 = new Image();
	var img2 = new Image();
	var imgData1, imgData2, img1PxArray, img2PxArray, destPxArray, destArrBuff;
	var pxArr;
	img1.src = 'img/youngme.jpg';
	img2.src = 'img/kitchenlight.jpg';
	var init = function() {
		img1.onload = function() {
			origCtx1.drawImage(img1, 0 , 0, 400, 400);
			imgData1 = origCtx1.getImageData(0, 0, 400, 400);
			img1PxArray = Array.prototype.slice.call(imgData1.data);
		};
		img2.onload = function() {
			origCtx2.drawImage(img2, 0 , 0, 400, 400);
			imgData2 = origCtx2.getImageData(0, 0, 400, 400);
			img2PxArray = Array.prototype.slice.call(imgData2.data);
			window.img1 = img1PxArray;
			window.img2 = img2PxArray;
			destArrBuff = new Uint8ClampedArray(_.shuffle(img1PxArray.concat(img2PxArray)));
			
			destImgData.data.set(destArrBuff);
			destCtx.putImageData(destImgData, 0, 0);
		};

	};

	return {
		init : init
	};

}());

$(document).ready(main.init);

