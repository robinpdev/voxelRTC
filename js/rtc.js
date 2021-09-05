var rtc = {};

rtc.handleSendChannelStatusChange = function (event) {
    console.log("status change")
    var state = rtc.sendChannel.readyState;

    if (state === "open") {
        document.getElementById("status").innerHTML = "connected";
        rtcbroadcast();
    } else {

    }

}

rtc.handleReceiveChannelStatusChange = function (event) {
    if (receiveChannel) {
        console.log("Receive channel's status has changed to " + rtc.receiveChannel.readyState);
    }

    // Here you would do stuff that needs to be done
    // when the channel's status changes.
}

let rtcOnline = false;
rtc.receiveChannelCallback = function(event) {
    console.log("rccb");
    rtcOnline = true;
    rtc.receiveChannel = event.channel;
    rtc.receiveChannel.onmessage = rtcreceive;
    rtc.receiveChannel.onopen = rtc.handleReceiveChannelStatusChange;
    rtc.receiveChannel.onclose = rtc.handleReceiveChannelStatusChange;
}

rtc.servers = {
    iceServers: [{
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    }, ],
    iceCandidatePoolSize: 10
}

rtc.lc = new RTCPeerConnection(rtc.servers); //lc stands for LOCAL CONNECTION

rtc.sendChannel = rtc.lc.createDataChannel("sendChannel");
rtc.receiveChannel = null;
rtc.lc.ondatachannel = rtc.receiveChannelCallback;

rtc.sendChannel.onopen = rtc.handleSendChannelStatusChange;
rtc.sendChannel.onclose = rtc.handleReceiveChannelStatusChange;

rtc.localStream = null;
rtc.remotStream = null;



/////////////////EXTERNAL FUNCTIONS//////////////////////////////

function rtcsend(input) {
    if (typeof input === 'object' && input !== null) {
        rtc.sendChannel.send(JSON.stringify(input));
    } else {
        rtc.sendChannel.send(input);
    }
}

const makeoffer = async () => {
    // Reference Firestore collections for signaling
    await firestore.collection('calls').doc('testkey').delete();
    const callDoc = firestore.collection('calls').doc('testkey'); //TODO: make room key input
    const offerCandidates = callDoc.collection('offerCandidates');
    const answerCandidates = callDoc.collection('answerCandidates');

    // Get candidates for caller, save to db
    rtc.lc.onicecandidate = (event) => {
        event.candidate && offerCandidates.add(event.candidate.toJSON());
    };

    // Create offer
    const offerDescription = await rtc.lc.createOffer();
    await rtc.lc.setLocalDescription(offerDescription);

    const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
    };

    await callDoc.set({
        offer
    });

    // Listen for remote answer
    callDoc.onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (!rtc.lc.currentRemoteDescription && data ?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            rtc.lc.setRemoteDescription(answerDescription);
        }
    });

    // When answered, add candidate to peer connection
    answerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                console.log(candidate);
                rtc.lc.addIceCandidate(candidate);
                //console.log("candidate added");
            }
        });
    });

};

const joinsession = async () => {
    const callId = 'testkey'; //TODO: make room key input
    const callDoc = firestore.collection('calls').doc(callId);
    const answerCandidates = callDoc.collection('answerCandidates');
    const offerCandidates = callDoc.collection('offerCandidates');

    rtc.lc.onicecandidate = (event) => {
        console.log(event);
        event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    const callData = (await callDoc.get()).data();

    const offerDescription = callData.offer;
    await rtc.lc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await rtc.lc.createAnswer();
    await rtc.lc.setLocalDescription(answerDescription);

    const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
    };

    await callDoc.update({
        answer
    });

    offerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                let data = change.doc.data();
                rtc.lc.addIceCandidate(new RTCIceCandidate(data));
            }
        });
    });
};