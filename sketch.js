///////////////////////////////////////////////////////////////////////////////////////////
// Warehouse Weed
// Andrew Chen
// 11/21/2023
//
// Extra for Experts:
// - loaded fonts
// - 3D Arrayssaaaa
///////////////////////////////////////////////////////////////////////////////////////////
// Game: You are a unique gardener who grows and sells weeds.
//
// Instructions: WASD to move character. (it doesn't do anything at the moment)
// Moving out of the warehouse turns the player into truck mode, which elongates the character.
// Mouse Press to plant and harvest weeds. Space press to mass harvest weeds. Up and Down 
// Arrows filter through the different weeds.
///////////////////////////////////////////////////////////////////////////////////////////


// Variables
const GRID_SIZE = 64;

let maps = {
  lobbyMap: [],
  shopMap: [],
  data: []
};

let state = {
  identity: "normal",
  size: [1.5, 1.5],
  stage: 0,
  plant: 0,
  growth: [[[136, 82, 127], [159, 135, 175], [188, 231, 253], [169, 237, 190], [80, 132, 132]], [[54, 60, 60], [65, 193, 241], [52, 110, 129], [152, 251, 152], [27, 131, 102]], [[54, 60, 60], [71, 125, 139], [60, 155, 162], [105, 162, 151], [48, 105, 100]]],
};

let cellSize;
let xOffset;
let yOffset;
let font;
let market = [[100, 250], [500, 1000], [2000, 5000]];
let player;
let playerImage;

// Loads Font
function preload() {
  font = loadFont("Pixel Font.TTF");
}

// Builds Map, Sets up Text Scale
function setup() {
  imageMode(CENTER);
  createCanvas(windowWidth, windowHeight);
  background(0);
  resizeScale();
  textFont(font);
  cellSize = min(windowHeight, windowWidth) / GRID_SIZE;
  maps.lobbyMap = genMap();
  maps.data = genData();
  player = new Player(GRID_SIZE / 2, GRID_SIZE / 2, 100);
}

// Centers the grid
function resizeScale() {
  yOffset = constrain((windowHeight - windowWidth) / 2, 0, windowHeight);
  xOffset = constrain((windowWidth - windowHeight) / 2, 0, windowWidth);
}

function mousePressed() {
  // Variables corresponding to mouse pos within grid
  let px = floor((mouseX - xOffset) / cellSize);
  let py = floor((mouseY - yOffset) / cellSize);

  // Plants and collects weeds
  if (maps.data[px][py].growth === 4) {
    player.wallet += market[maps.data[px][py].state - 2][1];
    maps.data[px][py] = 1; 
    maps.lobbyMap[px][py] = color(random(220, 230));
  }
  else {
    if (maps.data[px][py] === 1 && py < 34 && player.wallet >= market[state.plant][0]) {
      maps.data[px][py] = new Plant(state.plant + 2, 0);
      maps.lobbyMap[px][py] = color(state.growth[state.plant][0]);
      player.wallet -= market[state.plant][0];
    }
  }
}

function keyPressed() {
  // Collects all Plants
  if (keyCode === 32) {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < 34; y++) {
        if (maps.data[x][y].growth === 4) {
          player.wallet += market[maps.data[x][y].state - 2][1];
          maps.data[x][y] = 1;
          maps.lobbyMap[x][y] = color(random(220, 230));
        }
      }
    }
  }

  // Changes current plant
  if (keyCode === 38) {
    state.plant++;
  }
  else if (keyCode === 40) {
    state.plant++;
  }
  state.plant = state.plant % 3;
}

// Simulates the game
function draw() {
  noStroke();
  drawMap(GRID_SIZE, GRID_SIZE);
  drawPlants();
  drawUI();
  player.update();
  player.display();
}

// Loads the map
function drawMap() {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      fill(maps.lobbyMap[x][y]);
      rect(x * cellSize + xOffset, y * cellSize + yOffset, cellSize, cellSize);
    }
  }
}

// Simulates plant growth
function drawPlants() {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (maps.data[x][y].state > 1 && random() < 0.05) {
        let currentPlant = maps.data[x][y];
        currentPlant.update();
        maps.lobbyMap[x][y] = color(state.growth[maps.data[x][y].state - 2][maps.data[x][y].growth]);
      }
    }
  }
}

// Creates the map
function genMap() {
  let newMap = [];

  // lobbyMap Map
  for (let x = 0; x < GRID_SIZE; x++) {
    newMap.push([]);
    for (let y = 0; y < GRID_SIZE; y++) {
      newMap[x].push([]);

      // Dirt
      newMap[x][y] = color(random(110, 130), random(40, 50), random(25, 40));

      // lobbyMap
      if (y < 34) {
        newMap[x][y] = color(random(220, 230));
      }
      else if (y < 35) {
        newMap[x][y] = color(0);
      }
      if (y < 36 && y > 33 && x > 22 && x < 28) {
        newMap[x][y] = color(50, 84, 48, 50);
      }
      
      // Road
      if (x === 25 && y > 34 && y % 8 < 3) {
        newMap[x][y] = color(random(245, 255), random(220, 240), random(0, 25));
      }
      else if (y > 34 && x > 22 && x < 28) {
        newMap[x][y] = color(random(95, 115));
      }
      else if (y > 34 && x > 21 && x < 29) {
        newMap[x][y] = color(random(35, 50));
      }
    }
  }
  return newMap;
}

