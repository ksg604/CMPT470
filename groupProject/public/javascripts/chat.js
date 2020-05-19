var socket = io();

var roomName = "";
var selectedBtn;

function joinRoom(thisBtn, name, userId, busId) {

	if (roomName) {
		socket.emit('leaveRoom', name, roomName);
	}

	if (userId && busId) {
		document.querySelector("#chat_window").style.display = "block";
		var btn = document.querySelector("#clearBtn");
		if (btn != null) {
			btn.disabled = false;
			if (selectedBtn != null) {
				selectedBtn.className = "btn btn-secondary";
				selectedBtn = thisBtn;
				selectedBtn.className = "btn btn-dark";
			} else {
				selectedBtn = thisBtn;
				selectedBtn.className = "btn btn-dark";				
			} 
		}

		roomName = "room_" + userId + "_" + busId;
		socket.emit('joinRoom',name, roomName );
	}
}

function sendMessage(name) {

	var msg = document.querySelector("#message");
	socket.emit('sendMessage', msg.value, name, roomName);
	appendMessage(msg.value, name);

}

socket.on('receiveMessage', data => {
	appendMessage(data.message, data.senderName);
});

function appendMessage(msg, name) {

	var div = document.createElement("div");
	div.className = "message-bubble";
	var sender = document.createElement("p");
	sender.className = "text-muted"; 
	sender.innerHTML = name;
	var message = document.createElement("p");
	message.innerHTML = msg;

	div.appendChild(sender);
	div.appendChild(message);

	document.querySelector("#messages").appendChild(div);
	div.scrollIntoView(false);

}

socket.on('updateMessages', data => {
	document.querySelector("#messages").innerHTML = "";
	for (var i = 0; i < data.length; i++) {
	    appendMessage(data[i].msg, data[i].senderName);
	    //Do something
	}
});

function initChat(busId, busName, queueList) {
	var queueArr = queueList.split(",");
	var btnsDiv = document.querySelector("#buttons");
	document.querySelector("#chat_window").style.display = "none";



	if (queueArr.length > 0) {
		fetch("/api/getAllUsers", {
			method: "GET",
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(function(res) {
			return res.json();
		}).then(function(res) {
			console.log(res);

				for (var i = 0; i < queueArr.length; i++) {
					var btn = document.createElement("BUTTON");
					var userId = queueArr[i];
					const userName = res.find(user => user._id == userId).name;

					btn.innerHTML = userName;

					btn.setAttribute('onclick','joinRoom(this,\'' + busName + "\',\'" + userId + "\',\'" + busId + "\')" );
					btn.className = "btn btn-secondary";

					btnsDiv.appendChild(btn);

				}
			});
	}



}

socket.on('clearMessages', function() {
	document.querySelector("#messages").innerHTML = "";

});

function clearChat() {
	socket.emit('clearMessages', roomName);
	document.querySelector("#messages").innerHTML = "";
	fetch("/api/clearChat", {
	  method: "post",
	  headers: {
	    'Content-Type': 'application/json'
	  },

	  //make sure to serialize your JSON body
	  body: JSON.stringify({
	    roomName: roomName
	  })
	})
	.then( (response) => {

	});

}
