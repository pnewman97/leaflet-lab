/* Stylesheet by Peter Newman, 2019 */

//create map and load data
var mymap = L.map('mapid').setView([40, -90], 4);
//getData(mymap);

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
function createPropSymbols(data, map, attributes){
	 L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
		}
    }).addTo(map);
	
};

function updateFilter(map, val, attributes){


}

function filterAttributes(data, map, attributes) {
	

	
	//create range input element (slider)
	 $('#panel').append('<p> filter by: </p>');
    $('#panel').append('<input class="range-slider" min="1" max="60" value="60" id="filter" type="range">');
/* 	$('#panel').append('<button class="skip" id="decrease">-</button>');
    $('#panel').append('<button class="skip" id="increase">+</button>');
	
	//set slider attributes
    $('.range-slider').attr({
        max: 60,
        min: 1,
        value: 0,
        step: 1
    });
	
	//click listener for buttons
	$('.skip').click(function(){
        //get the old index value
		var index = $('.range-slider').val();
		
		//increment or decrement depending on button clicked
        if ($(this).attr('id') == 'increase'){
            index++;
            //if past the last attribute, wrap around to first attribute
            index = index > 60 ? 0 : index;
        } else if ($(this).attr('id') == 'decrease'){
            index--;
            //if past the first attribute, wrap around to last attribute
            index = index < 0 ? 60 : index;
        };

        //update slider
        $('.range-slider').val(index);
		
		//Step 9: pass new attribute to update symbols
        updateFilter(map, attributes[index]);
    }); */

    //input listener for slider
    $('#filter').on('input', function(){
        //get the new value
        var val = $(this).val();
	//	alert(val);
		
		//Step 9: pass new val to filter symbols
        L.geoJSON(data, {
			filter: function(feature, layer) {
			//return feature.properties.show_on_map;
				if (feature.properties.mrate1997 > val) return true;
				else return false;
			}
		}).addTo(map);
    });
	
	
	
//	var slider = document.getElementById("#filter");
//	alert(slider.value);


	
}

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.City + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("e")[1];
            popupContent += "<p><b>Murder rate in " + year + ":</b> " + props[attribute] + " per 100k</p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        };
    });
};

//create new sequence controls
function createSequenceControls(map, attributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" id="sequence" type="range">');
	$('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Forward</button>');
	
	//set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
	
	//click listener for buttons
	$('.skip').click(function(){
        //get the old index value
		var index = $('#sequence').val();
		
		//increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
        };

        //update slider
        $('#sequence').val(index);
		
		//Step 9: pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });

    //input listener for slider
    $('.range-slider').on('input', function(){
        //get the new index value
        var index = $(this).val();
		
		//Step 9: pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });
	
	
};

//build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("mrate") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
    //check
    console.log(attribute);

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
    popupContent += "<p><b>Murder rate in " + year + ":</b> " + feature.properties[attribute] + " per 100k</p>";
	
	

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
function getData(){
    //load the data
	
	data = "data/citymurderrates.geojson";
	
    $.ajax(data, {
        dataType: "json",
        success: function(response){
			var attributes = processData(response);
			createPropSymbols(response, mymap, attributes);
			createSequenceControls(mymap, attributes);
			filterAttributes(response, mymap, attributes);
        },
		error: function(xhr, status, error){alert(xhr.responseText);}
    });
	
	
	
};
$(document).ready(getData);