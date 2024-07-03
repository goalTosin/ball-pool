function randColor() {
  let colors = [
    "green",
    "blue",
    "red",
    "yellow",
    "purple",
    "pink",
    "gold",
    "cyan",
    "orange",
    "grey",
    "skyblue",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

let ballRadius = 10;
let bigBallRadius = 10;

class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.b = 0.5;
    this.static = false;
    this.color = "blue";
    // this.color = randColor()
  }
  collidesWith(ball) {
    return Math.hypot(this.x - ball.x, this.y - ball.y) < ballRadius * 2;
  }
  respondWithCollision(ball) {
    const angle = Math.atan2(this.y - ball.y, this.x - ball.x);
    const dist =
      (ballRadius * 2 - Math.hypot(this.x - ball.x, this.y - ball.y)) / 2;
    this.x += Math.cos(angle) * dist;
    this.y += Math.sin(angle) * dist;
    this.vx *= 0.99;
    this.vy *= 0.99;
    this.vx += Math.cos(angle) * dist; // / 2;
    this.vy += Math.sin(angle) * dist; // / 2;
    // this.vy -= 0.1
    // ball.vx += (Math.cos(angle) * dist) / 2;
    // ball.vy += (Math.sin(angle) * dist) / 2;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, ballRadius, 0, Math.PI * 2);
    if (this.static) {
      ctx.fillStyle = 'green'
    } else {
      ctx.fillStyle = this.color;
      ctx.fillStyle += "a0";
      }
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.fill();
  }

  fall(gravity) {
    this.vy += gravity;
  }

  velocity() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx = Math.max(-40, Math.min(this.vx, 40));
    this.vy = Math.max(-40, Math.min(this.vy, 40));
  }

  collidesWithWall(w, h) {
    return (
      this.x - ballRadius < 0 ||
      this.x + ballRadius > w ||
      this.y - ballRadius < 0 ||
      this.y + ballRadius > h
    );
  }

  wallResponse(w, h) {
    if (this.x - ballRadius < 0) {
      this.x = ballRadius;
      this.vx *= -this.b;
    }
    if (this.x + ballRadius > w) {
      this.x = w - ballRadius;
      this.vx *= -this.b;
    }
    if (this.y - ballRadius < 0) {
      this.y = ballRadius;
      this.vy *= -this.b;
    }
    if (this.y + ballRadius > h) {
      this.y = h - ballRadius;
      this.vy *= -this.b;
    }
  }

  isPointOn(x, y) {
    return Math.hypot(this.x - x, this.y - y) <= ballRadius;
  }
}

