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
  greenhouse: [],
  shop: [],
  data: []
};

// Variables
let cellSize;
let xOffset;
let yOffset;
let font;
let prices = [[100, 250], [500, 1000], [2000, 5000]];
let plants = [[[136, 82, 127], [159, 135, 175], [188, 231, 253], [169, 237, 190], [80, 132, 132]], [[54, 60, 60], [65, 193, 241], [52, 110, 129], [152, 251, 152], [27, 131, 102]], [[54, 60, 60], [71, 125, 139], [60, 155, 162], [105, 162, 151], [48, 105, 100]]];
let currentPlant = 0;
let player;
let started = false;
let inventory = [0, 0, 0];

// let stockData = [];

// Sounds
let switchPlant;


// Loads Font
function preload() {
  font = loadFont("assets/Pixel Font.TTF");
  switchPlant = loadSound("assets/switch plant.mp3")
}

// Builds Map, Sets up Text Scale
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  createMap();
  centerMap();
  textFont(font);
  player = new Player(GRID_SIZE / 2, GRID_SIZE / 2, 100);
  cellSize = min(windowHeight, windowWidth) / GRID_SIZE;
}

// Simulates the game
function draw() {
  if (started) {
    drawMap(GRID_SIZE, GRID_SIZE);
    drawPlants();
    drawUI();
    player.update();
    player.display();
  }
}

// Activates the game code
function startGame() {
  started = true;
  player.wallet = 100;
}

// Creates the map
function createMap() {
  let newMap = [];
  let mapData = [];

  for (let x = 0; x < GRID_SIZE; x++) {
    newMap.push([]);
    mapData.push([]);
    for (let y = 0; y < GRID_SIZE; y++) {
      newMap[x].push([]);
      mapData[x].push([]);
      if (y === 54) {
        newMap[x][y] = color(0);
        mapData[x][y] = -1;
      }
      else if (y > 54 && x % 2 === 0) {
        newMap[x][y] = color(139, 69, 19);
        mapData[x][y] = -2;
      }
      else if (y > 54 && x % 2 === 1) {
        newMap[x][y] = color(159, 89, 39);
        mapData[x][y] = -2;
      }
      else {
        newMap[x][y] = color(random(220, 230));
        mapData[x][y] = -3;
      }
    }
  }
  // for (let i = 0; i < 3; i++) {
  //   stockData.push([]);
  //   stockData[i] = prices[1];
  // }
  maps.greenhouse = newMap;
  maps.data = mapData;
}

// Centers the map
function centerMap() {
  yOffset = constrain((windowHeight - windowWidth) / 2, 0, windowHeight);
  xOffset = constrain((windowWidth - windowHeight) / 2, 0, windowWidth);
}

function mousePressed() {
  // Mouse Pos
  let x = floor((mouseX - xOffset) / cellSize);
  let y = floor((mouseY - yOffset) / cellSize);

  // Plants and collects weeds
  if (maps.data[x][y].growth === 4) {
    player.wallet += prices[maps.data[x][y].state][1];
    maps.data[x][y] = 2;
    inventory[maps.data[x][y].state] = 1; 
    maps.greenhouse[x][y] = color(random(220, 230));
  }
  if (maps.data[x][y] === -3 && player.wallet >= prices[currentPlant][0]) {
    maps.data[x][y] = new Plant(currentPlant, plants[currentPlant]);
    maps.greenhouse[x][y] = color(plants[currentPlant][0]);
    player.wallet -= prices[currentPlant][0];
  }
}

function keyPressed() {
  // Collects Plants
  if (keyCode === 69) {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (maps.data[x][y].growth === 4) {
          inventory[maps.data[x][y].state] += 1;
          maps.data[x][y] = -3;
          maps.greenhouse[x][y] = color(random(220, 230));
        }
      }
    }
  }

  // Sells Plants
  if (keyCode === 81) {
    for (let i = 0; i < inventory.length; i++) {
      for (let j = 0; j < inventory[i]; j++) {
        player.wallet += prices[i][1];
      }
    }
    inventory = [0, 0, 0];
  }

  // Changes Seed
  if (keyCode === 70) {
    currentPlant++;
    switchPlant.play();
  }
  currentPlant = currentPlant % 3;
}

