//setting up firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();




// Handle onmessage events for the receiving channel.
// These are the data messages sent by the sending channel.
function rtcreceive(event) {
    console.log("receive");
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
        if(data.velocity){
            cube.vel = data.velocity;
        }
    } catch (err) {
        console.log(event.data);
    }
}

// Hook pointer lock state change events for different browsers
document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

document.body.appendChild(gfx.renderer.domElement);
gfx.renderer.domElement.onclick = function () {
    gfx.renderer.domElement.requestPointerLock = gfx.renderer.domElement.requestPointerLock || gfx.renderer.domElement.mozRequestPointerLock;
    gfx.renderer.domElement.requestPointerLock();
};

function onWindowResize() {
    console.log("resize");
    gfx.camera.aspect = window.innerWidth / window.innerHeight;
    gfx.camera.updateProjectionMatrix();
    gfx.renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

let camrotspd = 0.6;

function mousemove(e) {
    gfx.camera.rotation.y += -e.movementX / 100.0 * camrotspd;
    gfx.camera.rotation.x += -e.movementY / 100.0 * camrotspd;
    rtcbroadcast();
}

function lockChangeAlert() {
    if (document.pointerLockElement === gfx.renderer.domElement ||
        document.mozPointerLockElement === gfx.renderer.domElement) {
        console.log('The pointer lock status is now locked');
        document.addEventListener("mousemove", mousemove, false);
    } else {
        console.log('The pointer lock status is now unlocked');
        document.removeEventListener("mousemove", mousemove, false);
    }
}

const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshPhongMaterial({
    color: 0x00ff00
});
const cube = new THREE.Mesh(geometry, material);
pushPhysObj(cube);

let camspd = 10;
let change = false;
document.addEventListener('keydown', function (event) {
    change = true;
    switch (event.key) {
        case 'z': {
            gfx.camera.vel.z = -camspd;
            break;
        }
        case 's': {
            gfx.camera.vel.z = camspd;
            break;
        }
        case 'd': {
            gfx.camera.vel.x = camspd;
            break;
        }
        case 'q': {
            gfx.camera.vel.x = -camspd;
            break;
        }
        case 'r': {
            gfx.camera.vel.y = camspd;
            break;
        }
        case 'f': {
            gfx.camera.vel.y = -camspd;
            break;
        }
    }
    rtcbroadcast();
});

document.addEventListener('keyup', function (event) {
    change = false;
    switch (event.key) {
        case 'z': {
            gfx.camera.vel.z = 0;
            break;
        }
        case 's': {
            gfx.camera.vel.z = 0;
            break;
        }
        case 'd': {
            gfx.camera.vel.x = 0;
            break;
        }
        case 'q': {
            gfx.camera.vel.x = 0;
            break;
        }
        case 'r': {
            gfx.camera.vel.y = 0;
            break;
        }
        case 'f': {
            gfx.camera.vel.y = 0;
            break;
        }
    }
    rtcbroadcast();
});

function rtcbroadcast() {
    sendrot = {
        x: gfx.camera.rotation.x,
        y: gfx.camera.rotation.y,
        z: gfx.camera.rotation.z
    };
    console.log("broadcasting...");
    rtcsend({
        position: gfx.camera.position,
        rotation: sendrot,
        velocity: gfx.camera.vel
    });
}

//EXPERIMENTAL rtc broadcast loop
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

init();
