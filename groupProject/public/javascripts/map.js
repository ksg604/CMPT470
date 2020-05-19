var map, geocoder;
var markerList = {};

function setStarRating(business){

	var starAvg = 0;
        
	for(var i = 0; i < business.reviews.length; i++){
		starAvg += parseInt(business.reviews[i].rating);
	}
	starAvg = starAvg / business.reviews.length;

	const starPercentage = starAvg * 100;

	const starPercentageRounded = `${Math.round(starPercentage / 10) * 10}%`;

	console.log(starPercentageRounded);
 
	
	// Set width of stars-inner to percentage
	
	document.querySelector(`.${name} .stars-inner`).style.width = starPercentageRounded;


	
}
//check open day for restaurants
function checkOpenDay(business){
	let currentDate = new Date();
	let currentDay = currentDate.getDay();
	if(currentDay == 0 && business.su == true){
		return true;
	}
	else if(currentDay == 1 && business.m == true){
		return true;
	}
	else if(currentDay == 2 && business.tu == true){
		return true;
	}
	else if(currentDay == 3 && business.w == true){
		return true;
	}
	else if(currentDay == 4 && business.th == true){
		return true;
	}
	else if(currentDay == 5 && business.fr == true){
		return true;
	}
	else if(currentDay == 6 && business.sa == true){
		return true;
	}
	else{
		return false;
	}
}
//check open time for restaurants
function checkOpenTime(business){
	let currentDate = new Date();
	let currentHour = currentDate.getHours();
	let currentMinute = currentDate.getMinutes() + (60 * currentHour);
	let businessOpenTime = business.openingHour.split(":");
	let businessCloseTime = business.closingHour.split(":");
	let openMinute = parseInt(businessOpenTime[1]) + (60 * ( parseInt(businessOpenTime[0])));
	let closeMinute = parseInt(businessCloseTime[1]) + (60 * ( parseInt(businessCloseTime[0])));
	// console.log("Current Minute: " + currentMinute + " open minute: " + openMinute + " closeMinute : " + closeMinute);
	if(openMinute == closeMinute){
		return true;
	}
	else if(openMinute < closeMinute){
		if(currentMinute >= openMinute && currentMinute < closeMinute){
			return true;
		}
		else{
			return false;
		}
	}
	else if(openMinute > closeMinute){
		//Maximum value of time = 23 * 60 + 59
		if(currentMinute>= openMinute && currentMinute <= 1439){
			return true;
		}
		else if(currentMinute >= 0 && currentMinute < closeMinute){
			return true;
		}
		else{
			return false;
		}
	}
}



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
		zoom: 15,
		styles: cleanSlate
	});

	getUserLocation(map, true);
	populateMarkers(map);
	setInterval(function () {
		getUserLocation(map, false);
		populateMarkers(map);
	}, 5000);
}

