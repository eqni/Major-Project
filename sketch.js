///////////////////////////////////////////////////////////////////////////////////////////////
// Grenehoreh
// Andrew Chen
// 11/21/2023
//
///////////////////////////////////////////////////////////////////////////////////////////////
// Game: An Upstart Gardener takes over an abandoned greenhouse to begin their produce empire!
//
// Instructions: WASD Movement. Mouse Click to plant seeds and harvest plants. Spacebar harvests
// all plants. Plants cost money, but make back money when they are harvested. Arrow Keys Cycle
// through different plants.
///////////////////////////////////////////////////////////////////////////////////////////////


// Variables
const GRID_SIZE = 64;

let maps = {
  lobbyMap: [],
  shopMap: [],
  data: []
};

let state = {
  plant: 0,
  growth: [[[136, 82, 127], [159, 135, 175], [188, 231, 253], [169, 237, 190], [80, 132, 132]], [[54, 60, 60], [65, 193, 241], [52, 110, 129], [152, 251, 152], [27, 131, 102]], [[54, 60, 60], [71, 125, 139], [60, 155, 162], [105, 162, 151], [48, 105, 100]]]
};

let cellSize;
let xOffset;
let yOffset;
let font;
let market = [[100, 250], [500, 1000], [2000, 5000]];
let player;
let gameStarted = false;
let stockData = [];

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
  cellSize = min(windowHeight, windowWidth) / GRID_SIZE;
  maps.lobbyMap = genMap();
  maps.data = genData();
  player = new Player(GRID_SIZE / 2, GRID_SIZE / 2, 100);
}

// Simulates the game
function draw() {
  if (gameStarted) {
    noStroke();
    drawMap(GRID_SIZE, GRID_SIZE);
    drawPlants();
    drawUI();
    player.update();
    player.display();
  }
}

function startGame() {
  gameStarted = true;
}

// Centers the grid
function resizeScale() {
  yOffset = constrain((windowHeight - windowWidth) / 2, 0, windowHeight);
  xOffset = constrain((windowWidth - windowHeight) / 2, 0, windowWidth);
}

function mousePressed() {
  // Variables corresponding to mouse pos within grid
  let x = floor((mouseX - xOffset) / cellSize);
  let y = floor((mouseY - yOffset) / cellSize);

  // Plants and collects weeds
  if (maps.data[x][y].growth === 4) {
    player.wallet += market[maps.data[x][y].state - 2][1];
    maps.data[x][y] = 1; 
    maps.lobbyMap[x][y] = color(random(220, 230));
  }
  else {
    if (maps.data[x][y] === 1 && y < 34 && player.wallet >= market[state.plant][0]) {
      maps.data[x][y] = new Plant(state.plant + 2, 0);
      maps.lobbyMap[x][y] = color(state.growth[state.plant][0]);
      player.wallet -= market[state.plant][0];
    }
  }
}

