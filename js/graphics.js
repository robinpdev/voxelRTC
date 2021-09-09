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

var textureloader = new THREE.TextureLoader();
var dirtTexture = textureloader.load("./res/dirt.jpg");

var blocks = []; //contains world info

function addblock(x, y, z, type){
    var texture;
    if(type == "dirt"){
        texture = dirtTexture;
    }
    if(blocks[x] == undefined){
        blocks[x] = [];
    }
    if(blocks[x][y] == undefined){
        blocks[x][y] = [];
    }
    blocks[x][y][z] = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshPhongMaterial({
            color:0xffffff,
            map:texture
        })
    );
    blocks[x][y][z].position.set(x, y, z);
    blocks[x][y][z].type = type;
    gfx.scene.add(blocks[x][y][z]);
}

var physobjs = [];
physobjs.push(gfx.camera);

gfx.renderer = new THREE.WebGLRenderer();
gfx.renderer.setSize(window.innerWidth, window.innerHeight);

//timing variables in milliseconds
let lut = 0; //last unix epoch time since last update

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    gfx.scene.add(light);
  }

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
const linematerial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
var points = [];
points.push( new THREE.Vector3( - 10, 0, 0 ) );
points.push( new THREE.Vector3( 0, 10, 0 ) );
var linegeo = new THREE.BufferGeometry().setFromPoints( points );
var line = new THREE.Line( linegeo, linematerial );

gfx.scene.add( line );