// Loads the map
function drawMap() {
  background(0);
  noStroke();
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      fill(maps.greenhouse[x][y]);
      rect(x * cellSize + xOffset, y * cellSize + yOffset, cellSize, cellSize);
    }
  }
}

// Simulates plant growth
function drawPlants() {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (maps.data[x][y].state >= 0 && random() < 0.05) {
        maps.data[x][y].update();
        maps.greenhouse[x][y] = color(maps.data[x][y].stages[maps.data[x][y].growth]);
      }
    }
  }
}

// Loads the UI
function drawUI() {
  let boxStroke = [color(72, 42, 29), color(66, 95, 6), color(28, 53, 45)];
  let boxFill = [color(220, 170, 112), color(200, 223, 170), color(41, 85, 38)]
  let textStroke = [color(255, 185, 134), color(219, 31, 72), color(81, 123, 50)];
  let textFill = [color(127, 90, 59), color(239, 51, 64), color(111, 153, 64)];
  let char = ["C", "W", "H"];
  let name = ["Coffee Beans", "Watermelon", "Herbs"];
  let desc = ["The seed of a tropical plant of the genus Coffea.", "A succulent fruit and vine-like plant of the gourd family.", "Leafy Greens with culinary, medical, aromatic, or spiritual effects."];

  // Inventory
  stroke(35);
  fill(220);
  rect(0.5 * cellSize, 32.5 * cellSize, xOffset - cellSize, windowHeight - 33 * cellSize);
  for (let i = 0; i < 3; i++) {
    stroke(boxStroke[i]);
    fill(boxFill[i]);
    text(inventory[i], 2 * cellSize, (36 + 3 * i) * cellSize);
  }

  // Money Box
  strokeWeight(cellSize);
  stroke(8, 79, 9);
  fill(62, 156, 39);
  rect(0.5 * cellSize, 0.5 * cellSize, xOffset - cellSize, 5 * cellSize);

  // Plant Box
  stroke(boxStroke[currentPlant]);
  fill(boxFill[currentPlant]);
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
  fill(textStroke[currentPlant]);
  text(char[currentPlant], 1.5 * cellSize, 10.7 * cellSize);
  fill(textFill[currentPlant]);
  text(char[currentPlant], 1.3 * cellSize, 10.5 * cellSize);

  textSize(2.75 * cellSize);
  fill(textStroke[currentPlant]);
  text(name[currentPlant], 6.7 * cellSize, 10.2 * cellSize);
  fill(textFill[currentPlant]);
  text(name[currentPlant], 6.5 * cellSize, 10 * cellSize);

  textSize(2 * cellSize);
  fill(textStroke[currentPlant]);
  text(desc[currentPlant], 1.7 * cellSize, 14.45 * cellSize, xOffset - cellSize);
  fill(textFill[currentPlant]);
  text(desc[currentPlant], 1.5 * cellSize, 14.25 * cellSize, xOffset - cellSize);
}

class Plant {
  constructor(state, stages) {
    this.state = state;
    this.stages = stages;
    this.growth = 0;
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
    this.wallet = 0;
  }

  // Player Movement
  update() {
    if (keyIsDown(68)) {
      this.x += 0.1 * cellSize;
    }
    else if (keyIsDown(65)) {
      this.x -= 0.1 * cellSize;
    }
    else if (keyIsDown(83)) {
      this.y += 0.1 * cellSize;
    }
    else if (keyIsDown(87)) {
      this.y -= 0.1 * cellSize;
    }   
    this.x = constrain(this.x, 1, 63);
    this.y = constrain(this.y, 1, 53);
  }

  // Player Character
  display() {
    fill(0);
    rect((this.x - 0.75) * cellSize + xOffset, (this.y - 0.75) * cellSize + yOffset, cellSize * 1.5, cellSize * 1.5);
    fill(255);
    rect((this.x - 0.5) * cellSize + xOffset, (this.y - 0.5) * cellSize + yOffset, cellSize * 1, cellSize * 1);
  }
}
