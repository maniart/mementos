var Butter = /*
  Butter.js
  http://github.com/brandly/butter.js
*/

(function () {
  var validModes = ['black', 'bright', 'white'];
  var defaultMode = validModes[0];

  function Butter(mode, threshold) {
    this.mode = mode || defaultMode;
    if (validModes.indexOf(this.mode) === -1) {
      console.log('Butter has no mode called "' + this.mode + '".');
      this.mode = defaultMode;
    }

    // defaults
    this.threshold = {
      black: -10000000,
      white: -6000000,
      bright: 30
    };

    if (typeof threshold !== 'undefined' && threshold !== null) {
      this.threshold[this.mode] = threshold;
    }
  }


  Butter.prototype.sortImageData = function sortImageData(imageData, width, height, iterations) {
    this.imageData = imageData;
    this.width = width;
    this.height = height;
    iterations || (iterations = 1);
    var column = row = 0;
    //for (var i = 0; i < iterations; i++) {
    var _this = this;
    var rAFsortColumn = function() {
    	requestAnimationFrame(rAFsortColumn);
		if(column < _this.width) {
			_this.sortColumn(column);
			context.putImageData(_this.imageData, 0, 0);
			column++;
		}
    };
    var rAFsortRow = function() {
    	requestAnimationFrame(rAFsortRow);
		if(row < _this.height) {
			_this.sortRow(row);
			context.putImageData(_this.imageData, 0, 0);
			row++;
		}
    	
    };
    window.rAFsortColumn = rAFsortColumn;
    window.rAFsortRow = rAFsortRow;
    rAFsortColumn();
    //rAFsortRow();
      
  };

    //return this.imageData;
  //};
  Butter.prototype.sort = function sort(canvas, iterations) {
   
    if (!canvas) {
      throw 'Butter needs a <canvas> to sort';
    }
    var context = canvas.getContext('2d'),
        width = canvas.width,
        height = canvas.height,
        // Get the current data
        imageData = context.getImageData(0, 0, width, height);
        // And sort it
  	//debugger;
    //var sortedImage = this.sortImageData(imageData, width, height, iterations);
    
    
    this.sortImageData(imageData, width, height, iterations);
     
    //context.putImageData(sortedImage, 0, 0);
  };

  

  Butter.prototype.setThreshold = function setThreshold(value) {
    this.threshold[this.mode] = value;
  };

  Butter.prototype.sortColumn = function sortColumn(x) {
    var ranges = this.getRangesForColumn(x),
        range, width, pixelData;

    // For each range...
    for (var i = 0; i < ranges.length; i++) {
      range = ranges[i];
      width = range.end - range.start;

      pixelData = new Array(width);

      // Get all the pixels in that range
      for (var j = 0; j < width; j++) {
        pixelData[j] = this.getPixelValue(x, range.start + j);
      }
      // Sort them!
      pixelData.sort();

      // And put the new pixels back
      for (var j = 0; j < width; j++) {
        this.setPixelValue(x, (range.start + j), pixelData[j]);
      }
    }
  };

  Butter.prototype.sortRow = function sortRow(y) {
    var ranges = this.getRangesForRow(y),
        range, width, pixelData;

    // For each range...
    for (var i = 0; i < ranges.length; i++) {
      range = ranges[i];
      width = range.end - range.start;

      pixelData = new Array(width);

      // Get all the pixels in that range
      for (var j = 0; j < width; j++) {
        pixelData[j] = this.getPixelValue(range.start + j, y);
      }

      // Sort them!
      pixelData.sort();

      // And put the new pixels back
      for (var j = 0; j < width; j++) {
        this.setPixelValue((range.start + j), y, pixelData[j]);
      }
    }
  };

  Butter.prototype.getRangesForColumn = function getRangesForColumn(x) {
    var ranges = [],
        start = 0,
        end = 0,
        findFirst, findNext;

    switch(this.mode) {
      case 'black':
        findFirst = this.getFirstNotBlackY;
        findNext = this.getNextBlackY;
        break;

      case 'bright':
        findFirst = this.getFirstBrightY;
        findNext = this.getNextDarkY;
        break;

      case 'white':
        findFirst = this.getFirstNotWhiteY;
        findNext = this.getNextWhiteY;
        break;
    }

    for ( ; end < this.height; start = (end + 1)) {
      start = findFirst.call(this, x, start);
      end = findNext.call(this, x, start);

      // No more ranges
      if (start < 0 || start >= this.height) break;

      ranges.push({start: start, end: end});
    }
    return ranges;
  };

  Butter.prototype.getRangesForRow = function getRangesForRow(y) {
    var ranges = [],
        start = 0,
        end = 0,
        findFirst, findNext;

    switch(this.mode) {
      case 'black':
        findFirst = this.getFirstNotBlackX;
        findNext = this.getNextBlackX;
        break;

      case 'bright':
        findFirst = this.getFirstBrightX;
        findNext = this.getNextDarkX;
        break;

      case 'white':
        findFirst = this.getFirstNotWhiteX;
        findNext = this.getNextWhiteX;
        break;
    }

    for ( ; end < this.width; start = (end + 1)) {
      start = findFirst.call(this, start, y);
      end = findNext.call(this, start, y);

      // No more ranges
      if (start < 0 || start >= this.width) break;

      ranges.push({start: start, end: end});
    }
    return ranges;
  };

  /*
    Finders
  */

  Butter.prototype.getFirstNotBlackX = function getFirstNotBlackX(x, y) {
    // Loop until we find a match
    for ( ; this.getPixelValue(x, y) < this.threshold.black; x++) {
      // Oh no, we've reached the edge!
      if (x >= this.width) return -1;
    }
    // Return the match
    return x;
  }

  Butter.prototype.getNextBlackX = function getNextBlackX(x, y) {
    // We want the _next_ one
    x += 1;
    for ( ; this.getPixelValue(x, y) > this.threshold.black; x++) {
      if (x >= this.width) return this.width - 1;
    }
    return x;
  }


  Butter.prototype.getFirstBrightX = function getFirstBrightX(x, y) {
    for ( ; this.getPixelBrightness(x, y) < this.threshold.bright; x++) {
      if (x >= this.width) return -1;
    }
    return x;
  }

  Butter.prototype.getNextDarkX = function getNextDarkX(x, y) {
    x += 1;
    for ( ; this.getPixelBrightness(x, y) > this.threshold.bright; x++) {
      if (x >= this.width) return this.width - 1;
    }
    return x;
  }


  Butter.prototype.getFirstNotWhiteX = function getFirstNotWhiteX(x, y) {
    for ( ; this.getPixelValue(x, y) > this.threshold.white; x++) {
      if (x >= this.width) return -1;
    }
    return x;
  }

  Butter.prototype.getNextWhiteX = function getNextWhiteX(x, y) {
    x += 1;
    for ( ; this.getPixelValue(x, y) < this.threshold.white; x++) {
      if (x >= this.width) return this.width - 1;
    }
    return x;
  }


  Butter.prototype.getFirstNotBlackY = function getFirstNotBlackY(x, y) {
    for ( ; this.getPixelValue(x, y) < this.threshold.black; y++) {
      if (y >= this.height) return -1;
    }
    return y;
  }

  Butter.prototype.getNextBlackY = function getNextBlackY(x, y) {
    y += 1;
    for ( ; this.getPixelValue(x, y) > this.threshold.black; y++) {
      if (y >= this.height) return this.height - 1;
    }
    return y;
  }


  Butter.prototype.getFirstBrightY = function getFirstBrightY(x, y) {
    for ( ; this.getPixelBrightness(x, y) < this.threshold.bright; y++) {
      if (y >= this.height) return -1;
    }
    return y;
  }

  Butter.prototype.getNextDarkY = function getNextDarkY(x, y) {
    y += 1;
    for ( ; this.getPixelBrightness(x, y) > this.threshold.bright; y++) {
      if (y >= this.height) return this.height - 1;
    }
    return y;
  }


  Butter.prototype.getFirstNotWhiteY = function getFirstNotWhiteY(x, y) {
    for ( ; this.getPixelValue(x, y) > this.threshold.white; y++) {
      if (y >= this.height) return -1;
    }
    return y;
  }

  Butter.prototype.getNextWhiteY = function getNextWhiteY(x, y) {
    y += 1;
    for ( ; this.getPixelValue(x, y) < this.threshold.white; y++) {
      if (y >= this.height) return this.height - 1;
    }
    return y;
  }

  /*
    Utilities
  */

  Butter.prototype.getPixelOffset = function getPixelOffset(x, y) {
    return (x + y * this.width) * 4;
  };

  Butter.prototype.setPixelValue = function setPixelValue(x, y, val) {
    var offset = this.getPixelOffset(x, y),
        r = (val >> 16) & 255,
        g = (val >> 8) & 255,
        b = val & 255,
        data = this.imageData.data;

    data[offset] = r;
    data[offset + 1] = g;
    data[offset + 2] = b;
  }

  Butter.prototype.getPixelValue = function getPixelValue(x, y) {
    var offset = this.getPixelOffset(x, y),
        data = this.imageData.data,
        r = data[offset],
        g = data[offset + 1],
        b = data[offset + 2];

    return ( ((255 << 8) | r) << 8 | g) << 8 | b;
  }

  Butter.prototype.getPixelBrightness = function getPixelBrightness(x, y) {
    var offset = this.getPixelOffset(x, y),
        data = this.imageData.data,
        r = data[offset],
        g = data[offset + 1],
        b = data[offset + 2];

    return Math.max(r, g, b) / 255 * 100;
  }

  return Butter;
  
}());
//debugger;
var $, 
	_, 
	Worker, 
	butter,
	output,
	context,
	width,
	height,
	sources,
	init;

