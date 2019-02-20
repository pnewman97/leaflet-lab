/* Stylesheet by Peter Newman, 2019 */

var mymap = L.map('mapid').setView([40, -90], 4);
getData(mymap);

//add tile layer...replace project id and accessToken with your own
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicG5ld21hbjk3IiwiYSI6ImNqc2F2MG0ycTAzazY0NG11bTRlZ3BvOGEifQ.VBh0-vpJuLzzBxLT_4PeDA'
}).addTo(mymap);

//function to instantiate the Leaflet map

function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
	//(unable to properly read from geojson file for some reason, not sure why)
    $.ajax("data/citymurderrates.geojson", {
        dataType: "json",
        success: function(response){
			
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
                onEachFeature: onEachFeature
            }).addTo(map);
        },
		error: function(xhr, status, error){alert(xhr.responseText);}
    });
};
