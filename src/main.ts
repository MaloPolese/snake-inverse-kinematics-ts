import { Vec, vecAdd, vecClone, vecGetLength, vecSubtract, _vec } from "math2d";
import "./style.css";

export class Slice {
  a!: Vec;
  b: Vec = _vec(0, 0);
  angle: number;
  child: Slice | undefined;
  color = "#FF0000";

  constructor(private len: number, private i: number, public parent?: Slice) {
    if (parent) {
      this.a = vecClone(parent.b);
    }
    this.angle = i;
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

    dir.x = (dir.x * this.len) / vecGetLength(dir);
    dir.y = (dir.y * this.len) / vecGetLength(dir);

    dir.x = dir.x * -1;
    dir.y = dir.y * -1;

    this.a = vecAdd(target, dir);
  }

  draw(g: Graphic) {
    g.drawLine(this.a, this.b, this.color, this.i * 0.2);
  }
}

class Graphic {
  constructor(private ctx: CanvasRenderingContext2D) {}
  drawRect(_x: number, _y: number, _w: number, _h: number, _c: string) {
    this.ctx.fillStyle = _c;
    this.ctx.fillRect(_x, _y, _w, _h);
    this.ctx.fillStyle = "black";
  }

  drawLine(a: Vec, b: Vec, _c: string, w = 2) {
    this.ctx.beginPath();
    this.ctx.moveTo(a.x, a.y);
    this.ctx.lineTo(b.x, b.y);
    this.ctx.strokeStyle = _c;
    this.ctx.lineWidth = w;
    this.ctx.stroke();
    this.ctx.strokeStyle = "black";
  }
}

const WIDTH = 720;
const HEIGHT = 480;
const SLICE_LEN = 10;
const SLEEP = 1;

const SLICE_COUNT = 30;

const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;

const g = new Graphic(ctx);

const draw = (fn: () => void) => {
  setInterval(() => {
    ctx.clearRect(0, 0, w, h);
    fn();
  }, SLEEP);
};

const w = (canvas.width = 720);
const h = (canvas.height = 480);
g.drawRect(0, 0, w, h, "#000");

let current = new Slice(SLICE_LEN, 0);
current.setPosition(WIDTH / 2, HEIGHT / 2);
for (let i = 0; i < SLICE_COUNT; i++) {
  let next = new Slice(SLICE_LEN, i, current);
  current.child = next;
  current = next;
}
current.setColor("#00FF00");
const slice: Slice = current;

let mouseX = WIDTH / 2;
let mouseY = HEIGHT / 2;

draw(() => {
  slice.update();
  slice.draw(g);
  slice.folow(mouseX, mouseY);
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