// Adds additional information to categorize specific items in the grid
function genData() {
  let newMap = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    newMap.push([]);
    for (let y = 0; y < GRID_SIZE; y++) {
      newMap[x].push([]);
      if (y < 34 && y > 0) {
        newMap[x][y] = 1;
      }
      else {
        newMap[x][y] = 0;
      }
    }
  }

  return newMap;
}

// Loads an icon representing the current state
function drawUI() {
  let boxStroke;
  let boxFill;
  let textStroke;
  let textFill;
  let char;
  let name;
  let desc;

  // Cafeteria CannaSib
  if (state.plant % 3 === 0) {
    boxStroke = color(72, 42, 29);
    boxFill = color(220, 170, 112);
    textStroke = color(255, 235, 205);
    textFill = color(127, 90, 59);
    char = "C";
    name = "Coffee Beans";
    desc = "The stuff adults drink like water.";
  }

  // Washroom WheDe
  else if (state.plant % 3 === 1) {
    boxFill = color(64, 110, 142);
    textFill = color(142, 168, 195);
    boxStroke = color(35, 57, 91);
    char = "W";
    name = "Watermelon";
    desc = "The stuff everyone drink like water ... in summer.";
  }

  // Hallway HerIon
  else if (state.plant % 3 === 2) {
    boxFill = color(48, 105, 100);
    textFill = color(105, 162, 151);
    boxStroke = color(54, 60, 60);
    char = "H";
    name = "Herbs";
    desc = "Always in demand.";
  }

  // Money Box
  strokeWeight(cellSize);
  stroke(8, 79, 9);
  fill(62, 156, 39);
  rect(0.5 * cellSize, 0.5 * cellSize, xOffset - cellSize, 5 * cellSize);

  // Plant Box
  stroke(boxStroke);
  fill(boxFill);
  rect(0.5 * cellSize, 6.5 * cellSize, 5 * cellSize, 5 * cellSize);
  rect(5.5 * cellSize, 6.5 * cellSize, xOffset - 6 * cellSize, 5 * cellSize);
  rect(0.5 * cellSize, 11.5 * cellSize, xOffset - cellSize, 20 * cellSize);

  // Money Text
  noStroke();
  textSize(3 * cellSize);
  fill(22, 129, 44);
  text(player.wallet, 1.75 * cellSize + 2, 4 * cellSize + 2);
  fill(87, 196, 120);
  text(player.wallet, 1.75 * cellSize, 4 * cellSize);

  // Plant Text
  textSize(3.75 * cellSize);
  fill(textStroke);
  text(char, 1.5 * cellSize + 2, 10.5 * cellSize + 2);
  fill(textFill);
  text(char, 1.5 * cellSize, 10.5 * cellSize);

  textSize(2.75 * cellSize);
  fill(textStroke);
  text(name, 6.5 * cellSize + 2, 10 * cellSize + 2);
  fill(textFill);
  text(name, 6.5 * cellSize, 10 * cellSize);



  // textSize(24);
  // text(desc, 14, cellSize / 2 + 150, 475, xOffset);
  // fill(textFill);
  // text(desc, 16, cellSize / 2 + 150, 475, xOffset);
  // textSize(26);
  // text(name, 76, cellSize / 2 + 100, xOffset);
}

// Classes
class Plant {
  constructor(state, growth) {
    this.state = state;
    this.growth = growth;
  }

  update() {
    if (this.growth < 4) {
      this.growth++;
    }
  }
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.wallet = 100;
  }

  update() {
    // Movement
    if (keyIsDown(68)) {
      this.x++;
    }
    else if (keyIsDown(65)) {
      this.x--;
    }
    else if (keyIsDown(83)) {
      this.y++;
    }
    else if (keyIsDown(87)) {
      this.y--;
    }

    if(player.y < 33 && player.x > 22 && player.x < 28) {
      state.identity = "normal";
    }
    if(player.y > 33 && player.x > 22 && player.x < 28) {
      state.identity = "truck";
    }   
  }

  display() {
    fill(0);
    if (state.identity === "normal") {
      this.x = constrain(player.x, 1, 63);
      this.y = constrain(player.y, 1, 33);
      state.size = [1.5, 1.5];
      rect((this.x - state.size[0] / 2) * cellSize + xOffset, (this.y - state.size[1] / 2) * cellSize + yOffset, cellSize * state.size[0], cellSize * state.size[1]);
      fill(255);
      rect((this.x - state.size[0] / 2) * cellSize + xOffset + 4, (this.y - state.size[1] / 2) * cellSize + yOffset + 4, cellSize * state.size[0] - 8, cellSize * state.size[1] - 8);
    }
    else if (state.identity === "truck") {
      this.x = constrain(player.x, 24, 27);
      this.y = constrain(player.y, 33, 64);
      state.size = [1.5, 4.5];
      rect((this.x - state.size[0] / 2) * cellSize + xOffset, this.y * cellSize + yOffset, cellSize * state.size[0], cellSize * state.size[1]);
    }
  }
}