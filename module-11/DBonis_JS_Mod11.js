/*
 * Dylan Bonis
 * Module 11 Assignment
 * 5/12/23
 * Javascript that lets you play snake
*/
//Board Variables, values in pixels made into larger groups via "blocksize"
var blockSize = 20;
var rows = 50;
var columns = 50;
var board;
var context;
var checkbox;

//snake variables
var snakeX;
var snakeY;
var velocityX = 0; //Starts game paused
var velocityY = 0;
var snakeBody = [];

//food variables
var foodX;
var foodY;

//pause variables
var previousX = 0;
var previousY = 0;

//game variables
var gameOver = false;
var gamePaused = false;
var gameWalls = true;
var gameSpeed = 1000 / 20; //50 milliseconds between updates for a 50 x 50 board

window.onload = function () {
    board = document.getElementById("board");
    board.height = rows * blockSize;
    board.width = columns * blockSize;
    context = board.getContext("2d");
    checkbox = document.getElementById("noWalls");

    //Calls the initilize board function that gets snake coordinates and food coordinates
    initializeBoard();

    //Adds an event listner to the document to make is use the changeDirection function
    document.addEventListener("keydown", changeDirection);

    //Adds an event listner for a checkbox for walls or no walls
    checkbox.addEventListener('change', e => {

        if (e.target.checked) {
            gameWalls = false;
        }
        else {
            gameWalls = true;
        }

    });
;

    //Repeatedly calls the update function __ times per second
    setInterval(update, 1000 / 20);
}

function update() {
    if (gameOver) {
        return;
    }

    //makes a darkgreen background for the snake game
    context.fillStyle = "darkgreen";
    context.fillRect(0, 0, board.width, board.height);

    //draws the food in position X, Y
    context.fillStyle = "red";
    context.fillRect(foodX, foodY, blockSize, blockSize);

    //If the position is the same, add a new piece to the snake body
    checkForFood();

    //For each piece of the snakeBody, move it's position to the next snake coordinates, as long as it's not paused
    updateCoordinates();


    //draws the snake in position X, Y
    if (gamePaused == false) {
        snakeX += velocityX * blockSize;
        snakeY += velocityY * blockSize;
    }
    context.fillStyle = "lime";
    context.fillRect(snakeX, snakeY, blockSize, blockSize);

    //draws the body of the snake
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }

    //Checks to see if any part of snake touches itself or a wall
    checkGameWin();

    //checks to see if the length of the snakebody is the same as the columns times the rows (board area)
    checkGameOver();
}

//changes the velocity of the snake depending on the key pressed. Escape sets velocity to zero and stores previous direction and also turns the game to the pause state, hitting it again reverses
function changeDirection(e) {
    if ((e.code == "KeyW" || e.code == "ArrowUp") && velocityY != 1) { //Up
        velocityX = 0;
        velocityY = -1;
    }
    else if ((e.code == "KeyS" || (e.code == "ArrowDown")) && velocityY != -1) { //Down
        velocityX = 0;
        velocityY = 1;
    }

    else if ((e.code == "KeyA" || (e.code == "ArrowLeft")) && velocityX != 1) { //Left
        velocityY = 0;
        velocityX = -1;
    }

    else if ((e.code == "KeyD" || (e.code == "ArrowRight")) && velocityX != -1) { //Right
        velocityY = 0;
        velocityX = 1;
    }

    else if (e.code == "Escape") {
        if (previousX == 0 && previousY == 0) {
            previousX = velocityX;
            previousY = velocityY;
            velocityX = 0;
            velocityY = 0;
            gamePaused = true;
        }
        else {
            velocityX = previousX;
            velocityY = previousY;
            previousX = 0;
            previousY = 0;
            gamePaused = false;
        }
        
    }
}

//Place food and snake in random spot, snake cannot be ontop of food
function initializeBoard() {
    snakeX = randomBlock(true);
    snakeY = randomBlock(false);
    placeFood();
}

function placeFood() {
    foodX = randomBlock(true);
    foodY = randomBlock(false);
    //Replaces the text in paragraph tag to tell you how many apples left to go 'til you finish the game
    document.getElementById("applesLeft").innerText = (columns * rows) - snakeBody.length + " apples to go!";

    while  (checkCollision(foodX, foodY) == true) {
        foodX = randomBlock(true);
        foodY = randomBlock(false);
    }
}


//Returns a location with a max of column or row, true = X
function randomBlock(isX) {
    if (isX == true)
        return Math.floor(Math.random() * columns) * blockSize;
    else
        return Math.floor(Math.random() * rows) * blockSize;
}

//If the snake hits the food, add a piece to the snake body
function checkForFood() {
    if (snakeX == foodX && snakeY == foodY) {
        snakeBody.push([foodX, foodY]);
        placeFood();
    }
}

//As long as the game isn't pause, update from the tail to have each coordinate be the one aheads place to the front of the snake, where it's position becomes that of the current and the head changes in update()
function updateCoordinates() {
    if (gamePaused == false) {
        for (let i = snakeBody.length - 1; i > 0; i--) {
            snakeBody[i] = snakeBody[i - 1];
        }
        if (snakeBody.length) {
            snakeBody[0] = [snakeX, snakeY];
        }
    }
}

//As long as the gameWalls is true, check for less or more than the current row or column if colliding, end game, otherwise it changes position to that of the opposite wall, if colliding with a piece of itself, gameOver.
function checkGameOver() {
    if (gameWalls == true) {
        if (snakeX < 0 || snakeX > (columns - 1) * blockSize || snakeY < 0 || snakeY > (rows - 1) * blockSize) {
            document.getElementById("applesLeft").innerText = "You Lost :(";
            document.getElementById("applesLeft").style.color = "Red"
        }
    }
    else {
        if (snakeX < 0) {
            snakeX = (columns - 1) * blockSize;
        }
        else if (snakeX > (columns - 1) * blockSize) {
            snakeX = 0;
        }
        else if (snakeY < 0) {
            snakeY = (rows - 1) * blockSize;
        }
        else if (snakeY > (rows - 1) * blockSize) {
            snakeY = 0;
        }
    }

    if (checkCollision(snakeX, snakeY)) {
        gameOver = true;
        document.getElementById("applesLeft").innerText = "You Lost :(";
        document.getElementById("applesLeft").style.color = "Red";
    }
}
//Checks for collision within snake body
function checkCollision(X, Y) {
    for (let i = 0; i < snakeBody.length; i++) {
        if (X == snakeBody[i][0] && Y == snakeBody[i][1]) {
            return true;
        }
    }
    return false;
}

//Checks to see if size of snake is equal to the number of tiles available (fullboard)
function checkGameWin() {
    if (snakeBody.length == columns * rows) {
        alert("You Win!");
        gameOver = true;
        document.getElementById("applesLeft").innerText = "You Win!";
        document.getElementById("applesLeft").style.color = "Green";
    }
}

