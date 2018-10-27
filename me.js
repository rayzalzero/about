/* eslint no-unused-expressions: 0 */
/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';

// Generate random room name if needed
if (!location.hash) {
    location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16);
}
const roomHash = location.hash.substring(1);

// TODO: Replace with your own channel ID
const drone = new ScaleDrone('yvoeLb6KfWR35OKO');
// Room name needs to be prefixed with 'observable-'
const roomName = 'observable-' + roomHash;

let room;
let pc;
let pcRemote;
const configuration = {
    iceServers: [{
        urls: 'stun:stun.l.google.com:19302'
    }]
};

function onSuccess() {
    console.log('Success');
}
function onError(error) {
    console.error(error);
}

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
        const isOfferer = members.length >= 2;

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

    pc.createDataChannel('sendDataChannel');
    pc.binaryType = 'arraybuffer';
    console.log('Created send data channel');
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
    pcRemote = new RTCPeerConnection(configuration);
    pc.ontrack = event => {
        const stream = event.streams[0];
        // let video = document.createElement('video');
        console.log(stream)
    };
}

function localDescCreated(desc) {
    console.log(desc);
    pc.setLocalDescription(
        desc,
        () => sendMessage({'sdp': pc.localDescription}),
        onError
    );
}

function handleSendChannelStatusChange(event) {
    if (sendChannel) {
        var state = sendChannel.readyState;

        if (state === "open") {
            messageInputBox.disabled = false;
            messageInputBox.focus();
            sendButton.disabled = false;
            disconnectButton.disabled = false;
            connectButton.disabled = true;
        } else {
            messageInputBox.disabled = true;
            sendButton.disabled = true;
            connectButton.disabled = false;
            disconnectButton.disabled = true;
        }
    }
}
