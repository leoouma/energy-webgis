var map = L.map("map").setView([-1.286389, 36.817223], 7);

var darkBasemap = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
  }
).addTo(map);

function onMapMove() {
  var latlng = map.getCenter();
  document.getElementById(
    "coordinates"
  ).innerText = `Coordinates: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(
    4
  )}`;
}
map.on("move", onMapMove);

var lineStyles = {
  "132kV": { color: "green", weight: 2 },
  "220kV": { color: "yellow", weight: 2 },
  "400kV": { color: "blue", weight: 2 },
  "500kV HVDC": { color: "red", weight: 3 },
};

fetch("data/transmission_lines.geojson")
  .then((res) => res.json())
  .then((data) => {
    L.geoJSON(data, {
      style: function (feature) {
        return (
          lineStyles[feature.properties.voltage] || { color: "gray", weight: 1 }
        );
      },
      onEachFeature: function (feature, layer) {
        var popupContent = `<b>Name:</b> ${feature.properties.name}<br>
                                    <b>Voltage:</b> ${feature.properties.voltage}<br>
                                    <b>Commissioned:</b> ${feature.properties.commissioning_date}<br>
                                    <b>Length:</b> ${feature.properties.length_km} km`;
        layer.bindPopup(popupContent);
      },
    }).addTo(map);
  });

var countyLayer = L.geoJSON("data/county.geojson", {
  style: { color: "white", weight: 2 },
}).addTo(map);
var subCountyLayer = L.geoJSON("data/subcounty.geojson", {
  style: { color: "white", weight: 1 },
}).addTo(map);

var layerControl = L.control
  .layers(null, {
    Counties: countyLayer,
    "Sub-Counties": subCountyLayer,
  })
  .addTo(map);

// Measurement tool
var measureControl = new L.Control.Draw({
  draw: {
    polyline: true,
    polygon: false,
    rectangle: false,
    circle: false,
    marker: false,
  },
});
map.addControl(measureControl);

map.on("draw:created", function (e) {
  var layer = e.layer;
  map.addLayer(layer);
});
