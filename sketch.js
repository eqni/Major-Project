//////////////////////////////////////////////////////////////////////////////////////////////////
// Grene Horeh
// Andrew Chen
// 11/21/2023
//
//////////////////////////////////////////////////////////////////////////////////////////////////
// Game: An Upstart Gardener, Grene, takes over his Aunt's store to begin his own produce empire!
//
// Instructions: WASD Movement. Mouse Click to plant seeds and harvest plants. Spacebar harvests
// all plants. Plants cost money, but make back money when they are harvested. Arrow Keys Cycle
// through different plants.
//////////////////////////////////////////////////////////////////////////////////////////////////


// Variables
const GRID_SIZE = 64;
let xOffset;
let yOffset;
let cellSize;
let font;
let prices = [[100, 250], [500, 1000], [2000, 5000]];
let plants = [[[136, 82, 127], [159, 135, 175], [188, 231, 253], [169, 237, 190], [80, 132, 132]], [[54, 60, 60], [65, 193, 241], [52, 110, 129], [152, 251, 152], [27, 131, 102]], [[54, 60, 60], [71, 125, 139], [60, 155, 162], [105, 162, 151], [48, 105, 100]]];
let inventory = [0, 0, 0];
let pots = [];
let selectedSeed = 0;
let player;
let start = false;
let area = "base";
let maps = {
  base: [],
  shop: [],
  data: [],
};

// Sounds
let sounds = new Map();
let switchPlant;


function preload() {
  font = loadFont("assets/Pixel Font.TTF");
  switchPlant = loadSound("sounds/switch plant.mp3")
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  background(0);
  createMap();
  yOffset = constrain((windowHeight - windowWidth) / 2, 0, windowHeight);
  xOffset = constrain((windowWidth - windowHeight) / 2, 0, windowWidth);
  cellSize = min(windowHeight, windowWidth) / GRID_SIZE;

  player = new Player(GRID_SIZE / 2, GRID_SIZE / 2, 100);
  document.addEventListener("contextmenu", event => event.preventDefault())
}

function draw() {
  if (start) {
    drawMap();
    drawPlants();
    drawUI();
    player.update();
    player.display();
  }
}

function startGame() {
  start = true;
  player.wallet = 100;
}

function createMap() {
  let baseMap = [];
  let shopMap = [];
  let mapData = [];

  // Generates Both Game Maps + Data
  for (let x = 0; x < GRID_SIZE; x++) {
    baseMap.push([]);
    shopMap.push([]);
    mapData.push([]);
    for (let y = 0; y < GRID_SIZE; y++) {
      baseMap[x].push([]);
      shopMap[x].push([]);
      mapData[x].push([]);

      // Base Map
      if (y === 63 && x < 35 && x > 28) {
        baseMap[x][y] = color(120, 168, 134);
      }
      else if (y === 63) {
        baseMap[x][y] = color(0);
        mapData[x][y] = -1;
      }
      else {
        baseMap[x][y] = color(random(220, 230));
        mapData[x][y] = -3;
      }

      // Shop Map
      if (y === 0 && x < 35 && x > 28) {
        shopMap[x][y] = color(120, 168, 134);
      }
      else if (y === 0) {
        shopMap[x][y] = color(0);
      }
      else if (x % 2 === 0) {
        shopMap[x][y] = color(139, 69, 19);
      }
      else if (x % 2 === 1) {
        shopMap[x][y] = color(159, 89, 39);
      }
      if (y === 56) {
        shopMap[x][y] = color(0);
        mapData[x][y] = -1
      }
      if (y === 60 && x % 8 < 3) {
        shopMap[x][y] = color(random(245, 255), random(220, 240), random(0, 25));
      }
      else if (y === 57 || y === 63) {
        shopMap[x][y] = color(random(35, 50));
      }
      else if (y > 57) {
        shopMap[x][y] = color(random(95, 115));
      }
      if (y > 0 && y < 7 && x < 6) {
        shopMap[x][y] = color(45, 186, 143);
      }
    }
  }

  maps.base = baseMap;
  maps.shop = shopMap;
  maps.data = mapData;
}

