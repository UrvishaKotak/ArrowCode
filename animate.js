window.onload = function () {

var cloudmadeUrl = 'http://{s}.tiles.mapbox.com/v3/urvishakotak.i7mg3d06/{z}/{x}/{y}.png';

var basemap = new L.TileLayer(cloudmadeUrl, {
maxZoom : 18
});
var latlng = new L.LatLng(28.42039, -92.10937);
var timelatlng = new L.LatLng(23, -95);
var delay = 320; // animation delay (larger is slower)
var Npoints; // number of points per track
var isRunning = true;
var multiPolygon = [];
var multiP;
var pi = 3.14159265;
var storedTracks = new Map();
var animate = false;
var m;
var sizeArrayLength;

function showTimeStep(j) {
tracks.eachLayer(function (layer) {

if (animate == false) {
tracks.clearLayers();

for (m = 0; m < pointLength; m++) {

var n = m.toString();
var latLngPoint = arrowsDataMap.get(n).get(j).get(1);

var size = arrowsDataMap.get(n).get(j).get(2);

var angle = arrowsDataMap.get(n).get(j).get(3);
//angle = angle * (pi / 180);

var parts = [];
parts.push(0.00);
parts.push(",");
parts.push(0.00 + size / 1.5);
parts.push(":");
parts.push(0.00 + size / 3);
parts.push(",");
parts.push(0.00 + size / 12);
parts.push(":");
parts.push(0.00 + size / 12);
parts.push(",");
parts.push(0.00 + size / 12);
parts.push(":");
parts.push(0.00 + size / 12);
parts.push(",");
parts.push(0.00 - size / 3);
parts.push(":");
parts.push(0.00 - size / 12);
parts.push(",");
parts.push(0.00 - size / 3);
parts.push(":");
parts.push(0.00 - size / 12);
parts.push(",");
parts.push(0.00 + size / 12);
parts.push(":");
parts.push(0.00 - size / 3);
parts.push(",");
parts.push(0.00 + size / 12);
var combined = parts.join(" ");
var a = combined.split(":");
var ans = [];
for (var k = 0; k < a.length; k++) {
var latLong = a[k].split(",");
ans.push([parseFloat(latLong[0]), parseFloat(latLong[1])]);
}
domain = {
"type" : "Polygon",
"coordinates" : [ans]
};

var sine = Math.sin(-angle);
var cos = Math.cos(-angle);
var point = [];
var latLngPoints = [];

for (var i = 0; i < ans.length; i++) {

var px = ans[i][0];
var py = ans[i][1];

//rotate
var xnew = (px * cos) - (py * sine);
var ynew = (px * sine) + (py * cos);

px = ((xnew + latLngPoint[0]));
py = ((ynew + latLngPoint[1]));
ans[i][0] = px;
ans[i][1] = py;

point[i] = L.latLng(py, px);

}
multiPolygon[m] = point;
}

multiP = L.multiPolygon(multiPolygon);
multiP.setStyle({
fillColor : '#ff0000'
});
multiP.setStyle({
fillOpacity : 1
});
multiP.setStyle({
stroke : false
});

tracks.addLayer(multiP);

var myIcon = L.divIcon({
className : 'my-div-icon',
html : timeData[j],
iconSize : [200, 40]
});
// you can set .my-div-icon styles in CSS
L.marker([31, -84], {
icon : myIcon
}).addTo(map);

storedTracks.set(j, multiP);
}
});

//alert(j + 1);
//alert(sizeArrayLength);
if (j + 1 == sizeArrayLength) {
animate = true;
}

if (animate == true) {
nextj = (j + 1) % Npoints;
//console.log("nextj=" + nextj);
setTimeout(function (i) {
return function () {
repeatLayers(i);
}
}
(nextj), delay);
}

if (j < sizeArrayLength) {
nextj = (j + 1) % Npoints;
setTimeout(function (i) {
//alert(i);
return function () {
showTimeStep(i);
}
}
(nextj), delay);
}
}

function repeatLayers(j) {
tracks.clearLayers();
//console.log(j);
//console.log(storedTracks.get(j));
tracks.addLayer(storedTracks.get(j));
var myIcon = L.divIcon({
className : 'my-div-icon',
html : time[j],
iconSize : [200, 40]
});
// you can set .my-div-icon styles in CSS
L.marker([31, -84], {
icon : myIcon
}).addTo(map);
}

var pts = [];
var arrowSize = [];
var arrowAngle = [];
var arrowsDataMap = new Map();
var pointLength;

var time = [];
var timeData;

function animateLines(data) {

pointLength = data.arrow.points.length;


timeData = data.arrow.time;
//alert(timeData);
//time = timeData.split(",");
sizeArrayLength = data.arrow.points["0"].point[0].size.length;
//alert(sizeArrayLength);
for (var viewEntryKey in data.arrow.points) {
var arrowsMap = new Map();
var sizeArray = data.arrow.points[viewEntryKey].point[0].size;
var angleArray = data.arrow.points[viewEntryKey].point[0].angle;

for (var i = 0; i < sizeArrayLength; i++) {
var arrowMap = new Map();

arrowMap.set(1, data.arrow.points[viewEntryKey].point[0].latLng);
arrowMap.set(2, sizeArray[i]);
arrowMap.set(3, angleArray[i]);
arrowsMap.set(i, arrowMap);

//alert(arrowsMap.get(i).get(3));
}
arrowsDataMap.set(viewEntryKey, arrowsMap);
}

for (var m = 0; m < pointLength; m++) {
var n = m.toString();
//alert(arrowsDataMap.get(n).get(0).get(3));
//tracklines = arrowsDataMap.get(n).get(0).get(1)
var polygon = L.polygon([], {
color : 'red'
});
polygon.track_id = n;
tracks.addLayer(polygon);
}

var runScript = showTimeStep(0);
}

function onMapClick(e) {
console.log("you clicked.", e.latlng);
var scale = 0.1;
var pt = e.latlng;
var polyline = L.polyline([
[pt.lat, pt.lng]
], {
color : 'red'
})
for (var i = 0; i < Npoints; i++) {
pt.lat += (Math.random() - 0.4) * scale;
pt.lng += (Math.random() - 0.4) * scale;
polyline.addLatLng([pt.lat, pt.lng]);
}
tracks.addLayer(animateLine(polyline.toGeoJSON()));
}
var tracks = L.layerGroup([])
var map = new L.Map('map', {
center : latlng,
zoom : 7,
layers : [basemap, tracks]
});
//map.on('click', onMapClick);
map.addControl(new MyButton({
layer : tracks
}));

map.on('click', function (e) {
alert(e.latlng);
});
var url = "data.json";
var tracklines = null;

$.getJSON(url, function (mydata) {
tracklines = mydata;
})

.done(function () {
// assume all lines have the same number of points
Npoints = 10;
animateLines(tracklines);
});
};

