/**
   
   One of the first things I learned in german:
      
   ICH BIN DER ANTON AUS TIROLL

   And also:
   
   AMEISENSCHEISSE
   
   The end.   

 */

var can = document.getElementsByTagName("canvas")[0];
var ctx = can.getContext("2d");
var winwidth = document.body.clientWidth;
var winheight = window.innerHeight;

can.width = winwidth;
can.height = winheight;


var cellw = 40;
var cellh = 40;
var dimx = Math.floor(winwidth/cellw);
var dimy = Math.floor(winheight/cellh);;


var grid = [];

for(var i = 0; i < dimx; i++){
    grid.push([]);
    for(var j = 0; j < dimy; j++){
        grid[i].push((i+j)%2==0 ? 1 : 0);
    }
}

can.onclick = click;

function click(e){
    var x = e.clientX;
    var y = e.clientY;

    var i = Math.floor(x/winwidth*dimx);
    var j = Math.floor(y/winheight*dimy);

    grid[i][j] = !grid[i][j];

    drawGrid(grid);
}

drawGrid(grid);

function drawGrid(grid){
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0,0,can.width,can.height);
    for(var i = 0; i < dimx; i++){
        for(var j = 0; j < dimy; j++){
            if(grid[i][j] == 0){
                ctx.fillStyle = "rgba(0,0,0,0.3)";
            } else {
                ctx.fillStyle = "rgba(0,0,0,0.6)";
            }
            ctx.fillRect(i*cellw,j*cellh,cellw,cellh);
        }
    }
}

