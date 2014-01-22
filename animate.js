window.onload = function () {

    var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/4fd891040a8a4ecb805c388019e23d46/64082/256/{z}/{x}/{y}.png';

    var basemap = new L.TileLayer(cloudmadeUrl, {maxZoom: 18});
    var latlng = new L.LatLng(30, -88);
    var delay = 350;		// animation delay (larger is slower)
    var Npoints;		// number of points per track
    var isRunning = true;
	
//multiply x by 1.155 after translation
    function showTimeStep(p) {
	//for(var p=0;p<=pts.length;p++){
	
	if(p>0)
		map.removeLayer(polygon);

	  pt = pts[p];
		var deg;
		var size;
		
	  if (pt !== undefined) {
		
		size = arrowSize[p];
		deg = arrowAngle[p];
		
		var x = pt[0] + size;
		var rad = deg * Math.PI/180;
		var slope = Math.tan(rad);
		var deltaX = pt[0]-x;
		var deltaY = slope * (deltaX);
		var y = pt[1] - deltaY;
		var parts = [];
		
		parts.push(0.00);
		parts.push(",");
		parts.push(0.00+size);
		parts.push(":");
		parts.push(0.00+size);
		parts.push(",");
		parts.push(0.00+size/3);
		parts.push(":");
		parts.push(0.00+size/3);
		parts.push(",");
		parts.push(0.00+size/3);
		parts.push(":");
		parts.push(0.00+size/3);
		parts.push(",");
		parts.push(0.00-size);
		parts.push(":");
		parts.push(0.00-size/3);
		parts.push(",");
		parts.push(0.00-size);
		parts.push(":");
		parts.push(0.00-size/3);
		parts.push(",");
		parts.push(0.00+size/3);
		parts.push(":");
		parts.push(0.00-size);
		parts.push(",");
		parts.push(0.00+size/3);
		parts.push(":");
		parts.push(0.00);
		parts.push(",");
		parts.push(0.00+size);
		var combined = parts.join(" ");
		var a = combined.split(":");
		var ans = [];
		for(var k=0;k<a.length;k++){
		var latLong = a[k].split(",");
		ans.push([ parseFloat(latLong[0]), parseFloat(latLong[1]) ]);
		
}
		 domain = {"type": "Polygon", "coordinates": [ans]};		

//alert(ans);
		//$.getJSON("domain", function(ans) {
	//L.geoJson(domain, {style: {fill: false}
			//  }).addTo(map);
			  
		var sine = Math.sin(-deg);
		var cos = Math.cos(-deg);
		
		for (var i=0;i<ans.length;i++){

		var px=ans[i][0];
        var py=ans[i][1];
		
        //rotate
        var xnew = (px*cos)-(py*sine);
        var ynew = (px*sine)+(py*cos);

		px=((xnew+pt[0]));
        py=((ynew+pt[1]));
		
        ans[i][0]=px;
        ans[i][1]=py;
		
		
    }
	var domain = {"type": "Polygon", "coordinates": [ans]};		
	polygon = L.geoJson(domain, {style: {fill: true,fillColor: "#ff0000",color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.8
}
			  });
	polygon.addTo(map);
    //})
	    }
	//}
	
			//alert(isRunning);

		if (isRunning) {
	    nextp = (p + 1);
		//alert(nextp);
	    setTimeout(function(i) {
		return function() {
		    showTimeStep(i);
		}
	    }(nextp), delay);
	}
    }

    /*function animateLines(data) {
	// initialize empty linestring layers
	for (var i=0; i<data.coordinates.length; i++) {
	    pt = data.coordinates[i][0];
	    var polyline = L.polyline([], {color: 'red'});
	    polyline.track_id = i;
	    tracks.addLayer(polyline);
	}
	showTimeStep(0);
    }*/
				
	var pts =[];
	var arrowSize = [];
	var arrowAngle = [];
	function animateLines(data) {
	alert("here");
			$.each(data.points,function(index,value){
			$.each(value.point,function(index,value){
			pt = value.latLng;
			//alert(pt);
			size = value.size;
			angle = value.angle;
			pts.push(pt);
			arrowSize.push(size);
			arrowAngle.push(angle);
			})
			})
		showTimeStep(0);
    }

    function onMapClick(e) {
	console.log("you clicked.", e.latlng);
	var scale = 0.1;
	var pt = e.latlng;
	var polyline = L.polyline([[pt.lat, pt.lng]], {color: 'red'})
	for (var i=0; i<Npoints; i++) {
	    pt.lat += (Math.random() - 0.4) * scale;
	    pt.lng += (Math.random() - 0.4) * scale;
	    polyline.addLatLng([pt.lat, pt.lng]);
	}
	tracks.addLayer(animateLine(polyline.toGeoJSON()));
    }
    var tracks = L.layerGroup([])
    var map = new L.Map('map', {center: latlng, zoom: 7, layers: [basemap, tracks]});
    //map.on('click', onMapClick);
    map.addControl(new MyButton({layer: tracks}));
    var url = "txla10day.json";
    var tracklines = null;

    /*$.getJSON(url, function(mydata) {
	tracklines = mydata;
    })
	.fail(function(xhr, statustext) { 
	    // Doesn't like NaNs in JSON data
	    tracklines = JSON.parse(xhr.responseText.replace(/NaN/g,'null'));
	})
	.done(function() {
	    // assume all lines have the same number of points
	    Npoints = 301;
	    animateLines(tracklines);
	});*/
	
	
	var url1 = "pointsData.json";
	//alert(url1);
    $.getJSON(url1, function(mydata) {
		tracklines = mydata;
	//$.each(mydata.points.point,function(index,value){ alert(value.size);})
    })
	.fail(function(xhr, statustext) { 
		tracklines = JSON.parse(xhr.responseText.replace(/NaN/g,'null'));
	})
	.done(function() {
	    // assume all lines have the same number of points
	    Npoints = 301;
	    animateLines(tracklines);
	});
	
  };

