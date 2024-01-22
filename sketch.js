//////////////////////////////////////////////////////////////////////////////////////////////////?
//?
//? Green House Simulator
//? Andrew Chen
//? 11/21/2023 - 1/22/2024
//?
//////////////////////////////////////////////////////////////////////////////////////////////////?
//?
//? Game: An Upstart Gardener takes over his Aunt's store to begin his own produce empire.
//?
//? Instructions: WASD Movement. Mouse Click to plant seeds and harvest plants. Spacebar harvests
//? all plants. Plants cost money, but make back money when they are harvested. Arrow Keys Cycle
//? through different plants.
//?
//////////////////////////////////////////////////////////////////////////////////////////////////?


//* Variables

// Misc
const GRID_SIZE = 64;
let xOffset;
let yOffset;
let cellSize;
let font;
let player;
let start;
let seed = 0;
let tutorialStage = 0;
let timer = 1200;
let stampTime;
let praisePlayer = false;

// Arrays
let inventory = [0, 0, 0];
let prices = [[100, 250], [500, 1000], [2000, 5000]];
let plants = [[[136, 82, 127], [159, 135, 175], [188, 231, 253], [169, 237, 190], [80, 132, 132]], [[54, 60, 60], [65, 193, 241], [52, 110, 129], [152, 251, 152], [27, 131, 102]], [[54, 60, 60], [71, 125, 139], [60, 155, 162], [105, 162, 151], [48, 105, 100]]];
let maps = {
  location: "base",

  base: [],
  txtBase: "",

  shop: [],
  txtShop: "",
};

// Sounds
let menuInteraction;
let bgMusic;


//* Misc

// Load Assets
function preload() {
  font = loadFont("assets/Pixel Font.TTF");
  maps.txtBase = loadStrings("assets/Levels/Greenhouse.txt");
  maps.txtShop = loadStrings("assets/Levels/Store.txt");
  menuInteraction = loadSound("assets/Sounds/menuInteraction.mp3");  
  bgMusic = loadSound("assets/Sounds/bgMusic.mp3");
  bgMusic.loop() = true;
}

// Setup Game
function setup() {
  document.addEventListener("contextmenu", event => event.preventDefault())
  createCanvas(windowWidth, windowHeight);
  background(0);
  textFont(font);

  xOffset = constrain((windowWidth - windowHeight) / 2, 0, windowWidth);
  yOffset = constrain((windowHeight - windowWidth) / 2, 0, windowHeight);
  maps.base = filterTxt(maps.txtBase);
  maps.shop = filterTxt(maps.txtShop);
  cellSize = min(windowHeight, windowWidth) / GRID_SIZE;
  player = new Player(GRID_SIZE / 2, GRID_SIZE / 2, 100);
  bgMusic.play();
  createMap();
}

// Load Game
function startGame() {
  start = true;
  player.wallet = 100;
}

// Run Game
function draw() {
  if (start) {
    drawMap();
    drawUI();

    if (tutorialStage < 11) {
      tutorial();
    }
    if (tutorialStage === 11) {
      tutorialTransition();
      fill(0);
      rect(64.5 * cellSize + xOffset, 0, xOffset - cellSize, 100 * cellSize);
    }

    player.update();
    player.display();
  }
}

// Organize Text
function filterTxt(txt) {
  let key = "a0123456789";
  let newTxt = "";
  for (let i in txt) {
    for (let j in txt[i]) {
      if (key.includes(txt[i][j])) {
        newTxt += txt[i][j];
      }
    }
  }

  return newTxt;
}

// Mouse Functions
function mousePressed() {
  // Mouse Position
  let x = floor((mouseX - xOffset) / cellSize);
  let y = floor((mouseY - yOffset) / cellSize);

  // Planting and Harvesting Crops
  if (mouseButton === LEFT) {
    if (maps.base[x][y].index === 5 && player.wallet >= prices[seed][0]) {
      maps.base[x][y] = new Plant(seed);
      player.wallet -= prices[seed][0];
    }
    if (maps.base[x][y].index === 3) {
      if (maps.base[x][y].growth === 4) {
        inventory[maps.base[x][y].state] += 1;
        maps.base[x][y] = new Grid(5, x, y);
      }
    }
  }

  // Placing and Destroying Pots
  if (mouseButton === RIGHT) {
    let newPot = [[x - 1, y], [x, y - 1], [x + 1, y], [x, y + 1], [x - 1, y - 1], [x - 1, y + 1], [x + 1, y - 1], [x + 1, y + 1], [x, y]];
    let placePot = true; 

    // Destroy Pot
    if (maps.base[x][y].index === 5) {
      let checkPot = 0;
      for (let i = 0; i < newPot.length; i++) {
        if (maps.base[newPot[i][0]][newPot[i][1]].index === 4) {
          checkPot++;
        }
      }
      if (checkPot === 8) {
        for (let i = 0; i < newPot.length; i++) {
          maps.base[newPot[i][0]][newPot[i][1]] = new Grid(1, newPot[i][0], newPot[i][1]);
        }
      }
      // Tutorial Pot Destroying Check
      if (tutorialStage === 9) {
        tutorialTransition();
      }
    }
    // Place Pot
    else {
      for (let i = 0; i < newPot.length; i++) {
        if (maps.base[newPot[i][0]][newPot[i][1]].index === 4 || maps.base[newPot[i][0]][newPot[i][1]].index === 2) {
          placePot = false;
        }
      }
      if (placePot === true) {
        for (let i = 0; i < newPot.length - 1; i++) {
          maps.base[newPot[i][0]][newPot[i][1]].index = 4;
        }
        maps.base[x][y].index = 5;
      }
    }
    // Tutorial Pot Placing Check
    if (tutorialStage === 8) {
      tutorialTransition();
    }
  }
}

