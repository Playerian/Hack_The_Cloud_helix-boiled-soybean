let c = document.getElementById("canvas");
let ctx = c.getContext("2d");
let fps = 60;
let width = 500;
let height = 500;
c.width = width;
c.height = height;

let objectList = {};
let keyList = {};

//constructors
class Battler{
  constructor(id, hp, width, height){
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.speed = 5;
    this.hp = hp;
    this.facingRight = 1;
    this.currentFrame = 0;
    this.totalFrame = sprite[id].totalFrame;
    //stand, walk, attack
    this.currentAction = "stand";
    this.standAnimation = [];
    this.walkAnimation = [];
    this.attackAnimation = [];
    //import
    objectList[id] = this;
  }
  
  jumpTo(x, y){
    this.x = x;
    this.y = y;
  }
}

class Main extends Battler{
  constructor(id, hp, width, height){
    super(id, hp, width, height);
    this.isMainChar = true;
  }
}

class Mobs extends Battler{
  constructor(id, hp, width, height){
    super(id, hp, width, height);
    this.isMainChar = false;
  }
}

//handling functions
function render(){
  //empty
  ctx.clearRect(0, 0, width, height);
  //saving
  ctx.save();
  //render
  for (let key in objectList){
    let object = objectList[key];
    let objectX = object.x;
    let objectY = object.y;
    let oWidth = object.width;
    let oHeight = object.height;
    let currentFrame = object.currentFrame;
    ctx.drawImage(sprite[0].img, currentFrame * oWidth, 0, oWidth, oHeight, objectX, objectY, oWidth, oHeight);
  }
}

function handleKeys(){
  if (keyList["w"] || keyList["ArrowUp"]){
    mainChar.jumpTo(mainChar.x, mainChar.y - mainChar.speed);
  }
  if (keyList["a"] || keyList["ArrowLeft"]){
    mainChar.jumpTo(mainChar.x - mainChar.speed, mainChar.y);
  }
  if (keyList["s"] || keyList["ArrowDown"]){
    mainChar.jumpTo(mainChar.x, mainChar.y + mainChar.speed);
  }
  if (keyList["d"] || keyList["ArrowRight"]){
    mainChar.jumpTo(mainChar.x + mainChar.speed, mainChar.y);
  }
}

function handleMoveFrames(){
  for (let key in objectList){
    let object = objectList[key];
    object.currentFrame += 1;
    if (object.currentFrame >= object.totalFrame){
      object.currentFrame  = 0;
    }
  }
}

//keyboard events
$(document).keydown(function(e){
  keyList[e.key] = true;
});

$(document).keyup(function(e){
  keyList[e.key] = false;
});







let sprite = [
  {img : "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FcharAtk1Sprite.png?v=1594495768907",
    totalFrame : 7 }
]

sprite.forEach((v, i) => {
  let img = new Image();
  img.src = v.img;
  sprite[i].img = img;
});


let mainChar = new Main(0, 1, 128, 128);
mainChar.jumpTo(50, 50);

//render loop
let interval = setInterval(() => {
  handleKeys();
  handleMoveFrames();
  //handlecollision?
  render();
}, 1000 / fps);
