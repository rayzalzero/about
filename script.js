// Generate random room name if needed
if (!location.hash) {
    // location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16);
    location.hash = 'MTK';
}
const roomHash = location.hash.substring(1);

// TODO: Replace with your own channel ID
const drone = new ScaleDrone('yvoeLb6KfWR35OKO');
// Room name needs to be prefixed with 'observable-'
const roomName = 'observable-' + roomHash;
const configuration = {
    iceServers: [{
        urls: 'stun:stun.l.google.com:19302'
    }]
};
let room;
let pc;
let stream;

function onSuccess() {};
function onError(error) {
    console.error(error);
};

drone.on('open', error => {
    if (error) {
        return console.error(error);
    }
    room = drone.subscribe(roomName);
    room.on('open', error => {
        if (error) {
            onError(error);
        }
    });
    // We're connected to the room and received an array of 'members'
    // connected to the room (including us). Signaling server is ready.
    room.on('members', members => {
        console.log('MEMBERS', members);
        // If we are the second user to connect to the room we will be creating the offer
        const isOfferer = members.length === 3;
        startWebRTC(isOfferer);
    });
});

// Send signaling data via Scaledrone
function sendMessage(message) {
    drone.publish({
        room: roomName,
        message
    });
}

function startWebRTC(isOfferer) {
    pc = new RTCPeerConnection(configuration);

    // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
    // message to the other peer through the signaling server
    pc.onicecandidate = event => {
        if (event.candidate) {
            sendMessage({'candidate': event.candidate});
        }
    };

    // If user is offerer let the 'negotiationneeded' event create the offer
    if (isOfferer) {
        pc.onnegotiationneeded = () => {
            pc.createOffer().then(localDescCreated).catch(onError);
        }
    }

    // When a remote stream arrives display it in the #remoteVideo element
    pc.ontrack = event => {
        console.log(event);
        remoteVideo.srcObject = event.stream;
    };

    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
    }).then(s => {
        stream = s
        // Display your local video in #localVideo element
        localVideo.srcObject = stream;
        // Add your stream to be sent to the conneting peer
        pc.addStream(stream);
    }, onError);

    // Listen to signaling data from Scaledrone
    room.on('data', (message, client) => {
        // console.log(message, client);
        // Message was sent by us
        if (client.id === drone.clientId) {
            return;
        }

        if (message.sdp) {
            // This is called after receiving an offer or answer from another peer
            pc.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
                // When receiving an offer lets answer it
                if (pc.remoteDescription.type === 'offer') {
                    pc.createAnswer().then(localDescCreated).catch(onError);
                }
            }, onError);
        } else if (message.candidate) {
            // Add the new ICE candidate to our connections remote description
            pc.addIceCandidate(
                new RTCIceCandidate(message.candidate), onSuccess, onError
            );
        }
    });
}

function localDescCreated(desc) {
    pc.setLocalDescription(
        desc,
        () => sendMessage({'sdp': pc.localDescription}),
        onError
    );
}

btnGetAudioTracks.addEventListener("click", function(){
    console.log("getAudioTracks");
    console.log(stream.getAudioTracks());
});

btnGetTrackById.addEventListener("click", function(){
    console.log("getTrackById");
    console.log(stream.getTrackById(stream.getAudioTracks()[0].id));
});

btnGetTracks.addEventListener("click", function(){
    console.log("getTracks()");
    console.log(stream.getTracks());
});

btnGetVideoTracks.addEventListener("click", function(){
    console.log("getVideoTracks()");
    console.log(stream.getVideoTracks());
});

btnRemoveAudioTrack.addEventListener("click", function(){
    console.log("removeAudioTrack()");
    stream.removeTrack(stream.getAudioTracks()[0]);
});

btnRemoveVideoTrack.addEventListener("click", function(){
    console.log("removeVideoTrack()");
    stream.removeTrack(stream.getVideoTracks()[0]);
});
