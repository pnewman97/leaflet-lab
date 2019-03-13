/* Stylesheet by Peter Newman, 2019 */

//create map and load data
var mymap = L.map('mapid').setView([40, -90], 4);
//getData(mymap);

//variable that will store index of current attribute (in this case, the given year)
var index = 0;

function setIndex(ind) {
	index = ind;
}

function getIndex() {
	return index;
}

//add tile layer
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


//filter cities list to only include top X cities ( x = attribute)
function updateFilter(map, attribute){
	
	var val = $('#filtervalue').html();
	
	map.eachLayer(function(layer){
    if (layer.feature && layer.feature.properties[attribute]){
        //access feature properties
        var props = layer.feature.properties;

        //update each feature's radius based on new attribute values
		if (props[attribute] > val) {
			var radius = calcPropRadius(props[attribute]);
			layer.setRadius(radius);
		}
		else layer.setRadius(null);

		createPopup(props, attribute, layer, radius);
        };
    });

}

function filterAttributes(data, map, attributes) {
	
	//create range input element (slider)
	$('#panel').append('<p> filter: </p>');
    $('#panel').append('<input class="range-slider" min="1" max="60" value="0" id="filter" type="range">');
	$('#panel').append('<p> Only show me cities that had at least</p><div id="filtervalue">' + 0 + '</div><p>murders per 100,000 in</p><div id="year">' + 1997 + '</div>');

    //input listener for slider
    $('#filter').on('input', function(){
        //get the new value
        var val = $(this).val();
			
		//replace filter content
		$('#filtervalue').html(val);
		var index = getIndex();
		updateFilter(map, attributes[index]);
    });	
}

//Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;
            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
			createPopup(props, attribute, layer, radius);
        };
    });
	$('#year').html(attribute.split("e")[1]);
	updateLegend(map, attribute);
	updateFilter(map, attribute);
}

function createPopup(properties, attribute, layer, radius) {
	//add city to popup content string
    var popupContent = "<p><b>City:</b> " + properties.City + "</p>";

    //add formatted attribute to panel content string
    var year = attribute.split("e")[1];
    popupContent += "<p><b>Murder rate in " + year + ":</b> " + properties[attribute] + " per 100k</p>";

    //replace the layer popup
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius)
    });
}

//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

function updateLegend(map, attribute) {

    //create content for legend (split in 'e' of 'mrate')
    var year = attribute.split("e")[1];
    var content = 'Homicide rate in year ' + year;

    //replace legend content
    $('#temporal-legend').html(content);
	
	//get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);
	
	   for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        //Step 3: assign the cy and r attributes
        $('#'+key).attr({
            cy: 59 - radius,
            r: radius
        });
		
		//Step 4: add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + " per 100k")
		
	};
		
}

//creates legend
function createLegend(map, attribute){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');
			var year = attribute.split("e")[1];
            $(container).append('<div id="temporal-legend">Homicide rate in year ' + year + '</div');
			
			//start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';
			 //array of circle names to base loop on
			var circles = {max: 20,
            mean: 40,
            min: 60};

			//loop to add each circle and text to svg string
			for (var circle in circles){
				//circle string
				svg += '<circle class="legend-circle" id="' + circle + '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="30"/>';

				//text string
				svg += '<text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';
			};

			//close svg string
			svg += "</svg>";
			
            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });

    map.addControl(new LegendControl());
};


//Create new sequence controls
function createSequenceControls(map, attributes){   
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            $(container).append('<input class="range-slider" id="sequence" type="range">');
			$(container).append('<button class="skip" id="reverse">Reverse</button>');
			$(container).append('<button class="skip" id="forward">Forward</button>');
	
			L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });
	
	

    map.addControl(new SequenceControl());
	
	//set slider attributes
	$('#sequence').attr({
		max: 7,
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
			index = index > 7 ? 0 : index;
		} else if ($(this).attr('id') == 'reverse'){
			index--;
			//if past the first attribute, wrap around to last attribute
			index = index < 0 ? 7 : index;
		};

		//update slider
		$('#sequence').val(index);
		
		//pass new attribute to update symbols
		updatePropSymbols(map, attributes[index]);
		
		//update global var index
		setIndex(index);
		
		function getIndex() {return index;}
	});

	//input listener for slider
	$('.range-slider').on('input', function(){
		//get the new index value
		var index = $(this).val();
		
		//Step 9: pass new attribute to update symbols
		updatePropSymbols(map, attributes[index]);
		function getIndex() {return index;}
		
		setIndex(index);
	});
	
}


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

    return attributes;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];

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

	createPopup(feature.properties, attribute, layer, options.radius);
	
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
			createLegend(mymap, attributes[0]);
        },
		error: function(xhr, status, error){alert(xhr.responseText);}
    });
	
	
	
};
$(document).ready(getData);