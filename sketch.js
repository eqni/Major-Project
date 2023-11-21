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

// Classes
class Plant {
  constructor(state, growth) {
    this.state = state;
    this.growth = growth;
  }
}
// Variables
const GRID_SIZE = 50;

let maps = {
  lobbyMap: [],
  shopMap: [],
  data: []
};

let state = {
  identity: "normal",
  size: [1.5, 1.5],
  direction: 0,
  stage: 0,
  plant: 0,
  cost: 100,
  gain: 250,
  growth: [[[136, 82, 127], [159, 135, 175], [188, 231, 253], [169, 237, 190], [80, 132, 132]], [[54, 60, 60], [65, 193, 241], [52, 110, 129], [152, 251, 152], [27, 131, 102]], [[54, 60, 60], [71, 125, 139], [60, 155, 162], [105, 162, 151], [48, 105, 100]]],
};

let cellSize;
let xOffset = 0;
let yOffset = 0;
let x;
let y;
let font;
let money = 100;
let yield = [[100, 250], [500, 1000], [2000, 5000]];

// Loads Font
function preload() {
  font = loadFont("Pixel Font.TTF");
}

// Builds Map, Sets up Text Scale
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  resizeScale();
  textFont(font);

  x = GRID_SIZE / 2;
  y = GRID_SIZE / 2;
  cellSize = min(windowHeight, windowWidth) / GRID_SIZE;
  maps.lobbyMap = genMap();
  maps.data = genData();
}

// Centers the grid
function resizeScale() {
  if (windowHeight >= windowWidth) {
    yOffset = (windowHeight - windowWidth) / 2;
  }
  else if (windowHeight <= windowWidth) {
    xOffset = (windowWidth - windowHeight) / 2;
  }
}

function mousePressed() {
  // Variables corresponding to mouse pos within grid
  let px = floor((mouseX - xOffset) / cellSize);
  let py = floor((mouseY - yOffset) / cellSize);

  // Plants and collects weeds
  if (maps.data[px][py][1] === 4) {
    money += maps.data[px][py][2];
    maps.data[px][py] = 1; 
    maps.lobbyMap[px][py] = color(random(220, 230));
  }
  else {
    if (maps.data[px][py] === 1 && py > 0 && py < 34 && money >= yield[state.plant][0]) {
      maps.data[px][py] = new Plant(state.plant + 2, 0);
      maps.lobbyMap[px][py] = color(state.growth[state.plant][0]);
      money -= yield[state.plant][0];
        maps.data[px][py] = [3, 0, 1000];
        money -= 500;
        maps.data[px][py] = [4, 0, 5000];
    }
  }
}

function keyPressed() {
  // Collects all Plants
  if (keyCode === 32) {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < 34; y++) {
        if(maps.data[x][y][1] === 4) {
          money += maps.data[x][y][2];
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

// Wall checks the player and its state
function gateCheck() {
  if(y < 33 && x > 22 && x < 28) {
    state.identity = "normal";
  }
  if(y > 33 && x > 22 && x < 28) {
    state.identity = "truck";
  } 
}

// Simulates the game
function draw() {
  noStroke();
  drawMap(GRID_SIZE, GRID_SIZE);
  drawPlayer();
  drawPlants();
  drawUI();
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

// Draws the player
function drawPlayer() {
  fill(0);
  // Movement
  if (keyIsDown(68)) {
    x++;
  }
  else if (keyIsDown(65)) {
    x--;
  }
  else if (keyIsDown(83)) {
    y++;
    state.direction = 0;
  }
  else if (keyIsDown(87)) {
    y--;
    state.direction = 1;
  }
  gateCheck();

  // State
  if (state.identity === "normal") {
    x = constrain(x, 1, 49);
    y = constrain(y, 2, 33);
    state.size = [1.5, 1.5];
    rect((x - state.size[0] / 2) * cellSize + xOffset, (y - state.size[1] / 2) * cellSize + yOffset, cellSize * state.size[0], cellSize * state.size[1]);
  }
  else if (state.identity === "truck") {
    x = constrain(x, 24, 27);
    y = constrain(y, 33, 50);
    state.size = [1.5, 4.5];
    rect((x - state.size[0] / 2) * cellSize + xOffset, y * cellSize + yOffset, cellSize * state.size[0], cellSize * state.size[1]);
  }
}

// Simulates plant growth
function drawPlants() {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (maps.data[x][y][0] > 1 && random() < 0.05) {
        if (maps.data[x][y][1] < 4) {
          maps.data[x][y][1] += 1;
        }
        maps.lobbyMap[x][y] = color(state.growth[maps.data[x][y][0] - 2][maps.data[x][y][1]]);
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
      if (y < 34 && y > 0) {
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
  let borderFill;
  let outerFill;
  let innerFill;
  let char;
  let name;
  let desc;

  // Cafeteria CannaSib
  if (state.plant % 3 === 0) {
    outerFill = color(180, 237, 210);
    innerFill = color(184, 184, 255);
    borderFill = color(147, 129, 255);
    char = "C";
    name = "Cafe CannaSib";
    desc = "How come the cafeteria food is so bad, but they never stop eating it?";
  }

  // Washroom WheDe
  else if (state.plant % 3 === 1) {
    outerFill = color(64, 110, 142);
    innerFill = color(142, 168, 195);
    borderFill = color(35, 57, 91);
    char = "W";
    name = "Washroom WheDe";
    desc = "What's so good about the washroom that they gotta go every period?";
  }

  // Hallway HerIon
  else if (state.plant % 3 === 2) {
    outerFill = color(48, 105, 100);
    innerFill = color(105, 162, 151);
    borderFill = color(54, 60, 60);
    char = "H";
    name = "Hallway HerIon";
    desc = "There are rooms everywhere, why do they always stand in the halls?";
  }

  // Money Box
  strokeWeight(8);
  fill(0);
  rect(0, 0, 250, 100);
  stroke(234, 173, 11);
  fill(255, 255, 167);
  rect(4, 4, 29 * money.toString().length + 15, cellSize / 2 + 46);

  // State Box
  stroke(borderFill);
  fill(outerFill);
  rect(4, cellSize / 2 + 58, cellSize / 2 + 56, cellSize / 2 + 56);
  rect(xOffset - 4, cellSize / 2 + 58, -xOffset + 72, cellSize / 2 + 56);
  rect(4, cellSize / 2 + 122, xOffset - 8, 196);
  fill(63, 112, 117);
   
  // Money
  noStroke();
  textSize(32);
  fill(234, 173, 11);
  text(money, 12, 2 * cellSize + 9);

  // State + Description
  textSize(44);
  text(char, 18, cellSize / 2 + 106);
  textSize(26);
  text(name, 78, cellSize / 2 + 100, xOffset);

  textSize(24);
  text(desc, 14, cellSize / 2 + 150, 475, xOffset);
  fill(innerFill);
  text(desc, 16, cellSize / 2 + 150, 475, xOffset);
  textSize(26);
  text(name, 76, cellSize / 2 + 100, xOffset);
  textSize(44);
  text(char, 18, cellSize / 2 + 107);

}
