var gfx = {};

gfx.scene = new THREE.Scene();
gfx.camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
gfx.camera.rotation.order = 'ZYX';
gfx.camera.position.z = 0;
gfx.camera.vel = {
    x: 0,
    y: 0,
    z: 0
};

var physobjs = [];
physobjs.push(gfx.camera);

gfx.renderer = new THREE.WebGLRenderer();
gfx.renderer.setSize(window.innerWidth, window.innerHeight);

//timing variables in milliseconds
let lut = 0; //last unix epoch time since last update

function animate() {
    physicsupdate();
    requestAnimationFrame(animate);
    gfx.renderer.render(gfx.scene, gfx.camera);
}

function pushObj(object){
    object.vel = {
        x: 0,
        y: 0,
        z: 0
    };
    gfx.scene.add(object);
}

function pushPhysObj(object){
    pushObj(object);
    physobjs.push(object);
}

function physicsupdate() {
    //update timing variables
    let ut = new Date().getTime();
    let dt = ut - lut; //difference in time since last update
    lut = ut;
    let dts = dt / 1000; //dt to seconds

    for (let i = 0; i < physobjs.length; i++) {
        physobjs[i].position.x += physobjs[i].vel.x * dts;
        physobjs[i].position.y += physobjs[i].vel.y * dts;
        physobjs[i].position.z += physobjs[i].vel.z * dts;
    }

}

////////////////////////////////////////////////////////////////////
