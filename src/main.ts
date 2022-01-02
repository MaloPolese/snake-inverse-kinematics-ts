import { Vec, vecAdd, vecClone, vecSubtract, _vec } from "math2d";
import "./style.css";

export class Slice {
  a!: Vec;
  b: Vec = _vec(0, 0);
  sw!: number;
  angle: number;
  child: Slice | undefined;
  color = "#FFC5AC";

  constructor(private len: number, i: number, public parent?: Slice) {
    if (parent) {
      this.a = vecClone(parent.b);
    }
    this.sw = this.map(i, 0, SLICE_COUNT, 4, 25);
    this.angle = 0;
  }

  private map(
    n: number,
    start1: number,
    stop1: number,
    start2: number,
    stop2: number
  ) {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  }

  setPosition(x: number, y: number) {
    this.a = _vec(x, y);
    this.update();
  }

  setColor(_c: string) {
    this.color = _c;
  }

  update() {
    const dx = this.len * Math.cos(this.angle);
    const dy = this.len * Math.sin(this.angle);

    this.b.x = this.a.x + dx;
    this.b.y = this.a.y + dy;
  }

  folow(tx: number, ty: number) {
    const target = _vec(tx, ty);

    const dir = vecSubtract(target, this.a);

    this.angle = Math.atan2(dir.y, dir.x);

    const mag = Math.sqrt(dir.x * dir.x + dir.y * dir.y);

    dir.x = (dir.x * this.len) / mag;
    dir.y = (dir.y * this.len) / mag;

    dir.x = dir.x * -1;
    dir.y = dir.y * -1;

    this.a = vecAdd(target, dir);
  }

  draw(g: Graphic) {
    g.drawLine(this.a, this.b, this.color, this.sw);
  }
}

class Graphic {
  constructor(private ctx: CanvasRenderingContext2D) {}
  drawRect(_x: number, _y: number, _w: number, _h: number, _c: string) {
    this.ctx.fillStyle = _c;
    this.ctx.fillRect(_x, _y, _w, _h);
    this.ctx.fillStyle = "black";
  }

  drawLine(
    a: Vec,
    b: Vec,
    _c: string,
    w = 2,
    lineCap: CanvasLineCap = "round"
  ) {
    this.ctx.beginPath();
    this.ctx.moveTo(a.x, a.y);
    this.ctx.lineTo(b.x, b.y);
    this.ctx.strokeStyle = _c;
    this.ctx.lineWidth = w;
    this.ctx.lineCap = lineCap;
    this.ctx.stroke();
    this.ctx.strokeStyle = "black";
  }
}

const SCALE = 1.5;
const WIDTH = 720 * SCALE;
const HEIGHT = 480 * SCALE;
const SLICE_LEN = 25;
const SLEEP = 1;

const SLICE_COUNT = 20;

const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;

const g = new Graphic(ctx);

const draw = (fn: () => void) => {
  setInterval(() => {
    ctx.clearRect(0, 0, w, h);
    fn();
  }, SLEEP);
};

const w = (canvas.width = WIDTH);
const h = (canvas.height = HEIGHT);
g.drawRect(0, 0, w, h, "#000");

let current = new Slice(SLICE_LEN, 0);
current.setPosition(WIDTH / 2, HEIGHT / 2);
for (let i = 0; i < SLICE_COUNT; i++) {
  let next = new Slice(SLICE_LEN, i, current);
  current.child = next;
  current = next;
}
current.setColor("#FFF");
const slice: Slice = current;

let mouseX = WIDTH / 2;
let mouseY = HEIGHT / 2;

draw(() => {
  slice.folow(mouseX, mouseY);
  slice.update();
  slice.draw(g);
  let next = slice.parent;
  while (next) {
    next.folow(next.child?.a.x!, next.child?.a.y!);
    next.update();
    next.draw(g);
    next = next.parent;
  }
});

const mouseMove = (e: MouseEvent) => {
  mouseX = e.offsetX;
  mouseY = e.offsetY;
};
canvas.addEventListener("mousemove", mouseMove);
