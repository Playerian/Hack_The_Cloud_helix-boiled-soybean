let c = document.getElementById("canvas");
let ctx = c.getContext("2d");
let fps = 60;
let width = 500;
let height = 500;
c.width = width;
c.height = height;

let objectList = {};
let keyList = {};

$("#UI").hide();
//constructors
class Battler {
  constructor(id, hp, width, height) {
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

  jumpTo(x, y) {
    this.x = x;
    this.y = y;
  }

  changeAction(action) {
    //animation
    if (action !== "stand" && action !== "walk" && action !== "attack") {
      return;
    }
    this.currentFrame = 0;
    this.totalFrame = Math.floor(this[`${action}Animation`].width / this.width);
    this.currentAction = action;
  }

  isCollide(another) {
    //check x
    let rect1, rect2;
    if (this.facingRight === 1){
      rect1 = {x: this.x + this.hitBox[1][0], y: this.y + this.hitBox[1][1], width: this.hitBox[1][2], height: this.hitBox[1][3]}
    }else{
      rect1 = {x: this.x + this.hitBox[0][0], y: this.y + this.hitBox[0][1], width: this.hitBox[0][2], height: this.hitBox[0][3]}
    }
    if (another.facingRight === 1){
      rect2 = {x: another.x + another.hitBox[1][0], y: another.y + another.hitBox[1][1], width: another.hitBox[1][2], height: another.hitBox[1][3]}
    }else{
      rect2 = {x: another.x + another.hitBox[0][0], y: another.y + another.hitBox[0][1], width: another.hitBox[0][2], height: another.hitBox[0][3]}
    }
    
    if (rect1.x < rect2.x + rect2.width &&
     rect1.x + rect1.width > rect2.x &&
     rect1.y < rect2.y + rect2.height &&
     rect1.y + rect1.height > rect2.y){
      console.log("collide");
      return true;
    }else{
      return false;
    }
  }
}

class Projectile extends Battler {
  constructor(id, hp, width, height) {
    //import
    objectList[id] = this;
  }
}

class Main extends Battler {
  constructor(id, hp, width, height) {
    super(id, hp, width, height);
    this.isMainChar = true;
  }
}

class Mobs extends Battler {
  constructor(id, hp, width, height) {
    super(id, hp, width, height);
    this.isMainChar = false;
    this.AI = {
      initial: ["toPlayer"],
      repeat: ["attack", "toPlayer"]
    };
    this.act;
  }
  
  onAttack(){
    //fill whatever
  }

  behavior() {
    //should run every time handlemoveframe function runs
    //check if act exist
    if (this.act) {
      //act
      //toPlayer
      if (this.act === "toPlayer"){
        //check if collide with main
        if (this.isCollide(mainChar)){
          //resolve
          this.resolveAct("toPlayer");
        }else{
          //move towards player
          if (this.x < mainChar.x){
            this.jumpTo(this.x + this.speed, this.y);
            if (this.facingRight === 0){
              this.facingRight = 1;
              this.x -= this.width;//change to hitbox
            }
          }else{
            this.jumpTo(this.x - this.speed, this.y);
            if (this.facingRight === 1){
              this.facingRight = 0;
              this.x += this.width;//change to hitbox
            }
          }
          if (this.y < mainChar.y){
            this.jumpTo(this.x, this.y + this.speed);
          }else{
            this.jumpTo(this.x, this.y - this.speed);
          }
        }
      }
      if (this.act === "attack"){
        if (this.currentAction !== "attack"){
          this.changeAction("attack");
        }
      }
      //resolve act
      
    } else {
      //no act
      //read AI
      //do initial
      if (this.AI.initial.length > 0) {
        this.act = this.AI.initial[0];
        this.AI.initial.shift();
      } else {
        //do repeat
        this.act = this.AI.repeat[0];
        this.AI.repeat.push(this.AI.repeat.shift());
      }
    }
  }
  
