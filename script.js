const canvas = document.getElementById("cnvs");
const ctx = canvas.getContext("2d");
canvas.height = window.innerHeight * (75 / 100);
canvas.width = window.innerWidth * (80 / 100);

// I am converting image into base64 string, so the image is embedded in the js file itself.
const img = new Image();

const image_input = document.querySelector("#image-input");

// reading imgae from user using File Reader
image_input.addEventListener("change", function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    img.src = reader.result;
  });
  reader.readAsDataURL(this.files[0]);
});

// Input Slider for changing no. of cells of the final image.
const inputSlider = document.getElementById("resolutionInput");
const inputLabel = document.getElementById("resolutionLabel");
inputSlider.addEventListener("change", handleSlider);

class Cell {
  constructor(c, r, symbol, color) {
    this.c = c;
    this.r = r;
    this.symbol = symbol;
    this.color = color;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillText(this.symbol, this.c, this.r);
  }
}

// to create ASCII art
class asciiEffect {
  #imageCellArray = [];
  #pixels = [];
  #ctx;
  #width;
  #height;
  #ratio;

  constructor(ctx, width, height, ratio) {
    this.#ctx = ctx;
    this.#height = height;
    this.#width = width;
    this.#ratio = ratio;

    var centerShift_x = (canvas.width - img.width * this.#ratio) / 2;
    var centerShift_y = (canvas.height - img.height * this.#ratio) / 2;
    this.#ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShift_x,
      centerShift_y,
      img.width * this.#ratio,
      img.height * this.#ratio
    );
    this.#pixels = this.#ctx.getImageData(0, 0, this.#width, this.#height);
    console.log(this.#pixels.data);
    console.log(this.#height, this.#width);
  }

  // converts each cell to ascii character based on average colour
  #convertToSymbol(g) {
    if (g > 250) return "@";
    else if (g > 240) return "$";
    else if (g > 220) return "*";
    else if (g > 200) return "+";
    else if (g > 180) return "#";
    else if (g > 160) return "&";
    else if (g > 140) return "%";
    else if (g > 120) return "M";
    else if (g > 100) return "W";
    else if (g > 80) return "0";
    else if (g > 60) return "/";
    else if (g > 40) return "_";
    else if (g > 20) return ":";
    else return "";
  }

  #scanImage(cellSize) {
    this.#imageCellArray = [];

    for (let r = 0; r < this.#pixels.height; r += cellSize) {
      // r -> rows
      for (let c = 0; c < this.#pixels.width; c += cellSize) {
        // c -> columns
        const posX = c * 4;
        const posY = r * 4;
        const posCurrent = posY * this.#pixels.width + posX;

        if (this.#pixels.data[posCurrent + 3] > 128) {
          const red = this.#pixels.data[posCurrent];
          const green = this.#pixels.data[posCurrent + 1];
          const blue = this.#pixels.data[posCurrent + 2];
          const total = red + green + blue;
          const averageColor = total / 3;
          const color = "rgb(" + red + "," + green + "," + blue + ")";
          const symbol = this.#convertToSymbol(averageColor);
          this.#imageCellArray.push(new Cell(c, r, symbol, color));
        }
      }
    }

    console.log(this.#imageCellArray);
  }

  #drawAscii() {
    this.#ctx.clearRect(0, 0, this.#width, this.#height);

    for (let i = 0; i < this.#imageCellArray.length; i++) {
      this.#imageCellArray[i].draw(this.#ctx);
    }
  }

  draw(cellSize) {
    this.#scanImage(cellSize);
    this.#drawAscii();
  }
}

let effect;

function handleSlider() {
  if (inputSlider.value == 1) {
    inputLabel.innerHTML = "Original Image";
    var hRatio = canvas.width / img.width;
    var vRatio = canvas.height / img.height;
    var ratio = Math.min(hRatio, vRatio);
    var centerShift_x = (canvas.width - img.width * ratio) / 2;
    var centerShift_y = (canvas.height - img.height * ratio) / 2;

    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShift_x,
      centerShift_y,
      img.width * ratio,
      img.height * ratio
    );
  } else {
    inputLabel.innerHTML = "Resolution: " + inputSlider.value + " px";
    ctx.font = parseInt(inputSlider.value) * 1.2 + "px Verdena";
    effect.draw(parseInt(inputSlider.value));
  }
}

img.onload = function initialize() {
  var hRatio = canvas.width / img.width;
  var vRatio = canvas.height / img.height;
  var ratio = Math.min(hRatio, vRatio);
  effect = new asciiEffect(ctx, canvas.width, canvas.height, ratio);
  handleSlider();
};