function keyPressed() {
  // Collects all Plants
  if (keyCode === 69) {
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
  if (keyCode === 70) {
    state.plant++;
  }
  state.plant = state.plant % 3;
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
      if (y < 36 && y > 33 && x > 9 && x < 15) {
        newMap[x][y] = color(50, 84, 48, 50);
      }
      
      // Road
      if (x === 12 && y > 34 && y % 7 < 3) {
        newMap[x][y] = color(random(245, 255), random(220, 240), random(0, 25));
      }
      else if (y > 34 && x > 9 && x < 15) {
        newMap[x][y] = color(random(95, 115));
      }
      else if (y > 34 && x > 8 && x < 16) {
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
  for (let i = 0; i < 3; i++) {
    stockData.push([]);
    stockData[i] = market[1];
  }
  return newMap;
}

// Loads the UI
function drawUI() {
  let boxStroke;
  let boxFill;
  let textStroke;
  let textFill;
  let char;
  let name;
  let desc;

  // Coffee Beans
  if (state.plant === 0) {
    boxStroke = color(72, 42, 29);
    boxFill = color(220, 170, 112);
    textStroke = color(255, 185, 134);
    textFill = color(127, 90, 59);
    char = "C";
    name = "Coffee Beans";
    desc = "The seed of a tropical plant of the genus Coffea. ";
  }

  // Watermelon
  else if (state.plant === 1) {
    boxStroke = color(66, 95, 6);
    boxFill = color(200, 223, 170);
    textStroke = color(219, 31, 72);
    textFill = color(239, 51, 64);
    char = "W";
    name = "Watermelon";
    desc = "A succulent fruit and vine-like plant of the gourd family.";
  }

  // Herbs
  else if (state.plant === 2) {
    boxStroke = color(28, 53, 45);
    boxFill = color(41, 85, 38);
    textStroke = color(81, 123, 50);
    textFill = color(111, 153, 64);
    char = "H";
    name = "Herbs";
    desc = "Leafy Greens with culinary, medical, aromatic, or spiritual effects.";
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
  text(player.wallet, 2 * cellSize, 4.25 * cellSize);
  fill(87, 196, 120);
  text(player.wallet, 1.75 * cellSize, 4 * cellSize);

  // Plant Text
  textSize(3.75 * cellSize);
  fill(textStroke);
  text(char, 1.5 * cellSize, 10.7 * cellSize);
  fill(textFill);
  text(char, 1.3 * cellSize, 10.5 * cellSize);

  textSize(2.75 * cellSize);
  fill(textStroke);
  text(name, 6.7 * cellSize, 10.2 * cellSize);
  fill(textFill);
  text(name, 6.5 * cellSize, 10 * cellSize);

  textSize(2 * cellSize);
  fill(textStroke);
  text(desc, 1.7 * cellSize, 14.45 * cellSize, xOffset - cellSize);
  fill(textFill);
  text(desc, 1.5 * cellSize, 14.25 * cellSize, xOffset - cellSize);

  // Stock Market Graph
  stroke(boxStroke);
  strokeWeight(cellSize);
  fill(255);
  rect(0.5 * cellSize, 31 * cellSize, xOffset - cellSize, windowHeight - 31.5 * cellSize);
  stocks(textFill);
}

function stocks(color) {
  noStroke();
  fill(color);
  for (let i = 0; i < 3; i++) {
    let j = stockData[i][stockData[i].length - 1];
    j += random(-market[state.plant][1], market[state.plant][1]);
    j = constrain(j, market[state.plant][0], 2 * market[state.plant][1]);
    stockData[i].push(j);
    console.log(j);
    if (stockData[i].length > 3375) {
      stockData[i].splice(0, 1);
    }
  }
  for (let i = 0; i < stockData[state.plant].length; i++) {
    rect(cellSize + i * 0.01 * cellSize, (windowHeight + 38 * cellSize) / 2 - (stockData[state.plant][i] - market[state.plant][1]) * 0.0775 * cellSize, 0.25 * cellSize, 0.25 * cellSize);
  }
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
    this.form = "Normal";
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

    if (player.y < 34 && player.x > 10 && player.x < 15) {
      this.form = "Normal";
    }
    if (player.y > 33 && player.x > 10 && player.x < 15) {
      this.form = "Car";
    }   
  }

  display() {
    fill(0);
    noStroke();
    if (this.form === "Normal") {
      this.x = constrain(this.x, 1, 63);
      this.y = constrain(this.y, 1, 33);
      state.size = [1.5, 1.5];
      rect((this.x - state.size[0] / 2) * cellSize + xOffset, (this.y - state.size[1] / 2) * cellSize + yOffset, cellSize * state.size[0], cellSize * state.size[1]);
      fill(255);
      rect((this.x - state.size[0] / 2 + 0.25) * cellSize + xOffset, (this.y - state.size[1] / 2 + 0.25) * cellSize + yOffset, cellSize * (state.size[0] - 0.5), cellSize * (state.size[1] - 0.5));
    }
    else if (this.form === "Car") {
      this.x = constrain(this.x, 11, 14);
      this.y = constrain(this.y, 33, 64);
      state.size = [1.5, 4.5];
      rect((this.x - state.size[0] / 2) * cellSize + xOffset, (this.y - state.size[1] / 2) * cellSize + yOffset, cellSize * state.size[0], cellSize * state.size[1]);
      fill(255);
      rect((this.x - state.size[0] / 2 + 0.25) * cellSize + xOffset, (this.y - state.size[1] / 2 + 0.25) * cellSize + yOffset, cellSize * (state.size[0] - 0.5), cellSize * (state.size[1] - 0.5));
    }
  }
}