function mousePressed() {
  // Mouse Position
  let x = floor((mouseX - xOffset) / cellSize);
  let y = floor((mouseY - yOffset) / cellSize);


  // Collects & Plants Seeds
  if (mouseButton === LEFT) {
    if (maps.data[x][y].growth === 4) {
      inventory[maps.data[x][y].state] += 1;
      maps.data[x][y] = -3;
      maps.base[x][y] = color(random(220, 230));
    }
    else if (maps.data[x][y] === -3 && player.wallet >= prices[selectedSeed][0]) {
      maps.data[x][y] = new Plant(selectedSeed, plants[selectedSeed]);
      maps.base[x][y] = color(plants[selectedSeed][0]);
      player.wallet -= prices[selectedSeed][0];
    }
  }

  // Places Pot
  if (mouseButton === RIGHT) {
    let checkPot = [(x - 1, y), (x, y - 1), (x + 1, y), (x, y + 1)];
    if (!pots.some(r=> checkPot.includes(r))) {
      for (let i = 0; i < 4; i++) {
        pots.push(checkPot[i]);
        //maps.baseMap[checkPot[i][0]][checkPot[i][1]] = color(252, 92, 71);
        console.log(checkPot[i][0], checkPot[i][1]);
      }
      console.log(true);
      console.log(x - 1, y);
    }
    else {
      console.log(false);
    }

    // if (!checkPot.some(r=> pots.includes(r))) {
    //   maps.baseMap[x - 1][y] = color(252, 92, 71);
    //   maps.baseMap[x][y - 1] = color(252, 92, 71);
    //   maps.baseMap[x + 1][y] = color(252, 92, 71);
    //   maps.baseMap[x][y + 1] = color(252, 92, 71);
    //   maps.data[x - 1][y] = -2;
    //   maps.data[x][y - 1] = -2;
    //   maps.data[x + 1][y] = -2;
    //   maps.data[x][y + 1] = -2;
    // }
  }

}

function keyPressed() {
  // Collects Plants
  if (keyCode === 69 && area === "base") {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (maps.data[x][y].growth === 4) {
          inventory[maps.data[x][y].state] += 1;
          maps.data[x][y] = -3;
          maps.base[x][y] = color(random(220, 230));
        }
      }
    }
  }

  // Sells Plants
  if (keyCode === 81 && area === "shop" && player.y < 7 && player.x < 6) {
    for (let i = 0; i < inventory.length; i++) {
      for (let j = 0; j < inventory[i]; j++) {
        player.wallet += prices[i][1];
      }
    }
    inventory = [0, 0, 0];
  }

  // Changes Seed
  if (keyCode === 70) {
    selectedSeed++;
    switchPlant.play();
  }
  selectedSeed = selectedSeed % 3;
}

function drawMap() {
  // Draw Map
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (area === "base") {
        fill(maps.base[x][y]);
      }
      if (area === "shop") {
        fill(maps.shop[x][y]);
      }
      rect(x * cellSize + xOffset, y * cellSize + yOffset, cellSize, cellSize);
    }
  }
}

function drawPlants() {
  // Plant Growth
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (maps.data[x][y].state >= 0 && random() < 1 / prices[maps.data[x][y].state][0] * (maps.data[x][y].state + 1)) {
        maps.data[x][y].update();
        maps.base[x][y] = color(maps.data[x][y].stages[maps.data[x][y].growth]);
      }
    }
  }
}

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
  stroke(boxStroke[selectedSeed]);
  fill(boxFill[selectedSeed]);
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
  fill(textStroke[selectedSeed]);
  text(char[selectedSeed], 1.5 * cellSize, 10.7 * cellSize);
  fill(textFill[selectedSeed]);
  text(char[selectedSeed], 1.3 * cellSize, 10.5 * cellSize);

  textSize(2.75 * cellSize);
  fill(textStroke[selectedSeed]);
  text(name[selectedSeed], 6.7 * cellSize, 10.2 * cellSize);
  fill(textFill[selectedSeed]);
  text(name[selectedSeed], 6.5 * cellSize, 10 * cellSize);

  textSize(2 * cellSize);
  fill(textStroke[selectedSeed]);
  text(desc[selectedSeed], 1.7 * cellSize, 14.45 * cellSize, xOffset - cellSize);
  fill(textFill[selectedSeed]);
  text(desc[selectedSeed], 1.5 * cellSize, 14.25 * cellSize, xOffset - cellSize);
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
      this.x += 1;  
    }
    else if (keyIsDown(65)) {
      this.x -= 1;
    }
    else if (keyIsDown(83)) {
      this.y += 1;
      if (area === "base" && this.y > 62 && this.x > 29 && this.x < 34) {
        area = "shop";
        this.y = 1;
      }
    }
    else if (keyIsDown(87)) {
      this.y -= 1;
      if (area === "shop" && this.y < 2 && this.x > 29 && this.x < 34) {
        area = "base";
        this.y = 63;
      }
    }

    // Collision
    if (area === "base") {
      this.x = constrain(this.x, 1, 63);
      this.y = constrain(this.y, 1, 62);
    }
    if (area === "shop") {
      this.x = constrain(this.x, 1, 63);
      this.y = constrain(this.y, 2, 55);
    }
  }

  // Player Character
  display() {
    fill(0);
    rect((this.x - 0.75) * cellSize + xOffset, (this.y - 0.75) * cellSize + yOffset, cellSize * 1.5, cellSize * 1.5);
    fill(255);
    rect((this.x - 0.5) * cellSize + xOffset, (this.y - 0.5) * cellSize + yOffset, cellSize * 1, cellSize * 1);
  }
}

class Pot {
  constructor() {
    this.hp = 3;
  }

  used() {
    this.hp--;
  }
}