// This function initiates the map on the business's welcome page/
function initBusinessMap() {
	var cleanSlate = [
		{
			featureType: "poi",
			elementType: "labels",
			stylers: [
				{ visibility: "off" }
			]
		}
	];
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 49.187, lng: -122.849},
		zoom: 18,
		styles: cleanSlate
	});
	// var image = {
	// 	url: 'http://getdrawings.com/free-icon/blue-dot-icon-57.png',
	// 	scaledSize: new google.maps.Size(20,20),
	// 	origin: new google.maps.Point(0,0),
	// 	anchor: new google.maps.Point(0,0)
	// };
	var myloc = new google.maps.Marker({
		clickable: false,
		// icon: image,
		// shadow: null,
		// zIndex: 999,
		map: map
	});
	console.log(typeof business);
	business = JSON.parse(business);
	pos = new google.maps.LatLng(business.coordinates[0],business.coordinates[1]);
	myloc.setPosition(pos);
	map.setCenter(pos);
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
	var currUser = JSON.parse(currentUser);
	console.log(currUser.name);
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position){
			var userPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			// define markerList if not defined
			if(typeof markerList == "undefined") {
				markerList = {};
			}

			// remove markers which are not in radius - needs more work
			for (var key in markerList) {
				if(google.maps.geometry.spherical.computeDistanceBetween(userPos,
					markerList[key].position) > (markerList[key].radius*1000))
					{
						markerList[key].setMap(null);
						delete markerList[key];
					}
				}

				//get restuarant data from db
				fetch("/api/getAllBusinesses", {
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
						setStarRating[res[i]];
						var key = res[i]._id;
						if (key in markerList) {
							continue;
						}
						var markerPosition = new google.maps.LatLng(res[i].coordinates[0],res[i].coordinates[1]);
						if(google.maps.geometry.spherical.computeDistanceBetween(userPos,markerPosition) <=
						(res[i].radius*1000))
						{
							markerList[key] = new google.maps.Marker ({
								map: map,
								position: markerPosition,
								radius: res[i].radius
							});
							// make info window content and object
							content = '<h3>'+res[i].name+'</h3>';
							content += addAverageReviewStars(res[i]);
							if(currUser.currentRestraunt != null){
								content += "<p>You have another current booking.</p>"
							}
							else if(!checkOpenDay(res[i])){
								
								content += "<p>Closed today</p>";
				  
							}
							else if(!checkOpenTime(res[i])){
								content += "<p>Currently closed, please check the timings</p>";

							}
							else if(res[i].queueList.length >= res[i].queue){
								content += "<p>Current Queue is full.</p>"
  
							}
							else{
								content += "<p>Current Queue: "+res[i].queueList.length+"<br>"+
								"<a href='/user/book?id="+ res[i]._id +"'>Book</a></p>";
							}
							content += 	"<a href='/user/businessReview?id="+ res[i]._id + "&name=" + currUser.name + "'>Write Review</a></p><br>"+
							"Opens at: "+res[i].openingHour+"<br>"+
							"Closes at: "+res[i].closingHour+"<br></p>";
							markerList[key].info = new google.maps.InfoWindow({
								content: content
							});
							markerList[key].data = res[i];
							markerList[key].addListener('click', function() {
								this.info.open(map, this);
							});
						}
					}
					updateTable();
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

		function updateTable() {

			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position){
					var tableArray = [];
					var currUser = JSON.parse(currentUser);
					var userPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

					for(var key in markerList){
						businessData = markerList[key].data;
						var element = {};
						element.name = businessData.name;
						//construct full address
						if(typeof typeof businessData.add1 == "string")
						element.address = businessData.add1 + " ";
						if(typeof businessData.add2 == "string")
						element.address += businessData.add2.length > 0 ? (businessData.add2+" ") : "";
						element.address += businessData.city+", ";
						element.address += businessData.state+" "+businessData.zip;

						element.hours = businessData.openingHour+" - "+businessData.closingHour;
						element.currentQueue = businessData.queueList.length;
						element.maxQueue = businessData.queue;
						element.id = businessData._id;
						element.isClosed = (!checkOpenDay(businessData) || !checkOpenTime(businessData));
						element.distance = google.maps.geometry.spherical.computeDistanceBetween(userPos,
							markerList[key].position);
							tableArray.push(element);
						}
						tableArray.sort(function(a,b) {
							return a.distance - b.distance;
						});
						//remove all elements from the current table
						var oTable = document.getElementById("businessTable");
						var tableBody = oTable.getElementsByTagName('tbody')[0];
						var sumAge = 0;
						for(i = tableBody.rows.length - 1; i >= 0; i--) {
							tableBody.deleteRow(i);
						}
						//add new rows to the table
						for(i = 0; i < tableArray.length; i++){
							var row = tableArray[i];
							var newRow = tableBody.insertRow(tableBody.rows.length);
							var newNameCell = newRow.insertCell(0);
							newNameCell.innerHTML = row.name;
							var newAddressCell = newRow.insertCell(1);
							newAddressCell.innerHTML = row.address;
							var newHoursCell = newRow.insertCell(2);
							newHoursCell.innerHTML = row.hours;
							var newQueueCell = newRow.insertCell(3);
							newQueueCell.innerHTML = row.currentQueue.toString();
							var newDistanceCell = newRow.insertCell(4);
							if(row.distance > 1000)
							newDistanceCell.innerHTML = (row.distance/1000).toFixed(2) + " km";
							else
							newDistanceCell.innerHTML = (row.distance).toFixed(0) + " m"
							var newActionCell = newRow.insertCell(5);
							if(currUser.currentRestraunt != null || row.isClosed || row.currentQueue >= row.maxQueue)
							newActionCell.innerHTML = "<a class='disabled' href='/user/book?id="+ row.id +"'>Booking Unavailable</a></p>";
							else
							newActionCell.innerHTML = "<a href='/user/book?id="+ row.id +"'>Book</a></p>";

						}
					});
				}
				else {
					handleLocationError(false);
				}
			}

			
function addAverageReviewStars(businessData) {
	var content = "";
	var reviews = businessData.reviews;
	var averageReview = 0;
	for(var i=0; i < reviews.length; i++)
	{
		review = reviews[i];
		averageReview += review.rating;
	}
	averageReview = Math.floor(averageReview/reviews.length);
	for(var i = 0 ; i < averageReview; i++)
	{
		content += "<span class=\"fa fa-star checked\"></span>";
	}
	for(var i =0; i < (5 - averageReview); i++)
	{
		content += "<span class=\"fa fa-star unchecked\"></span>";
	}
	return content;
}