var map, geocoder;

// This function initiates the map on the user's welcome page/
function initMap() {
    var cleanSlate = [
		{
			featureType: "poi",
			elementType: "labels",
			stylers: [
				{ visibility: "off" } 
			]
		}
	];
		geocoder = new google.maps.Geocoder();
		map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 48.187, lng: -122.849},
          zoom: 10,
		  styles: cleanSlate
        });
		
		getUserLocation(map, true);
		populateMarkers(map);
		setInterval(function () {
			getUserLocation(map, false);
			populateMarkers(map);
		}, 5000);
		var image = {
			url: 'http://getdrawings.com/free-icon/blue-dot-icon-57.png',
			scaledSize: new google.maps.Size(20,20),
			origin: new google.maps.Point(0,0),
			anchor: new google.maps.Point(0,0)
		};
		var myloc = new google.maps.Marker({
			clickable: false,
			icon: image,
			shadow: null,
			zIndex: 999,
			map: map
		});


	}

// This page gets the current users location from the browser and set displays a marker on the map.
// If the setCenter flag is set, it will also center the map to the users location.
	  function getUserLocation(map, setCenter) {
		// Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude)			
			
			if (typeof getUserLocation.myloc == 'undefined'){
				getUserLocation.image = {
					url: 'http://getdrawings.com/free-icon/blue-dot-icon-57.png',
					scaledSize: new google.maps.Size(20,20),
					origin: new google.maps.Point(0,0),
					anchor: new google.maps.Point(0,0)
				};
				getUserLocation.myloc = new google.maps.Marker({
					clickable: false,
					icon: getUserLocation.image,
					shadow: null,
					zIndex: 999,
					map: map
				});
			}
			
			getUserLocation.myloc.setPosition(pos);
			if (setCenter){
				map.setCenter(pos);
			}
          }, function() {
            handleLocationError(true);
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false);
        }
	  }

// This function populates the restaurant markers on the map.
function populateMarkers(map) {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position){
			var userPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			// define markerList if not defined
			if(typeof populateMarkers.markerList == "undefined") {
				populateMarkers.markerList = {};
			}
			
			// remove markers which are not in radius - needs more work
/*			for (var key in populateMarkers) {
				if(google.maps.geometry.spherical.computeDistanceBetween(userPos,
					populateMarkers.markerList[key].getPosition()) > 5000) {
						populateMarkers.markerList[key].setMap(null);
						delete populateMarkers.markerList[key];
					}
			}
*/			
			//get restuarant data from db
			fetch("http://localhost:3000/Restaurants", {
				method: "GET",
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(function(res) {
				return res.json();
			}).then(function(res) {
        
				restaurantLoop:
				for(var i = 0; i < res.length; i++)
				{
					var key = res[i]._id;
					if (key in populateMarkers.markerList) {
						continue;
					}
					
					var address = res[i].restaurantAddress;			
					//Create a restaurant marker and append the marker to markerList.
					geocoder.geocode( {'address': address}, function(results, status) {
						if (status == 'OK') {
//							if(google.maps.geometry.spherical.computeDistanceBetween(userPos,
	//						results[0].geometry.location) <= 5000){
								populateMarkers.markerList[key] = new google.maps.Marker ({
								map: map,
								position: results[0].geometry.location
								});
		//					}
						} else {
							console.log ('Error: Geocode was not successful for the following reason: ' + status);
						}
					});
				}
			})
		}, function() {
			handleLocationError(true);
		});
	} else {
		handleLocationError(false);
	}
}

      function handleLocationError(browserHasGeolocation) {
        console.log(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
      }