// Keyboard Functions
function keyPressed() {
  // Harvest Plants
  if (keyCode === 69 && maps.location === "base") {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (maps.base[x][y].growth === 4) {
          inventory[maps.base[x][y].state] += 1;
          maps.base[x][y] = new Grid(5, x, y);
        }
      }
    }
  }

  // Sell Plants
  if (keyCode === 81 && player.canSell) {
    for (let i = 0; i < inventory.length; i++) {
      menuInteraction.play();
      for (let j = 0; j < inventory[i]; j++) {
        player.wallet += prices[i][1];
      }
    }
    inventory = [0, 0, 0];
  }

  // Changes Seed
  if (keyCode === 70) {
    seed++;
    seed %= 3;
    menuInteraction.play();
  }
}

// Tutorial
function tutorial() {
  stroke(0);
  fill(255);
  rect(64.5 * cellSize + xOffset, 11.5 * cellSize, xOffset - cellSize, 20 * cellSize);
  noStroke();
  text("Tutorial", 64.5 * cellSize + xOffset, 11.5 * cellSize);
  fill(0);
  textSize(1.5 * cellSize);
  if (praisePlayer === true) {
    fill(0, 255, 0);
    if (tutorialStage === 10) {
      text("Now you know everything there is to know about the game. The tutorial will disappear shortly...", 65.5 * cellSize + xOffset, 14 * cellSize, xOffset - 1.5 * cellSize);
      timer = 5000;
    }
    else {
      text("Good!", 65.5 * cellSize + xOffset, 14 * cellSize);
    }
    if (timer < millis() - stampTime) {
      praisePlayer = false;
    }
  }
  else {
    if (tutorialStage === 0) {
      text("WASD to Move", 65.5 * cellSize + xOffset, 14 * cellSize);
      if (keyCode === 87 || keyCode === 65 || keyCode === 83 || keyCode === 68) {
        tutorialTransition()
      }
    }
    else if (tutorialStage === 1) {
      text("Now, you see that pot in the bottom left? Click on the dirt within it to plant a crop", 65.5 * cellSize + xOffset, 14 * cellSize, xOffset - 1.5 * cellSize);
      if (player.wallet === 0) {
        tutorialTransition()
      }
    }
    else if (tutorialStage === 2) {
      text("The plant has grown now. Click on it to harvest the crop.", 65.5 * cellSize + xOffset, 14 * cellSize, xOffset - 1.5 * cellSize);
      if (inventory[0] === 1) {
        tutorialTransition()
      }
    }
    else if (tutorialStage === 3) {
      text("Now that we harvested the crop, your inventory has filled up a little. Go through the door at the bottom to enter the shop.", 65.5 * cellSize + xOffset, 14 * cellSize, xOffset - 1.5 * cellSize);
      if (maps.location === "shop") {
        tutorialTransition()
      }
    }
    else if (tutorialStage === 4) {
      text("On the left is the shipping tube. Standing on the red square allows you to sell your goods for money. Go over to it and press Q to sell your crops.", 65.5 * cellSize + xOffset, 14 * cellSize, xOffset - 1.5 * cellSize);
      if (inventory[0] === 0) {
        tutorialTransition()
      }
    }
    else if (tutorialStage === 5) {
      text("The conveyer will ship your goods to a market later on. Anyhow, now that you have some money to spend. Let's go back and plant two seeds this time.", 65.5 * cellSize + xOffset, 14 * cellSize, xOffset - 1.5 * cellSize);
      if (player.wallet === 50) {
        tutorialTransition()
      }
    }
    else if (tutorialStage === 6) {
      text("Instead of manually clicking on plants to harvest them, press E to auto harvest all plants.", 65.5 * cellSize + xOffset, 14 * cellSize, xOffset - 1.5 * cellSize);
      if (inventory[0] === 2) {
        tutorialTransition()
      }
    }
    else if (tutorialStage === 7) {
      text("Now you're broke again. Return to the shop to sell your goods. To switch seeds, press F to cycle through your crops. Using your new money, grow and harvest a watermelon.", 65.5 * cellSize + xOffset, 14 * cellSize, xOffset - 1.5 * cellSize);
      if (inventory[1] >= 1) {
        tutorialTransition()
      }
    }
    else if (tutorialStage === 8) {
      text("Ever noticed that the dirt in your warehouse seems kind of little? Right click in an empty area to plant a pot.", 65.5 * cellSize + xOffset, 14 * cellSize, xOffset - 1.5 * cellSize);
    }
    else if (tutorialStage === 9) {
      text("Pots can give you extra dirt to grow plants. By Right clicking the dirt in a pot, you can delete them. Go ahead and do that.", 65.5 * cellSize + xOffset, 14 * cellSize, xOffset - 1.5 * cellSize);
    }
  }
}

