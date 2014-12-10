var sort = require('ndarray-pixel-sort');
var ndcv = require('ndarray-canvas');
var ndArr = require('ndarray');
var $ = require('jquery');
var img;
var threshold = 50;

var main = (function(){

	var origCanvas1 = document.querySelector('#original-1');
	var origCtx1 = origCanvas1.getContext('2d');
	var imgData;
	var pxArr;
	var ndPxArr;
	var tmpImg = new Image();
	tmpImg.src = 'img/istanbul.jpg';
	var init = function() {
		tmpImg.onload = function() {
			origCtx1.drawImage(tmpImg, 0 , 0, 400, 400);
			imgData = origCtx1.getImageData(0,0,400,400);
			pxArr = imgData.data;
			ndPxArr = ndArr(pxArr, [4,1]);
			window.px = pxArr;
			window.ndPx = ndPxArr;
			for(var i =0; i < pxArr.length; i ++) {
				if(i%2 == 0) {
					if(px[i] > 100) { 
						px[i] = 10;
					}	 
				}	
			}
			origCtx1.putImageData(imgData, 0, 0);
		};

	};

	return {
		init : init
	};

})();

$(document).ready(main.init);

