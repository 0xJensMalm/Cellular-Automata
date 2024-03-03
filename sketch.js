// Elementary Cellular Automaton in p5.js
/* 
Mutation: 
1% chance of a newly generated cell to mutate into a new color. Adjacent cells have a 20% chance of mutation practically creating a mutation that spreads through the automata. 



*/

class CA {
  constructor() {
    // Pick two random rules at the start
    const [ruleA, ruleB] = pickTwoRandomRules();
    this.ruleA = ruleA;
    this.ruleB = ruleB;
    this.blendFactor = 0; // Start with ruleA
    this.currentRule = this.ruleA; // Start with the first rule
    console.log(`Initial rules: ${ruleA.name}, ${ruleB.name}`);
    this.w = 5 / scale; // Adjust cell width based on scale
    this.cols = width / this.w;
    this.rows = height / this.w;
    this.matrix = [];
    for (let i = 0; i < this.cols; i++) {
      this.matrix[i] = new Array(this.rows).fill(0);
    }
    this.generation = 0;
    this.restart();

    this.mutations = {};
  }

  updateRule() {
    // Interpolate based on blendFactor, for simplicity, switch rule at 0.5
    this.currentRule = this.blendFactor < 0.5 ? this.ruleA : this.ruleB;
  }

  generate() {
    for (let i = 0; i < this.cols; i++) {
      let left =
        this.matrix[(i + this.cols - 1) % this.cols][
          this.generation % this.rows
        ];
      let me = this.matrix[i][this.generation % this.rows];
      let right = this.matrix[(i + 1) % this.cols][this.generation % this.rows];
      this.matrix[i][(this.generation + 1) % this.rows] = this.rules(
        left,
        me,
        right
      );
    }
    this.generation++;

    // Gradually transition between the two rules
    this.blendFactor += 0.01; // Adjust the increment for speed of transition
    if (this.blendFactor >= 1) {
      // Once the transition is complete, reset blendFactor and pick new rules
      this.blendFactor = 0;
      const [newRuleA, newRuleB] = pickTwoRandomRules();
      this.ruleA = newRuleA;
      this.ruleB = newRuleB;
      console.log(
        `Transitioning to New Rules:`,
        Object.keys(rules).find((key) => rules[key] === this.ruleA),
        Object.keys(rules).find((key) => rules[key] === this.ruleB)
      );
    }
    this.updateRule(); // Update the rule based on the new blendFactor

    let newMutations = {}; // Temporary storage for this generation's mutations

    for (let i = 0; i < this.cols; i++) {
      let mutatedRow = (this.generation + 1) % this.rows;
      let baseMutationChance = 0.01; // Base mutation chance
      let adjacentMutationChance = 0.2; // Higher mutation chance if adjacent to a mutated cell

      // Check if any adjacent cells (left or right) in the previous row were mutated
      let hasMutatedNeighbor =
        this.mutations[
          `${(i - 1 + this.cols) % this.cols},${this.generation % this.rows}`
        ] ||
        this.mutations[`${(i + 1) % this.cols},${this.generation % this.rows}`];

      let mutationChance = hasMutatedNeighbor
        ? adjacentMutationChance
        : baseMutationChance;

      if (random(1) < mutationChance) {
        let color = [random(360), 100, 100]; // HSB color with random hue
        newMutations[`${i},${mutatedRow}`] = color; // Store mutation with coordinates as key
      }
    }

    // Merge new mutations into the main mutations object
    this.mutations = { ...this.mutations, ...newMutations };
  }

  restart() {
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        this.matrix[i][j] = 0;
      }
    }
    // Set initial condition in the middle
    this.matrix[Math.floor(this.cols / 2)][0] = 1;
    this.generation = 0;
  }

  display() {
    let offset = this.generation % this.rows;

    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        let cellY = j - offset; // Adjust for generation offset
        if (cellY <= 0) cellY = this.rows + cellY;
        let x = i * this.w;
        let y = (cellY - 1) * this.w; // Adjust y position based on cell width and offset

        let mutationColor = this.mutations[`${i},${j}`];
        if (this.matrix[i][j] === 1 || mutationColor) {
          if (mutationColor) {
            fill(mutationColor); // Use mutated color if present
          } else {
            fill(...themes[currentTheme].cellColor); // Use theme color if no mutation
          }
          noStroke();
          ellipse(x + this.w / 2, y + this.w / 2, this.w); // Draw cells as ellipses
        }
      }
    }
  }

  rules(a, b, c) {
    let s = "" + a + b + c;
    let index = parseInt(s, 2);
    return this.currentRule[index]; // Use the current rule for the CA
  }
}

const themes = {
  dawn: {
    background: [20, 80, 100],
    cellColor: [30, 100, 100], // Example cell color for dawn theme
    stroke: [0, 0, 0, 0], // Transparent stroke
  },
  midnight: {
    background: [230, 80, 20],
    cellColor: [240, 100, 100], // Example cell color for midnight theme
    stroke: [0, 0, 100, 0.5], // Semi-transparent stroke
  },
  twilight: {
    background: [280, 60, 30],
    cellColor: [290, 100, 100], // Example cell color for twilight theme
    stroke: [50, 100, 100, 0.5], // Semi-transparent stroke
  },
  leet: {
    background: [0, 0, 0],
    cellColor: [130, 100, 100], // Example cell color for forest theme
    stroke: [60, 100, 80, 0.5], // Semi-transparent stroke
  },
  // Add more themes as needed
};