function tutorialTransition() {
  praisePlayer = true;
  stampTime = millis();
}

//* Display

// Generate Map
function createMap() {
  let baseMap = [];
  let shopMap = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    baseMap.push([]);
    shopMap.push([]);
    for (let y = 0; y < GRID_SIZE; y++) {
      index = GRID_SIZE * y + x;
      baseMap[x].push([]);
      shopMap[x].push([]);

      baseMap[x][y] = new Grid(floor(maps.base[index]), x, y);
      shopMap[x][y] = new Grid(floor(maps.shop[index]), x, y);
    }
  }

  maps.base = baseMap;
  maps.shop = shopMap;
}

// Display Map
function drawMap() {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (maps.location === "base") {
        // Plant Growth
        if (maps.base[x][y].growth < 4 && random() < 10 / prices[maps.base[x][y].state][0]) {
          maps.base[x][y].grow();
        }

        maps.base[x][y].display();
      }
      if (maps.location === "shop") {
        maps.shop[x][y].display(); 
      }
      rect(x * cellSize + xOffset, y * cellSize + yOffset, cellSize, cellSize);
    }
  }
}

// Display User Interface
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
  textSize(2 * cellSize);
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
  stroke(boxStroke[seed]);
  fill(boxFill[seed]);
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
  fill(textStroke[seed]);
  text(char[seed], 1.5 * cellSize, 10.7 * cellSize);
  fill(textFill[seed]);
  text(char[seed], 1.3 * cellSize, 10.5 * cellSize);

  textSize(2.75 * cellSize);
  fill(textStroke[seed]);
  text(name[seed], 6.7 * cellSize, 10.2 * cellSize);
  fill(textFill[seed]);
  text(name[seed], 6.5 * cellSize, 10 * cellSize);

  textSize(2 * cellSize);
  fill(textStroke[seed]);
  text(desc[seed], 1.7 * cellSize, 14.45 * cellSize, xOffset - cellSize);
  text("Cost: " + prices[seed][0], 1.7 * cellSize, 28.25 * cellSize);
  text("Yield: " + prices[seed][1], 1.7 * cellSize, 30.25 * cellSize);
  fill(textFill[seed]);
  text(desc[seed], 1.5 * cellSize, 14.25 * cellSize, xOffset - cellSize);
  text("Cost: " + prices[seed][0], 1.5 * cellSize, 28 * cellSize);
  text("Yield: " + prices[seed][1], 1.5 * cellSize, 30 * cellSize);
}


//* Classes

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.wallet = 0;
    let canSell = false;
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
      if (maps.location === "base" && this.y > 62 && this.x > 29 && this.x < 34) {
        maps.location = "shop";
        this.y = 1;
      }
    }
    else if (keyIsDown(87)) {
      this.y -= 1;
      if (maps.location === "shop" && this.y < 2 && this.x > 29 && this.x < 34) {
        maps.location = "base";
        this.y = 63;
      }
    }

    // Collision
    if (maps.location === "base") {
      this.x = constrain(this.x, 2, 62);
      this.y = constrain(this.y, 2, 62);
    }
    if (maps.location === "shop") {
      this.x = constrain(this.x, 6, 62);
      this.y = constrain(this.y, 2, 62);
      this.canSell = maps.shop[this.x][this.y].index === 9;
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

class Grid {
  constructor(index, x, y) {
    this.index = index;
    this.x = x;
    this.y = y;
  }

  display() {
    // Door
    if (this.index === 0) {
      fill(120, 168, 134);
    }
    // Floor
    if (this.index === 1) {
      if (maps.location === "shop") {
        if (this.x % 2 === 0) {
          fill(color(139, 69, 19));
        }
        else {
          fill(color(159, 89, 39));
        }
      }
      else {
        fill(211, 212, 218);
      }
    }
    // Wall
    if (this.index === 2) {
      fill(0);
    }
    // Pot
    if (this.index === 4) {
      fill(252, 92, 71);
    }
    // Dirt
    if (this.index === 5) {
      fill(117, 83, 66);
    }
    // Machine
    if (this.index === 6) {
      fill(122, 120, 114);
    }
    // Conveyer
    if (this.index === 7) {
      fill(193, 190, 184);
    }
    // Conveyer Border
    if (this.index === 8) {
      fill(29, 26, 31);
    }
    // Sell
    if (this.index === 9) {
      fill(218, 11, 10);
    }
  }
}

class Plant {
  constructor(state) {
    this.index = 3;
    this.growth = 0;
    this.state = state;
  }

  display() {
    fill(plants[this.state][this.growth]);
  }

  grow() {
    this.growth++;
  }
}