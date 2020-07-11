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
    this.hitBox = sprite[id].hitBox;
    this.totalFrame = sprite[id].totalFrame || 1;
    //stand, walk, attack
    this.currentAction = "stand";
    this.standAnimation = sprite[id].stand;
    this.walkAnimation = sprite[id].walk;
    this.attackAnimation = sprite[id].attack;
    //import
    objectList[id] = this;
  }
    
  jumpTo(x, y){
    this.x = x;
    this.y = y;
  }
  
  changeAction(action){ //animation
    if (action !== "stand" && action !== "walk" && action !== "attack"){
      return;
    }
    this.currentFrame = 0;
    this.totalFrame = Math.floor(this[`${action}Animation`].width / this.width);
    this.currentAction = action;
  }
  
  isCollide(another){
    //check x
    //console.log(this.x)
    if(this.facingRight === 1){
      // if(this.x <= another.x+128 && this.x+128 >= another.x){
      //   console.log("collideX")
      //   //check y
      // }
    }else{//facing left
      if(this.x <= another.x+128 && this.x+128 >= another.x){
        console.log("collideX")
      }

    }
  }
  
}
  
class Projectile extends Battler{
  constructor(id, hp, width, height){
   
    //import
    objectList[id] = this;
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
  
  behavior(){ //should run every time handlemoveframe function runs
    
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
    
    if (object.facingRight === 0){
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(object[`${object.currentAction}Animation`], currentFrame * oWidth, 0, oWidth, oHeight, width - objectX, objectY, oWidth, oHeight);
      
      ctx.restore();
      ctx.beginPath()
      ctx.strokeStyle = "red"
      ctx.rect(objectX-128,objectY,128,128)
      ctx.stroke()
    
    }else{
      ctx.drawImage(object[`${object.currentAction}Animation`], currentFrame * oWidth, 0, oWidth, oHeight, objectX, objectY, oWidth, oHeight); 
    
      //ctx.restore();
      ctx.beginPath()
      ctx.strokeStyle = "red"
      ctx.rect(objectX,objectY,128,128)
      ctx.stroke()
    }
     
    //ctx.restore();

  }
}

function handleKeys(){
  let checkMove = false;
  if (keyList["w"] || keyList["ArrowUp"]){
    mainChar.jumpTo(mainChar.x, mainChar.y - mainChar.speed);
    checkMove = true;
  }
  if (keyList["a"] || keyList["ArrowLeft"]){
    mainChar.jumpTo(mainChar.x - mainChar.speed, mainChar.y);
    if (mainChar.facingRight === 1){
      mainChar.facingRight = 0;
      mainChar.x += mainChar.width;
    }
    checkMove = true;
  }
  if (keyList["s"] || keyList["ArrowDown"]){
    mainChar.jumpTo(mainChar.x, mainChar.y + mainChar.speed);
    checkMove = true;
  }
  if (keyList["d"] || keyList["ArrowRight"]){
    mainChar.jumpTo(mainChar.x + mainChar.speed, mainChar.y);
    if (mainChar.facingRight === 0){
      mainChar.facingRight = 1;
      mainChar.x -= mainChar.width;
    }
    checkMove = true;
  }
  if (keyList["j"]){
    if (mainChar.currentAction !== "attack"){
      mainChar.changeAction("attack");
    }
  }
  if (mainChar.currentAction !== "attack"){
    if (checkMove){
      if (mainChar.currentAction !== "walk"){
        mainChar.changeAction("walk");
      }
    }else{
      mainChar.changeAction("stand");
    }
  }
}

function handleMoveFrames(){
  for (let key in objectList){
    let object = objectList[key];
    object.currentFrame += 1;
    if (object.currentFrame >= object.totalFrame){
      object.currentFrame = 0;
      //check if attacking
      if (object.currentAction === "attack"){
        object.changeAction("walk");
      }
    }
    if (object.behavior){
      object.behavior();
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
  // {
  //   stand: "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FcharStand.png?v=1594500675779",
  //   walk: "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FcharAtk1Sprite.png?v=1594495768907",
  //   attack : "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FcharAtk1Sprite.png?v=1594495768907",
  // },
  
   {//guy
    stand: "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FguyWalk.png?v=1594501701844",
    walk: "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FguyWalk.png?v=1594501701844",
    attack: "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FguyAttack.png?v=1594502053544",
    hitBox: [],//[offset x, offset y, width, height]
  },
  
  {//turrent
    stand: "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FturrentWalk.png?v=1594499006955",
    walk: "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FturrentWalk.png?v=1594499006955",
    attack : "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FturrentShoot.png?v=1594499885384",
  }, 
]

sprite.forEach((v, i) => {
  for (let keys in v){
    if (keys === "stand" || keys === "walk" || keys === "attack"){
      let href = v[keys];
      let img = new Image();
      img.src = href;
      sprite[i][keys] = img;
    }
  }
});


let mainChar = new Main(0, 1, 128, 128);
mainChar.jumpTo(50, 50);

let mob = new Mobs(1,10,128,128)
mob.jumpTo(120,120)

//render loop
let interval = setInterval(() => {
  handleKeys();
  handleMoveFrames();
  mainChar.isCollide(mob)
  render();
}, 1000 / fps);
