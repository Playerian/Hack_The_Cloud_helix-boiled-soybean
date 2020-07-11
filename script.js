let c = document.getElementById("canvas");
let ctx = c.getContext("2d");
let fps = 60;
let width = 500;
let height = 500;
c.width = width;
c.height = height;

let objectList = {};

class Battler{
  constructor(id, hp, width, height){
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.hp = hp;
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

function render(){
  //empty
  ctx.clearRect(0, 0, width, height);
  //render
  for (let key in objectList){
    let object = objectList[key];
  }
  ctx.drawImage(sprite[0].img, 0+128, 0+128, 128, 128, 0, 0, 128, 128)
  console.log("aaa")
}












let sprite = [
  {img : "https://cdn.glitch.com/2d713a23-b2e0-4a6b-9d5c-61c597ba6d8e%2FcharAtk1Sprite.png?v=1594495768907",
    totalFrame : 6 }//counting from 0
]

sprite.forEach((v, i) => {
  let img = new Image();
  img.src = v.img;
  sprite[i].img = img;
});


let char = new Battler(0, 1, 128, 128);
char.x = 50;
char.y = 50;

//render loop
let interval = setInterval(() => {
  render();
}, 1000 / fps);
