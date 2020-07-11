let c = document.getElementById("canvas");
let ctx = c.getContext("2d");
let fps = 60;


























class battler{
  constructor(hp, width, height){
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.hp = hp;
    this.walkAnimation = [];
    this.attackAnimation = [];
  }
}