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
        grid[i].push(0);
    }
}

can.onclick = click;

function click(e){
    var x = e.clientX;
    var y = e.clientY;

    var i = Math.floor(x/winwidth*dimx);
    var j = Math.floor(y/winheight*dimy);

    grid[i][j] += 0.2;

}

drawGrid(grid);

function drawGrid(grid){
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0,0,can.width,can.height);
    for(var i = 0; i < dimx; i++){
        for(var j = 0; j < dimy; j++){
            var opacity = grid[i][j];
            ctx.fillStyle = "rgba(0,0,0,"+opacity+")";
            ctx.fillRect(i*cellw,j*cellh,cellw,cellh);
        }
    }
}

setInterval(physics,40);

/* Gravity */
var g = 0.03;

function physics(){
    var copy = copygrid(grid);
    for(var i = 0; i < dimx; i++){
        for(var j = 0; j < dimy; j++){
            grid[i][j] -= g * copy[i][j];
            if(j + 1 < dimy){
                grid[i][j+1] += g * copy[i][j];
            }
        }
    }

    drawGrid(grid);
}

function copygrid(grid){
    var newgrid = [];
    for(var i = 0; i < dimx; i++){
        newgrid.push([]);
        for(var j = 0; j < dimy; j++){
            newgrid[i].push(grid[i][j]);
        }
    }
    return newgrid;
}