MyButton = L.Control.extend({
    // define the "clear tracks" button
    options: {
	position: 'topleft',
	layer: null
    },
    initialize: function (options) {
	this._button = {};
	this.setButton(options);
	this._layer = options.layer;
    },
 
    onAdd: function (map, tracks) {
	this._map = map;
	this._tracks = tracks;
	var container = L.DomUtil.create('div', 'leaflet-control-button');
	this._container = container;
	this._update();
	return this._container;
    },
 
    onRemove: function (map) {
    },
 
    clearPoints: function (e) {
	console.log("Clear!");
	this._layer.clearLayers();
    },

    setButton: function (options) {
	var button = {
	    'text': 'Clear tracks', //string
	    'onClick': this.clearPoints, //callback function
	    'hideText': false, //forced bool
	    'maxWidth': 70, //number
	    'doToggle': false,	//bool
	    'toggleStatus': false	//bool
	};
 
	this._button = button;
	this._update();
    },
    getText: function () {
	return this._button.text;
    },
    destroy: function () {
	this._button = {};
	this._update();
    },
    toggle: function (e) {
	if(typeof e === 'boolean'){
	    this._button.toggleStatus = e;
	}
	else{
	    this._button.toggleStatus = !this._button.toggleStatus;
	}
	this._update();
    },
    _update: function () {
	if (!this._map) {
	    return;
	}


	this._container.innerHTML = '';
	this._makeButton(this._button);
    },

    _makeButton: function (button) {
	var newButton = L.DomUtil.create('div', 'leaflet-buttons-control-button', this._container);
	if(button.toggleStatus)
	    L.DomUtil.addClass(newButton,'leaflet-buttons-control-toggleon');
	if(button.text !== ''){
	    
	    L.DomUtil.create('br','',newButton); //there must be a better way
	    
	    var span = L.DomUtil.create('span', 'leaflet-buttons-control-text', newButton);
	    var text = document.createTextNode(button.text); //is there an L.DomUtil for this?
	    span.appendChild(text);
	    if(button.hideText)
		L.DomUtil.addClass(span,'leaflet-buttons-control-text-hide');
	}
	
	L.DomEvent
	    .addListener(newButton, 'click', L.DomEvent.stop)
	    .addListener(newButton, 'click', button.onClick,this)
	    .addListener(newButton, 'click', this._clicked,this);
	L.DomEvent.disableClickPropagation(newButton);
	return newButton;

    },
    _clicked: function () { //'this' refers to button
	if(this._button.doToggle){
	    if(this._button.toggleStatus) {	//currently true, remove class
		L.DomUtil.removeClass(this._container.childNodes[0],'leaflet-buttons-control-toggleon');
	    }
	    else{
		L.DomUtil.addClass(this._container.childNodes[0],'leaflet-buttons-control-toggleon');
	    }
	    this.toggle();
	}
	return;
    }
});
