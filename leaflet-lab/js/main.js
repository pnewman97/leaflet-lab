/* Stylesheet by Peter Newman, 2019 */

//create map and load data
var mymap = L.map('mapid').setView([40, -90], 4);
getData(mymap);

//add tile layer...replace project id and accessToken with your own
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicG5ld21hbjk3IiwiYSI6ImNqc2F2MG0ycTAzazY0NG11bTRlZ3BvOGEifQ.VBh0-vpJuLzzBxLT_4PeDA'
}).addTo(mymap);

//display all attributes of feature when clicked
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

function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 50;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};


//creats proportional symbols
function createPropSymbols(data, map){
	 L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
	
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng){
    //Determine which attribute to visualize with proportional symbols
    var attribute = "mrate2018";

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string starting with city...Example 2.1 line 24
    var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p>";

    //add formatted attribute to popup content string (splitting after the letter e in mrate)
    var year = attribute.split("e")[1];
    popupContent += "<p><b>Murder rate in " + year + ":</b> " + feature.properties[attribute] + " per 100k";
	
	

    //bind the popup to the circle marker, with support for mobile using offset
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius) 
    });
	
	//event listeners to open popup on hover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        }
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};


//function to retrieve the data and place it on the map
function getData(map){
    //load the data
	
	data = "data/citymurderrates.geojson";
	
    $.ajax(data, {
        dataType: "json",
        success: function(response){
			
            //create a Leaflet GeoJSON layer and add it to the map
 //           L.geoJson(response, {
 //               onEachFeature: onEachFeature
 //           }).addTo(map);
			
			//add symbols
			createPropSymbols(response, map);
			
        },
		error: function(xhr, status, error){alert(xhr.responseText);}
    });
	
	
	
};
