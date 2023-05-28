/**********
Global Var
***********/
// Global
var canvas, canvasContext;

const WALL_DISTANCE_FROM_TOP = 30;
const WALL_DISTANCE_FROM_SIDES = 20;
const WALL_THICKNESS = 15;



const playAreaX = WALL_DISTANCE_FROM_SIDES + WALL_THICKNESS;
const playAreaXo =  WALL_DISTANCE_FROM_SIDES + WALL_THICKNESS;
const playAreaY = WALL_DISTANCE_FROM_TOP + 2*WALL_THICKNESS;

var paddleX = 400;
const PADDLE_THICKNESS = 15;
const PADDLE_WIDTH = 150;
const PADDLE_DIST_FROM_EDGE = 60;

// Mouse
var mouseX = 0;
var mouseY = 0;
var score = 0;

var ballsArray = [];
var bricksArray = [];

function random(min,max) {
    const num = Math.floor(Math.random()*(max-min)) + min;
    return num;
};

function randomRGB() {
    return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
}

function colorRect(leftX, topY, width, height, color){
    canvasContext.fillStyle = color;
    canvasContext.fillRect(leftX, topY, width, height);
}
  
function colorText(showWords, textX,textY, fillColor) {
    canvasContext.font = "20px Georgia";
    canvasContext.fillStyle = fillColor;
    canvasContext.fillText(showWords,textX, textY);
}



class Ball {
    constructor(x, y, velX, velY, color, size) {
      this.x = x;
      this.y = y;
      this.velX = velX;
      this.velY = velY;
      this.color = color;
      this.size = size;
      this.exists = true;
    }
  
    draw() {
      canvasContext.beginPath();
      canvasContext.fillStyle = this.color;
      canvasContext.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
      canvasContext.fill();
    }

    update() {
        if ((this.x + this.size) >= canvas.width-WALL_DISTANCE_FROM_SIDES-WALL_THICKNESS) {
          this.velX = -(this.velX);
        }
    
        if ((this.x - this.size) <= WALL_DISTANCE_FROM_SIDES+ WALL_THICKNESS) {
          this.velX = -(this.velX);
        }
    
        if ((this.y - this.size) <= WALL_DISTANCE_FROM_TOP+WALL_THICKNESS) {
          this.velY = -(this.velY);
        }
        var paddleTopEdgeY = canvas.height-PADDLE_DIST_FROM_EDGE;
        var paddleBottomEdgeY = paddleTopEdgeY+PADDLE_THICKNESS;
        var paddleLeftEdgeX = paddleX;
        var paddleRightEdgeX = paddleX+PADDLE_WIDTH;

        if(this.y >= paddleTopEdgeY-this.size && // top of paddle
            this.y <= paddleBottomEdgeY - this.size && // bottom of paddle
            this.x >= paddleLeftEdgeX && // left half of paddle
            this.x <= paddleRightEdgeX // right half of paddle
            ){
            this.velY = -this.velY;
            var paddleCenterX = paddleX + PADDLE_WIDTH/2;
            var ballDistFromCenterX = this.x - paddleCenterX;
            this.velX = ballDistFromCenterX * 0.25;
            this.x += this.velX;
            this.y += this.velY;
            return true;
        }
        if(this.y > canvas.height - PADDLE_DIST_FROM_EDGE/2){
            this.exists = false;
        }
        this.x += this.velX;
        this.y += this.velY;
        return false;
      }
}

class Brick{
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.exists = true;
      }
      draw() {
        canvasContext.beginPath();
        canvasContext.fillStyle = this.color;
        colorRect(this.x, this.y, 80, 20, 'green');
        canvasContext.fill();
      }
}


/**********
General GamePlay
***********/
window.onload = function(){
  canvas = document.getElementById('gameCanvas');
  canvasContext = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const framesPerSecond = 60;
  const balls = new Ball(
      random(playAreaX + 10, canvas.width - playAreaXo - 10),
      random(playAreaY, canvas.width/2 - 10),
      7+random(-3, 3),
      7+random(-3,-3),
      randomRGB(), 
      10+random(-3,3)
    );
  ballsArray.push(balls);
  setInterval(updateAll, 1000/framesPerSecond);
  canvas.addEventListener('mousemove', updateMousePos);
  canvas.addEventListener('click',addFeature)
}



function updateAll(){
    canvasContext.fillStyle = 'rgba(255, 255, 255, 0.45)';
    colorRect(0,0,canvas.width, canvas.height);
    ballsUpdate();
    colorRect(paddleX, canvas.height-PADDLE_DIST_FROM_EDGE, PADDLE_WIDTH, PADDLE_THICKNESS, 'indigo');
    wallsDraw();
    drawbricks();
    collisionDetect();
    colorText("Score: "+ score, WALL_DISTANCE_FROM_SIDES, 20, 'black');
    colorText("Add Ball", canvas.width/2 -50, 20, 'red');
    colorText("Add Obstacles", canvas.width - playAreaXo-130, 20, "blue");
}