$ = require('jquery');
_ = require('underscore');
output = document.querySelector('#output');

context = output.getContext('2d');
//Butter = require('butter.js');
//butter = new rker('../node_modules/butter.js/src/butter-worker.js');
//butter = new Butter('white', -10000000);
butter = new Butter('bright', -10000000);
/*
butter.addEventListener('message', function afterSort(e) {
  context.putImageData(e.data.imageData, 0, 0);
}, false);
*/

width = output.width;
height = output.height;
sources = [];
	
init = function() {
	console.log('mementos \nMani Nilchiani \n2014 \nNYC \nhttp://maninilchiani.com');
	context.globalCompositeOperation = 'multiply';
	_.times(2, function() { sources.push(new Image()); });
	sources[0].src = 'img/youngme.jpg';
	sources[1].src = 'img/kitchenlight.jpg';
	sources[0].onload = function() {
		sources[1].onload = function() {
			_.each(sources, function(source) { context.drawImage(source, 0, 0, width, height); });				
			//debugger;
			//context.drawImage(sources[0], 0, 0, width, height);
			//debugger;
			butter.sort(output);
			/*
			butter.postMessage({
				imageData: context.getImageData(0, 0, canvas.width, canvas.height),
				width: width,
				height: height,
				mode: 'black'
			});
			*/
		}
	};

};


$(document).ready(init);

