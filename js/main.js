
//setting up firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();

//fetching elements from DOM
const keydisplay = document.getElementById('key');
const keyinput = document.getElementById('keyinput');

//positional data of 3D objects
let campos = {
    x: 0,
    y: 0,
    z: 0
};
let ppos = {
    x: 0,
    y: 0,
    z: 0
};

// Handle onmessage events for the receiving channel.
// These are the data messages sent by the sending channel.

function handleReceiveMessage(event) {
    console.log(event.data);
}

// Handle onmessage events for the receiving channel.
// These are the data messages sent by the sending channel.

function rtcreceive(event) {
    try {
        let data = JSON.parse(event.data);
        //console.log(data.rotation.x);

        if (data.position) {
            cube.position.x = data.position.x;
            cube.position.y = data.position.y;
            cube.position.z = data.position.z;
        }
        if (data.rotation) {
            cube.rotation.x = data.rotation.x;
            cube.rotation.y = data.rotation.y;
            cube.rotation.z = data.rotation.z;
        }
    } catch (err) {
        console.log(event.data);
    }
}

// Hook pointer lock state change events for different browsers
document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

document.body.appendChild(renderer.domElement);
renderer.domElement.onclick = function () {
    renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock || renderer.domElement.mozRequestPointerLock;
    renderer.domElement.requestPointerLock();
};S

function onWindowResize() {
    console.log("resize");
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

let camrotspd = 0.6;

function mousemove(e) {
    camera.rotation.y += -e.movementX / 100.0 * camrotspd;
    camera.rotation.x += -e.movementY / 100.0 * camrotspd;
    rtcbroadcast();
}

function lockChangeAlert() {
    if (document.pointerLockElement === renderer.domElement ||
        document.mozPointerLockElement === renderer.domElement) {
        console.log('The pointer lock status is now locked');
        document.addEventListener("mousemove", mousemove, false);
        document.onkeydown
    } else {
        console.log('The pointer lock status is now unlocked');
        document.removeEventListener("mousemove", mousemove, false);
    }
}

let camspd = 0.1;
let change = false;
document.addEventListener('keydown', function (event) {
    change = true;
    switch (event.key) {
        case 'z': {
            camera.vel.z = -camspd;
            break;
        }
        case 's': {
            camera.vel.z = camspd;
            break;
        }
        case 'd': {
            camera.vel.x = camspd;
            break;
        }
        case 'q': {
            camera.vel.x = -camspd;
            break;
        }
        case 'r': {
            camera.vel.y = camspd;
            break;
        }
        case 'f': {
            camera.vel.y = -camspd;
            break;
        }
    }
    rtcbroadcast();
});

document.addEventListener('keyup', function (event) {
    change = false;
    switch (event.key) {
        case 'z': {
            camera.vel.z = 0;
            break;
        }
        case 's': {
            camera.vel.z = 0;
            break;
        }
        case 'd': {
            camera.vel.x = 0;
            break;
        }
        case 'q': {
            camera.vel.x = 0;
            break;
        }
        case 'r': {
            camera.vel.y = 0;
            break;
        }
        case 'f': {
            camera.vel.y = 0;
            break;
        }
    }
    rtcbroadcast();
});

function rtcbroadcast() {
    sendrot = {
        x: camera.rotation.x,
        y: camera.rotation.y,
        z: camera.rotation.z
    };
    console.log("broadcasting...");
    rtcsend({
        position: camera.position,
        rotation: sendrot
    });
}

let broadcastinterval = 400; //in ms
function rtcbroadcastloop() {
    rtcbroadcast();
    //setTimeout(rtcbroadcastloop, broadcastinterval);
}

function init() {
    //set time for phycics updates
    ut = new Date().getTime();
    lut = ut;
    //start the drawing to the canvas
    //rtcbroadcastloop();
    animate();

}