class Pool {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.setup();
  }
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  setup() {
    this.sizeCanvas();
    let nb = Math.floor(this.canvas.width / ballRadius / 2) - 2;
    this.balls = Array.from({ length: nb }, (v, i) => {
      const ball = new Ball(
        i * ballRadius * 2 + this.canvas.width / 2 - nb * ballRadius,
        10
      );
      return ball;
    });
    for (let i = 0; i < 0; i++) {
      for (let j = 0; j < 4; j++) {
        this.balls.push(
          new Ball(
            i * ballRadius * 2 + ballRadius,
            j * ballRadius * 2 + ballRadius
          )
        );
      }
    }
    this.debug = true;
    this.gravity = 0.4;
    this.additionBallCount = 3;
    this.pickedBallI = -1;
    this.pickedBall = null;
    this.canvas.addEventListener("mousemove", this.moveBall.bind(this));
    this.canvas.addEventListener("mouseup", this.dropBall.bind(this));
    this.canvas.addEventListener("mousedown", this.pickOrMakeBall.bind(this));
    addEventListener("resize", this.sizeCanvas.bind(this));
    addEventListener(
      "keydown",
      (() => {
        this.animationId ? this.stopAnimation() : this.draw();
      }).bind(this)
    );
    this.setuped = true;
  }
  set showDeleteArea(v) {
    let cl = document.getElementById("delete-area").classList;
    if (v === true) {
      cl.add("show");
    } else {
      cl.remove("show");
    }
  }
  get showDeleteArea() {
    return document.getElementById("delete-area").classList.contains("show");
  }
  addBall(x, y, ballCount) {
    const startX = -(ballCount * ballRadius * 2) / 2;
    for (let i = 0; i < ballCount; i++) {
      this.balls.push(new Ball(i * ballRadius * 2 + startX + x, y));
    }
  }
  removeBall(i) {
    this.balls.splice(i, 1);
  }
  dropBall(e) {
    if (this.pickedBall) {
      const ex = e.clientX;
      const ey = e.clientY;
      const mouseX = ex - this.canvas.offsetLeft;
      const mouseY = ey - this.canvas.offsetTop;
      this.pickedBall.vx = (mouseX - this.pickedBall.x) * 6;
      this.pickedBall.vy = (mouseY - this.pickedBall.y) * 6;
      this.pickedBall.static = false;
      this.pickedBall = null;
      if (this.showDeleteArea === true) {
        this.showDeleteArea = false;
      }
      if (Math.hypot(this.canvas.width / 2 - mouseX, mouseY) <= 300) {
        this.removeBall(this.pickBallI);
      }
      this.pickBallI = -1;
    }
  }
  pickOrMakeBall(e) {
    const ex = e.clientX;
    const ey = e.clientY;
    const mouseX = ex - this.canvas.offsetLeft;
    const mouseY = ey - this.canvas.offsetTop;
    const pickedBall = this.balls.find((b, i) => {
      if (b.isPointOn(mouseX, mouseY)) {
        this.pickBallI = i;
        return true;
      }
    });
    if (pickedBall) {
      pickedBall.static = true;
      this.pickedBall = pickedBall;
      if (this.showDeleteArea === false) {
        this.showDeleteArea = true;
      }
    } else {
      this.addBall(mouseX, mouseY, this.additionBallCount);
    }
  }
  moveBall(e) {
    if (this.pickedBall) {
      const ex = e.clientX;
      const ey = e.clientY;
      const mouseX = ex - this.canvas.offsetLeft;
      const mouseY = ey - this.canvas.offsetTop;
      this.pickedBall.x = mouseX;
      this.pickedBall.y = mouseY;
    }
  }
  sizeCanvas() {
    this.canvas.height = innerHeight;
    this.canvas.width = innerWidth;
  }
  draw() {
    this.animationId = requestAnimationFrame(this.draw.bind(this));
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.balls.length; i++) {
      const ball = this.balls[i];
      ball.draw(this.ctx);
      if (ball.static) {
        continue;
      }
      if (ball.collidesWithWall(this.canvas.width, this.canvas.height)) {
        // console.log("collides with a wall");
        ball.wallResponse(this.canvas.width, this.canvas.height);
        ball.fall(-this.gravity);
      } //else {
      ball.fall(this.gravity);
      // }
      ball.velocity(this.gravity);
    }
    for (let i = 0; i < this.balls.length; i++) {
      const ball = this.balls[i];
      if (ball.static) {
        continue;
      }
      for (let j = 0; j < this.balls.length; j++) {
        const ball2 = this.balls[j];
        if (ball !== ball2) {
          if (ball.collidesWith(ball2)) {
            ball.respondWithCollision(ball2);
            // this.stopAnimation()
            if (pool.debug) {
              ball.color = "red";
              ball2.color = "red";
              setTimeout(() => {
                ball.color = "blue";
                ball2.color = "blue";
              }, 500);
            }
          }
        }
      }
    }
  }
  stopAnimation() {
    cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }
}

const pool = new Pool(document.querySelector("canvas"));
pool.draw();

const ui = document.querySelector(".ui");
const ballRadiusRange = document.getElementById("ball-size-range");
const gravityRange = document.getElementById("gravity-range");
const additionCountRange = document.getElementById("addition-count-range");
const clearButton = document.getElementById("clear-button");
const touch = document.querySelector(".touch");

ballRadiusRange.addEventListener("input", () => {
  ballRadius = ballRadiusRange.valueAsNumber;
});

gravityRange.addEventListener("input", () => {
  pool.gravity = gravityRange.valueAsNumber;
});

additionCountRange.max = Math.floor(pool.canvas.width / ballRadius / 2) - 2;
additionCountRange.addEventListener("input", () => {
  pool.additionBallCount = additionCountRange.valueAsNumber;
});

clearButton.addEventListener("click", () => {
  if (
    pool.balls.length === 0 ||
    confirm("Are you sure you want to clear all the balls on the screen?")
  ) {
    pool.balls = [];
  }
});

touch.addEventListener("click", () => {
  if (ui.classList.contains("swiped-up")) {
    ui.style.setProperty(`transform`, `translate(0, 0`);
    ui.classList.remove("swiped-up");
  } else {
    let h = touch.offsetHeight + "px";
    ui.style.setProperty(`transform`, `translate(0, calc(${h} + 1em - 100%)`);
    ui.classList.add("swiped-up");
  }
});
