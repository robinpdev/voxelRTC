//setting up firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();




for (let x = -10; x <= 10; x++) {
    for (let z = -10; z <= 10; z++) {
        addblock(x, -1, z, "dirt");
    }
}
addblock(2,0,2, "dirt");
addblock(3,0,2, "dirt");
addblock(2,0,3, "dirt");
addblock(2,1,2, "dirt");


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
        if (data.velocity) {
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

let lookvector = {x: 0, y: 0, z: 0};
function mousemove(e) {
    gfx.camera.rotation.y += -e.movementX / 100.0 * camrotspd;
    gfx.camera.rotation.x += -e.movementY / 100.0 * camrotspd;
    const positions = line.geometry.attributes.position.array;

    positions[0] = gfx.camera.position.x + 0.01;
    positions[1] = gfx.camera.position.y;
    positions[2] = gfx.camera.position.z;

    lookvector.x = - Math.cos(gfx.camera.rotation.x) * Math.sin(gfx.camera.rotation.y) * 1;
    lookvector.y = Math.sin(gfx.camera.rotation.x) * 1;
    lookvector.z = - Math.cos(gfx.camera.rotation.x) * Math.cos(gfx.camera.rotation.y) * 1;

    positions[3] = gfx.camera.position.x + lookvector.x * 10;
    positions[4] = gfx.camera.position.y + lookvector.y * 10;
    positions[5] = gfx.camera.position.z + lookvector.z * 10;

    line.geometry.attributes.position.needsUpdate = true;
    move();
    getlookblock();
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

//raycast function to get the block the player is looking at
function getlookblock(){
    let searchpos = {};
    searchpos.x = gfx.camera.position.x;
    searchpos.y = gfx.camera.position.y;
    searchpos.z = gfx.camera.position.z;
    console.log(Math.floor(searchpos.x));
    console.log(Math.floor(searchpos.y));
    console.log(Math.floor(searchpos.z));

    
    for(let i = 0; i < 30; i++){
        searchpos.x += lookvector.x * i * 1; //using 0.2 increment for testing, this should be tested and heightened later
        searchpos.y += lookvector.y * i * 1;
        searchpos.z += lookvector.z * i * 1;

        console.log(Math.floor(searchpos.x));
        console.log(Math.floor(searchpos.y));
        console.log(Math.floor(searchpos.z));


        if(blocks[Math.floor(searchpos.x + 0.5)] != undefined){
            if(blocks[Math.floor(searchpos.x + 0.5)][Math.floor(searchpos.y + 0.5)] != undefined){
                if(blocks[Math.floor(searchpos.x + 0.5)][Math.floor(searchpos.y + 0.5)][Math.floor(searchpos.z + 0.5)] != undefined){
                    console.log("block found");
                    addblock(Math.floor(searchpos.x + 0.5), Math.floor(searchpos.y + 0.5), Math.floor(searchpos.z + 0.5), "select");
                    break;
                }
            }
        }
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
let moveangle = 0;
let keyspressed = [];
document.addEventListener('keydown', function (event) {
    change = true;
    keyspressed[event.key] = true;
    if(event.repeat){
        console.log("repeat");
        return;
    }
    switch (event.key) {
        case 'r': {
            gfx.camera.vel.y = camspd;
            break;
        }
        case 'f': {
            gfx.camera.vel.y = -camspd;
            break;
        }
    }
    keymove();
    

    rtcbroadcast();
});

function keymove(){
    moveangle = 0;
    /*if(keyspressed['z'] && (keyspressed['q'] == keyspressed['d']) && !keyspressed['s']){
        moveangle = 0;
        console.log('vooruit')
    }else if(keyspressed['z'] && keyspressed['d'] && !keyspressed['s'] && !keyspressed['q']){
        moveangle = -3.14 / 4;
        console.log('vrechts');
    }else if(keyspressed['z'] && keyspressed['q'] && !keyspressed['s'] && !keyspressed['d']){
        moveangle = 3.14 / 4;
        console.log('vlinks');
    }
    else if(keyspressed['d'] && !keyspressed['q']){
        moveangle = -3.14 / 2;
        console.log('1')
    }else if(keyspressed['q'] && !keyspressed['d']){
        moveangle = 3.14 / 2;
        console.log('1')

    }else if(keyspressed['s']){
        moveangle = 3.14;
        console.log('1')
*/
    if(keyspressed['z']){

    }
    if(keyspressed['d']){
        if(keyspressed['z'] && !keyspressed['s']){
            moveangle -= 3.14 / 4;
        }else if(keyspressed['s'] && !keyspressed['z']){
            moveangle += 3.14 / 4;
        }else{
            moveangle -= 3.14 / 2;
        }
    }
    if(keyspressed['q']){
        if(keyspressed['z'] && !keyspressed['s']){
            moveangle += 3.14 / 4;
        }else if(keyspressed['s'] && !keyspressed['z']){
            moveangle -= 3.14 / 4;
        }else{
            moveangle += 3.14 / 2;
        }
    }
    if(keyspressed['s']){
        moveangle += 3.14;
    }
    if(!keyspressed['z'] && !keyspressed['q'] && !keyspressed['s'] && !keyspressed['d']){
        gfx.camera.vel.x = 0;
        gfx.camera.vel.z = 0;
        console.log('off');
        return;
    }
    move();
}

function move() {
    if(keyspressed['z'] || keyspressed['q'] || keyspressed['s'] || keyspressed['d']){
        gfx.camera.vel.z = -camspd * Math.cos(gfx.camera.rotation.y + moveangle);
        gfx.camera.vel.x = -camspd * Math.sin(gfx.camera.rotation.y + moveangle);
    }
}

document.addEventListener('keyup', function (event) {
    change = false;
    keyspressed[event.key] = false;
    if(event.repeat){
        console.log("repeat");
        return;
    }
    switch (event.key) {
        
        case 'r': {
            gfx.camera.vel.y = 0;
            break;
        }
        case 'f': {
            gfx.camera.vel.y = 0;
            break;
        }
    }
    keymove();
    rtcbroadcast();
});

function rtcbroadcast() {
    if (rtcOnline) {

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
}

//EXPERIMENTAL rtc broadcast loop
let broadcastinterval = 400; //in ms
function rtcbroadcastloop() {
    rtcbroadcast();
    setTimeout(rtcbroadcastloop, broadcastinterval);
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
