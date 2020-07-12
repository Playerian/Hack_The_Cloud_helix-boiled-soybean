let c = document.getElementById("canvas");
let ctx = c.getContext("2d");
let fps = 60;
let width = 1024;
let height = 512;
c.width = width;
c.height = height;

let objectList = [];
let keyList = {};

// UI for pause
$("#pause").hide();
$("#restart").hide();
$("#resume").hide();
$("#quit").hide();

$("#gameOver").hide();

//constructors
class Battler {
  constructor(id, hp, width, height) {
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.damage = 10;
    this.speed = 5;
    this.hp = hp;
    this.maxhp = hp;
    this.facingRight = 1;
    this.currentFrame = 0;
    this.hitBox = sprite[id].hitBox;
    this.totalFrame = sprite[id].totalFrame || 1;
    //stand, walk, attack
    this.currentAction = "stand";
    for (let keys in sprite[id]){
      if (sprite[id][keys].nodeName === "IMG"){
        this[`${keys}Animation`] = sprite[id][keys];
      }
    }
    //import
    this.listIndex = objectList.push(this) - 1;
  }

  jumpTo(x, y) {
    this.x = x;
    this.y = y;
  }
  
  flipAround(){
    if (this.facingRight === 0) {
      this.facingRight = 1;
      this.x -= this.width;
    }else{
      this.facingRight = 0;
      this.x += this.width;//change to hitbox
    }
  }

  changeAction(action) {
    //animation
    if (typeof action !== "string") {
      return;
    }
    this.currentFrame = 0;
    if (this[`${action}Animation`]){
      this.totalFrame = Math.floor(this[`${action}Animation`].width / this.width);
    }else{
      this.totalFrame = 0;
    }
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
      //console.log("collide");
      return true;
    }else{
      return false;
    }
  }
  
  gainHp(value){
    this.hp += value;
    if (this.hp <= 0){
      if (this === mainChar){
        $("#gameOver").show();
        $("#restart").show();
        $("#quit").show();
      }
      this.destroySelf();
    }
  }
  
  destroySelf(){
    objectList[this.listIndex] = undefined;
    if (this.stage){
      this.stage.removeEnemy(this);
    }
  }
}

class Projectile extends Battler {
  constructor(id, hp, width, height, speed, dir, damage, isFriendly) {
    super(id,hp,width,height)
    this.speed = speed;
    this.facingRight = dir;
    this.damage = damage;
    this.isFriendly = isFriendly
    this.isProjectile = true;
  }
  
  behavior(){
    if (this.facingRight){
      this.jumpTo(this.x + this.speed, this.y);
    }else{
      this.jumpTo(this.x - this.speed, this.y);
    }
    this.gainHp(-1);
  }
}

class Main extends Battler {
  constructor(id, hp, width, height) {
    super(id, hp, width, height);
    this.isMainChar = true;
  }
}

class Mobs extends Battler {
  constructor(id, hp, width, height, stage) {
    super(id, hp, width, height);
    this.isMainChar = false;
    this.AI = {
      initial: ["toPlayerY", "facePlayer"],
      repeat: ["rangedAttack10", "wait1000", "toPlayer", "wait250", "toPlayerY", "facePlayer"]
    };
    this.count = 0;
    this.act;
    if (stage){
      this.stage = stage;
      stage.newEnemy(this);
    }
  }
  
  onAttack(){
    //fill whatever
    //damage player if colliding
    if (this.isCollide(mainChar)){
      mainChar.gainHp(-this.damage);
    }
  }
  
