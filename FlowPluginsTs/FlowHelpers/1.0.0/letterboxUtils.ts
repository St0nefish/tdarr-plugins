class CropInfo {
  // width
  w: number = 0;

  // height
  h: number = 0;

  // x offset
  x: number = 0;

  // y offset
  y: number = 0;

  // constructor
  constructor(w: number, h: number = 0, x: number = 0, y: number = 0) {
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
  }

  // toString
  toString = () => `${this.w}:${this.h}:${this.x}:${this.y}`;
}
