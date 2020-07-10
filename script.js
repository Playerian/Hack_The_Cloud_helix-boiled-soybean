let size = 7;
let cells = [];

//init
for (let i = 0; i < size; i ++){
	cells[i] = [];
    for (let j = 0; j < size; j ++){
    	cells[i][j] = "a";
    }
}

//cut
function divide(x1, y1, x2, y2){
    if (x2 - x1 <= 1 || y2 - y1 <= 1){
    	return;
    }
	let dir = (x2 - x1) < (y2 - y1) ? "v" : "h";
    if ((x2 - x1) === (y2 - y1)){
    	dir = randomInt(0,2) === 0 ? "v" : "h";
    }
    if (dir === "h"){
    	let cutPoint = randomInt(x1 + 1, x2);
        let hole = randomInt(y1, y2);
        for (let index = y1; index <= y2; index ++){
            if (index !== hole){
        		cells[index][cutPoint] = "w";
            }
        }
        divide(x1, y1, x2, cutPoint - 1);
        divide(x1, cutPoint + 1, x2, y2);
    }else{
    	let cutPoint = randomInt(y1 + 1, y2);
        let hole = randomInt(x1, x2);
        for (let index = x1; index <= x2; index ++){
            if (index !== hole){
        		cells[index][cutPoint] = "w";
            }
        }
        divide(x1, y1, cutPoint - 1, y2);
        divide(cutPoint + 1, y1, x2, y2);
    }
}

divide(0, 0, size - 1, size - 1);
render();

//append
function render(){
  for (let i = 0; i < size; i ++){
      let $row = $("<div>").addClass("row");
      for (let j = 0; j < size; j ++){
        let cell = cells[i][j];
          let $cell = $("<div>").addClass("cell");
          $cell.text(cell);
          if (cell === "w"){
            $cell.addClass("red");
          }
          $row.append($cell);
      }
      $("#cont").append($row);
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

console.log("op");