  resolveAct(act){
    if (this.act === act){
      this.act = undefined;
    }
  }
}

//handling functions
function render() {
  //empty
  ctx.clearRect(0, 0, width, height);
  //render
  for (let key in objectList) {
    let object = objectList[key];
    let objectX = object.x;
    let objectY = object.y;
    let oWidth = object.width;
    let oHeight = object.height;
    let currentFrame = object.currentFrame;

    if (object.facingRight === 0) {
      //saving
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(
        object[`${object.currentAction}Animation`],
        currentFrame * oWidth,
        0,
        oWidth,
        oHeight,
        width - objectX,
        objectY,
        oWidth,
        oHeight
      );

      ctx.restore();
      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.rect(objectX+object.hitBox[0][0], objectY+object.hitBox[0][1], object.hitBox[0][2], object.hitBox[0][3]);//change to hitbox
      ctx.stroke();
    } else {
      ctx.drawImage(
        object[`${object.currentAction}Animation`],
        currentFrame * oWidth,
        0,
        oWidth,
        oHeight,
        objectX,
        objectY,
        oWidth,
        oHeight
      );    
      
      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.rect(objectX+object.hitBox[1][0], objectY+object.hitBox[1][1], object.hitBox[1][2], object.hitBox[1][3]);//change to hitbox
      ctx.stroke();
    }
  }
}

function handleKeys() {
  let checkMove = false;
  if (keyList["w"] || keyList["ArrowUp"]) {
    mainChar.jumpTo(mainChar.x, mainChar.y - mainChar.speed);
    checkMove = true;
  }
  if (keyList["a"] || keyList["ArrowLeft"]) {
    mainChar.jumpTo(mainChar.x - mainChar.speed, mainChar.y);
    if (mainChar.facingRight === 1) {
      mainChar.facingRight = 0;
      mainChar.x += mainChar.width;//change to hitbox
    }
    checkMove = true;
  }
  if (keyList["s"] || keyList["ArrowDown"]) {
    mainChar.jumpTo(mainChar.x, mainChar.y + mainChar.speed);
    checkMove = true;
  }
  if (keyList["d"] || keyList["ArrowRight"]) {
    mainChar.jumpTo(mainChar.x + mainChar.speed, mainChar.y);
    if (mainChar.facingRight === 0) {
      mainChar.facingRight = 1;
      mainChar.x -= mainChar.width;//change to hitbox
    }
    checkMove = true;
  }
  if (keyList["j"]) {
    if (mainChar.currentAction !== "attack") {
      mainChar.changeAction("attack");
    }
  }
  if (mainChar.currentAction !== "attack") {
    if (checkMove) {
      if (mainChar.currentAction !== "walk") {
        mainChar.changeAction("walk");
      }
    } else {
      mainChar.changeAction("stand");
    }
  }
}

function handleMoveFrames() {
  for (let key in objectList) {
    let object = objectList[key];
    object.currentFrame += 1;
    if (object.currentFrame >= object.totalFrame) {
      object.currentFrame = 0;
      //check if attacking
      if (object.currentAction === "attack") {
        object.changeAction("walk");
        //check if a mob
        if (object.act === "attack"){
          object.resolveAct("attack");
        }
      }
    }
    if (object.behavior) {
      //object.behavior();
    }
  }
}

//keyboard events
$(document).keydown(function(e) {
  keyList[e.key] = true;
});

$(document).keyup(function(e) {
  keyList[e.key] = false;
});

let sprite = [
  // {
  //   stand: "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FcharStand.png?v=1594500675779",
  //   walk: "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FcharAtk1Sprite.png?v=1594495768907",
  //   attack : "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FcharAtk1Sprite.png?v=1594495768907",
  // },

  {
    //guy
    stand:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FguyWalk.png?v=1594501701844",
    walk:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FguyWalk.png?v=1594501701844",
    attack:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FguyAttack.png?v=1594502053544",
    hitBox: [[-110,16,85,109],[25,16,85,109]] //[[offset x, offset y, width, height],[]]
    //[[a, b, c, d], [e, f, g, h]]
    //a = -g - e
  },

  {
    //turrent
    stand:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FturrentWalk.png?v=1594499006955",
    walk:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FturrentWalk.png?v=1594499006955",
    attack:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FturrentShoot.png?v=1594499885384",
    hitBox: [[-99, 25,81,97],[18, 25, 81, 97]]
  }
];

sprite.forEach((v, i) => {
  for (let keys in v) {
    if (keys === "stand" || keys === "walk" || keys === "attack") {
      let href = v[keys];
      let img = new Image();
      img.src = href;
      sprite[i][keys] = img;
    }
  }
});

let mainChar = new Main(0, 1, 128, 128);
mainChar.jumpTo(50, 50);

let mob = new Mobs(1, 10, 128, 128);
mob.jumpTo(120, 120);
mob.speed = 2

//render loop
let interval = setInterval(() => {
  handleKeys();
  handleMoveFrames();
  mainChar.isCollide(mob);
  render();
}, 1000 / fps);

function pause(){
  clearInterval(interval);
  $("#UI").show();
}

function play(){
  $("#UI").hide();
  interval = setInterval(() => {
    handleKeys();
    handleMoveFrames();
    mainChar.isCollide(mob);
    render();
  }, 1000 / fps);
}

$("#resume").click(function(){
  play();
});
                   
$(document).keyup(function(e) {
  if (e.which === 27) {
    pause();
  }
});