  onRangeAttack(summoner){
    //summon bullet
    let bulletYOffset = 0;
    if(summoner.id === 4){
      bulletYOffset = -4
    }
    let bullet = new Projectile(2,60,128,128, 10, summoner.facingRight, 1, false)
    bullet.jumpTo(summoner.x + summoner.hitBox[summoner.facingRight][0], summoner.y+bulletYOffset);
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
        return;
      }
      if (this.act === "toPlayerX"){
        if (this.x - mainChar.x <= this.hitBox[this.facingRight][2]){
          this.resolveAct("toPlayerX");
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
        }
        return;
      }
      if (this.act === "toPlayerY"){
        if (this.y - mainChar.y <= this.hitBox[0][3]){
          this.resolveAct("toPlayerY");
        }else{
          if (this.y < mainChar.y){
            this.jumpTo(this.x, this.y + this.speed);
          }else{
            this.jumpTo(this.x, this.y - this.speed);
          }
        }
        return;
      }
      if (this.act === "facePlayer"){
        if (this.x < mainChar.x && !this.facingRight){
          this.flipAround();
        }else if (this.x > mainChar.x && this.facingRight){
          this.flipAround();
        }
        this.resolveAct("facePlayer");
        return;
      }
      if (this.act === "attack"){
        if (this.currentAction !== "attack"){
          this.changeAction("attack");
          this.onAttack();
        }
        return;
      }
      if(this.act.includes("rangedAttack")){
        if (this.currentAction !== "attack2"){
          this.changeAction("attack2");
        }
        let repeatTimes = parseInt(this.act.substring(12));
        if (isNaN(repeatTimes)){
          repeatTimes = 1;
        }
        this.onRangeAttack(this);
        this.count ++;
        if (this.count >= repeatTimes){
          this.count = 0;
          this.resolveAct(this.act);
        }
        return;
      }
          
      if (this.act.includes("wait")){
        this.changeAction("stand");
        if (this.selfTimer !== undefined){
          this.selfTimer += 1000/fps;
        }else{
          this.selfTimer = 0;
        }
        if (this.selfTimer >= parseInt(this.act.substring(4)) ){
          this.resolveAct(this.act);
          this.selfTimer = undefined;
        }
      }
      
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

class Boss extends Mobs{
  constructor(id, hp, width, height, stage) {
    super(id, hp, width, height);
    this.isMainChar = false;
  }
}

class DialogueController{
  constructor(){
    this.queue = [];
    this.showingDialogue = false;
    this.onDialogueFinish;
    //container
    let $container = $("<div>").addClass("dialogueContainer");
    this.setContainer($container);
    $("#canvasContainer").append($container);
    $container.hide();
    this.container = $container;
    //img
    let $img = $("<img>").addClass("dialogueImg");
    $container.append($img);
    this.img = $img;
    //text
    let $text = $("<div>").addClass("dialogueText");
    $container.append($text);
    this.text = $text;
  }
  
  attachHandler(){
    $(document).one("keypress", () => {
      this.resolveDialogue();
    });
  }
  
  setContainer(container, isTop){
    if (isTop){
      container.css("bottom", `${height + 7}px`);
    }else{
      container.css("bottom", `${height * 0.2}px`);
    }
    container.css("height", `${height * 0.2}px`);
  }
  
  renderDialogue(){
    pause();
    this.showingDialogue = true;
    this.container.show();
    let dialo = this.queue[0];
    this.img.attr("src", dialo.img);
    this.text.text(dialo.text);
    this.setContainer(this.container, dialo.isTop)
    this.attachHandler();
  }
  
  resolveDialogue(){
    this.queue.shift();
    if (this.queue.length > 0){
      this.renderDialogue();
    }else{
      play();
      this.showingDialogue = false;
      this.container.hide();
      if (this.onDialogueFinish){
        this.onDialogueFinish();
        this.onDialogueFinish = undefined;
      }
    }
  }
}

class Dialogue{
  constructor(text, img, isTop){
    this.text = text;
    this.img = img;
    this.isTop = isTop;
  }
}

class Stage{
  constructor(onStart, onEnd){
    this.enemyList = [];
    this.onEnd = onEnd;
    this.onStart = onStart;
  }
  
  startStage(){
    this.onStart(this);
  }
  
  newEnemy(enemy){
    this.enemyList.push(enemy);
  }
  