const rules = {
  rule110: [0, 1, 1, 0, 1, 1, 1, 0], //GOOD
  rule77: [0, 1, 0, 0, 1, 1, 0, 1], //TJA
  rule225: [0, 1, 1, 1, 1, 1, 1, 1], //fyll
  rule94: [0, 1, 0, 1, 1, 1, 1, 0], //GOOD
  rule102: [0, 1, 1, 0, 0, 1, 1, 0],
  rule90: [0, 1, 0, 1, 1, 0, 1, 0], //GOOD
};

function pickTwoRandomRules() {
  const ruleKeys = Object.keys(rules); // Get all rule keys
  const randomIndex1 = Math.floor(Math.random() * ruleKeys.length);
  let randomIndex2 = Math.floor(Math.random() * ruleKeys.length);
  // Ensure we get two different rules
  while (randomIndex1 === randomIndex2) {
    randomIndex2 = Math.floor(Math.random() * ruleKeys.length);
  }
  return [rules[ruleKeys[randomIndex1]], rules[ruleKeys[randomIndex2]]];
}
let currentTheme = "leet";
let drawSpeed = 60; // Frames per second
let scale = 2; // Default scale is 1

let ca;

function setup() {
  createCanvas(1000, 700);
  colorMode(HSB, 360, 100, 100); // Ensure HSB mode is set for vibrant colors
  frameRate(drawSpeed);
  ca = new CA();
}

CA.prototype.display = function () {
  let offset = this.generation % this.rows;

  for (let i = 0; i < this.cols; i++) {
    for (let j = 0; j < this.rows; j++) {
      let cellY = j - offset;
      if (cellY <= 0) cellY = this.rows + cellY;
      let x = i * this.w;
      let y = (cellY - 1) * this.w;

      if (this.matrix[i][j] === 1) {
        // Use the cellColor from the current theme for fill
        fill(...themes[currentTheme].cellColor);

        // Use the stroke from the current theme, if it's defined with non-zero alpha
        if (themes[currentTheme].stroke[3] > 0) {
          stroke(...themes[currentTheme].stroke);
        } else {
          noStroke(); // No stroke if alpha is 0
        }

        ellipse(x + this.w / 2, y + this.w / 2, this.w); // Draw the cell
      }
    }
  }
};

function draw() {
  if (ca.generation * ca.w >= 650) {
    noLoop(); // Stop the draw loop

    // Frame settings
    let frameWidth = 30; // Width of the frame around the canvas
    let strokeWeightForFrame = 4; // Width of the stroke around the frame
    let innerStrokeWeight = 1; // Width of the inner stroke

    // Draw the frame using the background color of the current theme
    fill(...themes[currentTheme].background);
    noStroke();
    // Top frame
    rect(0, 0, width, frameWidth);
    // Bottom frame
    rect(0, height - frameWidth, width, frameWidth);
    // Left frame
    rect(0, frameWidth, frameWidth, height - 2 * frameWidth);
    // Right frame
    rect(width - frameWidth, frameWidth, frameWidth, height - 2 * frameWidth);

    // Draw a black stroke around the frame
    stroke(0); // Black stroke for the outer edge
    strokeWeight(strokeWeightForFrame);
    noFill();
    rect(
      strokeWeightForFrame / 2,
      strokeWeightForFrame / 2,
      width - strokeWeightForFrame,
      height - strokeWeightForFrame
    );

    // Draw an inner stroke along the inner edge of the frame
    stroke(0); // Black stroke for the inner edge
    strokeWeight(innerStrokeWeight);
    // Inner Top frame
    rect(
      frameWidth - innerStrokeWeight,
      frameWidth - innerStrokeWeight,
      width - 2 * (frameWidth - innerStrokeWeight),
      innerStrokeWeight
    );
    // Inner Bottom frame
    rect(
      frameWidth - innerStrokeWeight,
      height - frameWidth + innerStrokeWeight / 2,
      width - 2 * (frameWidth - innerStrokeWeight),
      innerStrokeWeight
    );
    // Inner Left frame
    rect(
      frameWidth - innerStrokeWeight,
      frameWidth,
      innerStrokeWeight,
      height - 2 * frameWidth
    );
    // Inner Right frame
    rect(
      width - frameWidth + innerStrokeWeight / 2,
      frameWidth,
      innerStrokeWeight,
      height - 2 * frameWidth
    );

    textSize(12); // Adjust text size as needed
    fill(...themes[currentTheme].cellColor); // Set text color to current theme's cell color
    noStroke(); // No stroke around the text

    // Note: Ensure ca.ruleA and ca.ruleB have 'name' properties or adjust accordingly
    let ruleText = `Rule A: ${ca.ruleA}, Rule B: ${ca.ruleB}, Theme: ${currentTheme}, Scale: ${scale}`;

    // Calculate text position
    let textX = 10; // Adjust X position as needed
    let textY = height - frameWidth / 4; // Adjust Y position to be within the bottom frame

    // Draw the text
    textAlign(LEFT, CENTER); // Align text to the left and vertically center
    text(ruleText, textX, textY);
  } else {
    background(...themes[currentTheme].background);
    ca.display();
    ca.generate();
  }
}

function keyPressed() {
  // Check if the 's' key is pressed
  if (key === "s" || key === "S") {
    saveCanvas("myCanvas", "png"); // Saves the canvas as 'myCanvas.png'
  }
}