/**********
Helper funcitons
***********/


function updateMousePos(evt) {
  var rect = canvas.getBoundingClientRect();
  mouseX = evt.clientX - rect.left;
  mouseY = evt.clientY - rect.top;
  if(mouseX - PADDLE_WIDTH/2 < WALL_DISTANCE_FROM_SIDES + PADDLE_THICKNESS){
    paddleX = WALL_DISTANCE_FROM_SIDES+PADDLE_THICKNESS
  }
  else if(mouseX - PADDLE_WIDTH/2 > canvas.width - WALL_DISTANCE_FROM_SIDES- WALL_THICKNESS-PADDLE_WIDTH){
    paddleX = canvas.width - WALL_DISTANCE_FROM_SIDES- WALL_THICKNESS-PADDLE_WIDTH;    // handling edge case of paddle position
  }
  else{
    paddleX = mouseX - PADDLE_WIDTH/2; //moving paddle according to mouse position
  }
}

function addFeature(evt){
   const rect = canvas.getBoundingClientRect();
   //code to add balls in the canvas
   const textX = evt.clientX - rect.left;
   const textY = evt.clientY - rect.top;
   if(textX >= canvas.width/2 -50 && textX <= canvas.width/2 +30 && textY < 20 ){
    const balls = new Ball(
        random(playAreaX + 10, canvas.width - playAreaXo - 10),
        random(playAreaY, canvas.width/2 - 10),
        7+random(-3, 3),
        7+random(-3,-3),
        randomRGB(), 
        10+random(-3,3)
      );
      ballsArray.push(balls);
   }

   //code to add obstacles in the canvas
   if(textX >= canvas.width - playAreaXo-130 && textX <= canvas.width-playAreaXo && textY < 20 ){
    bricksArray = [];    
    for(let i = 0; i < 7; i++){
            let brickX = (playAreaX+i*(canvas.width/8)+10)%canvas.width;
            let brickY = random(WALL_DISTANCE_FROM_TOP+WALL_THICKNESS+10, canvas.height/1.5);
            const brick = new Brick(brickX, brickY);
            bricksArray.push(brick)
        }

    } 
}


function collisionDetect(){
  // collision detection of obstacles with balls
    for(const brick of bricksArray){
        for(const ball of ballsArray){
            if(ball.x+ball.size >= brick.x && ball.x+ball.size <= brick.x+80 && ball.y+ball.size >= brick.y && ball.y+ball.size <= brick.y+WALL_THICKNESS){
                if(ball.x+ball.size-ball.velX >= brick.x && ball.x+ball.size-ball.velX <= brick.x+80){
                    ball.velY = -ball.velY
                    flag = false;
                }
                else if(ball.y+ball.size-ball.velY >= brick.y && ball.y+ball.size-ball.velY <= brick.y+WALL_THICKNESS){
                    ball.velX = -ball.velX;
                    flag = false;
                }
                else{
                    ball.velY = -ball.velY;
                    ball.velX = -ball.velX;
                }
            }
        }

    }
}

/**********
GamePlay Draw functions
***********/




function wallsDraw(){
    colorRect(WALL_DISTANCE_FROM_SIDES, WALL_DISTANCE_FROM_TOP,WALL_THICKNESS, canvas.height-PADDLE_DIST_FROM_EDGE, 'green');
    colorRect(WALL_DISTANCE_FROM_SIDES, WALL_DISTANCE_FROM_TOP, canvas.width - 2*WALL_DISTANCE_FROM_SIDES, WALL_THICKNESS, 'green');
    colorRect(canvas.width-WALL_DISTANCE_FROM_SIDES-WALL_THICKNESS, WALL_DISTANCE_FROM_TOP,WALL_THICKNESS, canvas.height-PADDLE_DIST_FROM_EDGE, 'green');
}

function ballsUpdate(){
    let noball = false;
    for (const ball of ballsArray) {
        if (ball.exists) {
          noball = true;
          ball.draw();
          if(ball.update()){
            score = score+ballsArray.length;
          }
        }
    }
    if(!noball){
        ballsArray[0].exists = true;
        ballsArray[0].y = canvas.height/2;
        ballsArray[0].x = canvas.width/2;
        ballsArray[0].velX = random(-6, 6);
        ballsArray[0].velY = random(-6, 6);
        score = 0;
    }
}

function drawbricks(){
    for(const brick of bricksArray){
        if(brick.exists == true){
            brick.draw();
        }
    }
}

