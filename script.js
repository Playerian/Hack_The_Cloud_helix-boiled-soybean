let c = document.getElementById("canvas");
let ctx = c.getContext("2d");
let fps = 60;

let objectList = {};

//render loop
let interval = setInterval(() => {
  render();
}, 1000 / fps);

function render(){
  
}




















class battler{
  constructor(id, hp, width, height){
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.hp = hp;
    this.currentFrame = 0;
    //stand, walk, attack
    this.currentAction = "stand";
    this.standAnimation = [];
    this.walkAnimation = [];
    this.attackAnimation = [];
  }
}