MyButton = L.Control.extend({
// define the "clear tracks" button
options : {
position : 'topleft',
layer : null
},
initialize : function (options) {
this._button = {};
this.setButton(options);
this._layer = options.layer;
},

onAdd : function (map, tracks) {
this._map = map;
this._tracks = tracks;
var container = L.DomUtil.create('div', 'leaflet-control-button');
this._container = container;
this._update();
return this._container;
},

onRemove : function (map) {},

clearPoints : function (e) {
console.log("Clear!");
this._layer.clearLayers();
},

setButton : function (options) {
var button = {
'text' : 'Clear tracks', //string
'onClick' : this.clearPoints, //callback function
'hideText' : false, //forced bool
'maxWidth' : 70, //number
'doToggle' : false, //bool
'toggleStatus' : false //bool
};

this._button = button;
this._update();
},
getText : function () {
return this._button.text;
},
destroy : function () {
this._button = {};
this._update();
},
toggle : function (e) {
if (typeof e === 'boolean') {
this._button.toggleStatus = e;
} else {
this._button.toggleStatus = !this._button.toggleStatus;
}
this._update();
},
_update : function () {
if (!this._map) {
return;
}

this._container.innerHTML = '';
this._makeButton(this._button);
},

_makeButton : function (button) {
var newButton = L.DomUtil.create('div', 'leaflet-buttons-control-button', this._container);
if (button.toggleStatus)
L.DomUtil.addClass(newButton, 'leaflet-buttons-control-toggleon');
if (button.text !== '') {

L.DomUtil.create('br', '', newButton); //there must be a better way

var span = L.DomUtil.create('span', 'leaflet-buttons-control-text', newButton);
var text = document.createTextNode(button.text); //is there an L.DomUtil for this?
span.appendChild(text);
if (button.hideText)
L.DomUtil.addClass(span, 'leaflet-buttons-control-text-hide');
}

L.DomEvent
.addListener(newButton, 'click', L.DomEvent.stop)
.addListener(newButton, 'click', button.onClick, this)
.addListener(newButton, 'click', this._clicked, this);
L.DomEvent.disableClickPropagation(newButton);
return newButton;

},
_clicked : function () { //'this' refers to button
if (this._button.doToggle) {
if (this._button.toggleStatus) { //currently true, remove class
L.DomUtil.removeClass(this._container.childNodes[0], 'leaflet-buttons-control-toggleon');
} else {
L.DomUtil.addClass(this._container.childNodes[0], 'leaflet-buttons-control-toggleon');
}
this.toggle();
}
return;
}
});