  removeEnemy(enemy){
    for (let i = 0; i < this.enemyList.length; i ++){
      if (enemy === this.enemyList[i]){
        this.enemyList.splice(i, 1);
        break;
      }
    }
    //check if empty
    if (this.enemyList.length === 0){
      if (this.onEnd){
        this.onEnd(this);
      }
    }
  }
}

//handling functions
function render() {
  //empty
  ctx.clearRect(0, 0, width, height);
  //render objects
  for (let key in objectList) {
    if (!objectList[key]){
      continue;
    }
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

      let facing = object.facingRight
      
      ctx.restore();
      ctx.beginPath();
      ctx.strokeStyle = "red";
      //hitbox rect
      ctx.rect(objectX+object.hitBox[0][0], objectY+object.hitBox[0][1], object.hitBox[0][2], object.hitBox[0][3]);
      ctx.stroke();
      if (!object.isProjectile){
        //hpbar border
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.rect(objectX+object.hitBox[0][0], objectY+object.hitBox[0][1] - 20, object.hitBox[0][2], 10);
        ctx.stroke();
        //hpbar inner
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(objectX+object.hitBox[0][0], objectY+object.hitBox[0][1] - 20, object.hitBox[0][2] * (object.hp / object.maxhp), 10);
      }
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
      //hitbox rect
      ctx.rect(objectX+object.hitBox[1][0], objectY+object.hitBox[1][1], object.hitBox[1][2], object.hitBox[1][3]);
      ctx.stroke();
      if (!object.isProjectile){
        //hpbar border
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.rect(objectX+object.hitBox[1][0], objectY+object.hitBox[1][1] - 20, object.hitBox[1][2], 10);
        ctx.stroke();
        //hpbar inner
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(objectX+object.hitBox[1][0], objectY+object.hitBox[1][1] - 20, object.hitBox[1][2] * (object.hp / object.maxhp), 10);
      }
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
      let bullet = new Projectile(2,60,128,128, 10, mainChar.facingRight, mainChar.damage, true)
      bullet.jumpTo(mainChar.x + mainChar.hitBox[mainChar.facingRight][0], mainChar.y+10)
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
    if (!objectList[key]){
      continue;
    }
    let object = objectList[key];
    object.currentFrame += 1;
    if (object.currentFrame >= object.totalFrame) {
      object.currentFrame = 0;
      //check if attacking
      if (object.currentAction.includes("attack")) {
        object.changeAction("walk");
        //check if a mob
        if (object.act){
          if (object.act.includes("attack")){
            object.resolveAct(object.act);
          }
        }
      }
    }
    if (object.behavior) {
      object.behavior();
    }
    
    
    if(object.id === 2){
      if(object.isFriendly){
        objectList.forEach((v,i)=>{
          if(v !== undefined && object.isCollide(v)){
            if(v.id === 1 || v.id === 3 || v.id === 4){ //check id to see if is enemy
              v.gainHp(-object.damage);
              object.gainHp(-233); //kills bullet
            }
          }
        })
      }else{
        if(object.isCollide(mainChar)){
          mainChar.gainHp(-object.damage)
          object.gainHp(-233); //kills bullet
        }
      }
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
    attack2:
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
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FturrentShoot2.png?v=1594526056546",
    attack2:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FturrentShoot2.png?v=1594526056546",
    hitBox: [[-99, 25,81,97],[18, 25, 81, 97]]
  },
  {
    //bullet
    stand:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FguyBullet.png?v=1594510138936",
    walk:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FguyBullet.png?v=1594510138936",
    attack:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FguyBullet.png?v=1594510138936",
    attack2:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FguyBullet.png?v=1594510138936",
    hitBox: [[-70, 59,10,5],[60, 59, 10, 5]]
  },
  {
    //redprincess
    stand:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FredWalk.png?v=1594587149260",
    walk:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FredWalk.png?v=1594587149260",
    attack:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FredFire.png?v=1594585825786",
    attack2:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2Fredshoot.png?v=1594584911893",
    hitBox: [[-119, 2,102,124],[17, 2, 102, 124]] 
  },
  {
  //trashcan
    stand:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2Ftrashcanwalk.png?v=1594589217594",
    walk:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2Ftrashcanwalk.png?v=1594589217594",
    attack:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2Ftrashcanshoot.png?v=1594589348929",
    attack2:
      "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2Ftrashcanshoot.png?v=1594589348929",
    hitBox: [[-110,4,84,76],[25,4,84,76]] 
  }
];

sprite.forEach((v, i) => {
  for (let keys in v) {
    if (typeof v[keys] === "string") {
      let href = v[keys];
      let img = new Image();
      img.src = href;
      sprite[i][keys] = img;
    }
  }
});

//render loop
let interval = setInterval(loop, 1000 / fps);

//initialize dialogue
let dialogueController = new DialogueController();

//staging
let stage1 = new Stage((stage) => {
  //stage start
  // let mob = new Mobs(1, 100, 128, 128, stage);
  // mob.jumpTo(800, 250);
  // mob.speed = 2;
  // //melee bot
  // mob.AI = {
  //   initial: [],
  //   repeat: ["toPlayer", "wait250", "attack", "wait1000"]
  // }
  render();
  dialogueController.queue.push(new Dialogue("The prince in kingdom Green has been captured. Princess Green is on her mission to save the captured princess! (Press any button to conintue)", "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2Fpic.jpg?v=1594589935586", true));
  dialogueController.queue.push(new Dialogue("Show me where the prince is! (Press any button to conintue)", "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2F2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e_guyWalk.png?v=1594584060708", false));
  dialogueController.queue.push(new Dialogue("Beep! Unauthorized personnel! Keep OUT! (Press any button to conintue)", "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2Fturrentpic.png?v=1594586865187", true));
  dialogueController.renderDialogue();
}, (stage) => {
  //stage end
  dialogueController.onDialogueFinish = () => {
    currentStage = stage2;
    stage2.startStage();
  };
  dialogueController.queue.push(new Dialogue("BOOM! (Press any button to conintue)", "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2Fturrentpic.png?v=1594586865187", true));
  dialogueController.queue.push(new Dialogue("I am going forward! (Press any button to conintue)", "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2F2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e_guyWalk.png?v=1594584060708", false));
  dialogueController.renderDialogue();
});

let stage2 = new Stage((stage) => {
  //stage start
  cleanseProjectile();
  mainChar.jumpTo(50, 250);
  let mob = new Mobs(4, 100, 128, 128, stage);
  mob.jumpTo(800, 250);
  mob.speed = 2;
  //range bot
  mob.AI = {
    initial: [],
    repeat: ["toPlayerY", "facePlayer", "rangeAttack20"]
  }
  render();
  dialogueController.queue.push(new Dialogue("Another mob? I am not afraid!", "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2F2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e_guyWalk.png?v=1594584060708", false));
  dialogueController.renderDialogue();
}, (stage) => {
  //stage end
});


let currentStage = stage1;
stage1.startStage();

let mainChar = new Main(0, 100, 128, 128);
mainChar.jumpTo(50, 250);

function cleanseProjectile(){
  for (let key in objectList) {
    if (!objectList[key]){
      continue;
    }
    let object = objectList[key];
    if (object.isProjectile){
      object.destroySelf();
    }
  }
}

loop();

function loop(){
  handleKeys();
  handleMoveFrames();
  render();
}

function pause(){
  clearInterval(interval);
}

function play(){
  $("#pause").hide();
  $("#resume").hide();
  $("#restart").hide();
  $("#quit").hide();
  $("#gameOver").hide();
  interval = setInterval(loop, 1000 / fps);
}

function pauseUI(){
  $("#pause").show();
  $("#resume").show();
  $("#restart").show();
  $("#quit").show();
}

$("#resume").click(function(){
  play();
});
                   
$(document).keyup(function(e) {
  if (e.which === 27) {
    pause();
    pauseUI();
  }
});

let backgroundImages = ["url(https://cdn.gamedevmarket.net/wp-content/uploads/20191203145249/4779a7547f510ddb98a89edda4df3c78.png)", 
                       "url(https://cdn.gamedevmarket.net/wp-content/uploads/20191203145257/360a9179134324db09f345ef1c8f98b2-700x400.png)",
                       "url(data:image/jpeg;base64,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)
                        "];

function changeBackground(){
  if (currentStage === stage1){
    c.style.backgroundImage = backgroundImages[0];
  } else if (currentStage === stage2){
    c.style.backgroundImage = backgroundImages[1];
  }
}