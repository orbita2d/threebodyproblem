
let time_passed = 0;
/**
 * @type {GravityField}
 */
let field;
let particle;

/**
 * @type {MassiveBody[]}
 */
let bodies = [];

function setup() {
  const size = 640;
  createCanvas(size, size);
  background(0);
  loop();
  bodies.push(new MassiveBody(1, new Vec2(-.2, 0)));
  bodies.push(new MassiveBody(1, new Vec2(.2, 0)))
  field = new GravityField(bodies, 16, 16);

  particle = new InertialFlowParticle(new Vec2(0, .3))
  particle.velocity = new Vec2(2, 0)
  //particle.loadLog(field, 10, 1E-4)
}

function draw() {
  clear()
  background(0);
  time_passed += deltaTime;
  field.pretty(width, height, 16, 16);
  let a = 0.35;
  for (let i = 0; i < bodies.length; i++) {
    bodies[i].origin.x = a * Math.cos(2 * Math.PI * (time_passed / 30000 + i / bodies.length))
    bodies[i].origin.y = a * Math.sin(2 * Math.PI * (time_passed / 30000 + i / bodies.length))
    bodies[i].draw(width, height);
  }
  //particle.draw(width, height);

  //field.calculate()
  //particle.update(field, deltaTime / 5000, 1E-4)
}

class MassiveBody {
  constructor(mass, position) {
    this.origin = position;
    this.mass = mass;
    this.fill = color(0);
    this.stroke = color(255);
  }

  draw(w, h) {
    strokeWeight(3);
    stroke(this.stroke);
    fill(this.fill);
    circle(normalise(this.origin.x, -1, 1) * w, normalise(this.origin.y, -1, 1) * h, this.mass * 50)
  }
}

class GravityField extends VectorField {
  /**
   * 
   * @param {MassiveBody[]} bodies 
   * @param {number} width 
   * @param {number} height 
   */
  constructor(bodies, width, height) {
    super(width, height);
    this.initialise();
    this.bodies = bodies;

    // Set coordinate range to [-2, 2]
    this.overshoot = 1.05;

    this.calculate();

    this.pretty_stroke = color(255);
    this.pretty_stroke_weight = 1.4;
    this.pretty_segments = 6;
    this.pretty_duty_segments = 4;
    this.pretty_delta = 0.005;
    this.pretty_count = 128;
  }

  calculate() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        let g = new Vec2(0, 0);
        for (let i = 0; i < this.bodies.length; i++) {
          let body = this.bodies[i];
          // Coordinate system has origin in the center.
          let xr = ((x + .5) / this.width) * (2 * this.overshoot) - this.overshoot;
          let yr = ((y + .5) / this.height) * (2 * this.overshoot) - this.overshoot;
          let r = new Vec2(xr - body.origin.x, yr - body.origin.y);
          let dist = r.norm();
          r.normalise();
          let magnitude = body.mass / (dist * dist);
          g.increment(r.times(-magnitude));
        }
        this.data[x][y] = g;
      }
    }
  }

  draw(w, h, wt, ht) {
    if (wt == undefined) { wt = 8 };
    if (ht == undefined) { ht = 8 };

    for (let x = 0; x < wt; x++) {
      for (let y = 0; y < ht; y++) {
        let xr = (x + .5) / wt * 2 - 1;
        let yr = (y + .5) / ht * 2 - 1;
        if (xr > -1 && xr < 1 && yr > -1 && yr < 1) {
          let xpx = (xr + 1) / 2 * w;
          let ypx = (yr + 1) / 2 * h;
          drawVector(xpx, ypx, this.get(xr, yr), 1)
        }
      }
    }
  }

  pretty(w, h, wt, ht) {
    if (wt == undefined) { wt = 8 };
    if (ht == undefined) { ht = 8 };
    strokeWeight(this.pretty_stroke_weight);
    stroke(this.pretty_stroke);
    for (let x = 0; x < wt; x++) {
      let xr = (x + .5) / wt * 2 - 1;
      let yr = -1;
      this.prettyLine(xr, yr, w, h);
    }
    for (let x = 0; x < wt; x++) {
      let xr = (x + .5) / wt * 2 - 1;
      let yr = 1;
      this.prettyLine(xr, yr, w, h);
    }
    for (let x = 0; x < ht; x++) {
      let yr = (x + .5) / wt * 2 - 1;
      let xr = -1;
      this.prettyLine(xr, yr, w, h);
    }
    for (let x = 0; x < ht; x++) {
      let yr = (x + .5) / wt * 2 - 1;
      let xr = 1;
      this.prettyLine(xr, yr, w, h);
    }
  }

  prettyLine(x, y, w, h) {
    let count = this.pretty_count;
    let a = this.pretty_segments;
    let b = this.pretty_duty_segments;
    let last = new Vec2(x, y);
    for (let i = 0; i < count; i++) {
      let flow = this.get(last.x, last.y);
      if (flow.norm() > 8) {
        flow = flow.times(8 / flow.norm())
      }
      if (flow.norm() > 1E4) {
        break;
      }
      let r = last.add(flow.times(this.pretty_delta));
      if (i % a < b) {
        line((last.x + 1) * w / 2, (last.y + 1) * h / 2, (r.x + 1) * w / 2, (r.y + 1) * h / 2);
      }
      last = r;
    }
  }

  get(x, y) {
    let g = new Vec2(0, 0);
    for (let i = 0; i < this.bodies.length; i++) {
      let body = this.bodies[i];
      // Coordinate system has origin in the center.
      let r = new Vec2(x - body.origin.x, y - body.origin.y);
      let dist = r.norm();
      r.normalise();
      let magnitude = body.mass / (dist * dist);
      g.increment(r.times(-magnitude));
    }
    return g;
  }
}

class InertialFlowParticle {
  constructor(origin) {
    this.position = origin;
    this.history = 1000;
    this.log = [origin];
    this.velocity = new Vec2(0, 0);
    this.colour = [color(240, 0, 60), color(0, 0, 0)];
    this.circle_size = 0;
  }

  /**
   * 
   * @param {GravityField} flow 
   * @param {number} dt 
   */
  update(flow, dt, target) {
    let n = Math.floor(dt / target) + 1;
    for (let i = 0; i < n; i++) {
      let acceleration = flow.get(this.position.x, this.position.y);
      let maxg = 1E9;
      if (acceleration.norm() > maxg) {
        acceleration = acceleration.times(maxg / acceleration.norm());
      }
      this.velocity.increment(acceleration.times(target));
      this.position.increment(this.velocity.times(target));
      if (this.position.x > 1) {
        //this.position.x = (this.position.x + 1) % 2 - 1;
        this.velocity.x = -this.velocity.x;
        //this.velocity.normalise()
      }
      if (this.position.y > 1) {
        this.velocity.y = -this.velocity.y;
      }
      if (this.position.x < -1) {
        this.velocity.x = -this.velocity.x;
      }
      if (this.position.y < -1) {
        this.velocity.y = -this.velocity.y;
      }
    }
    this.log.unshift(this.position.copy())
    if (this.log.length > this.history) {
      this.log.pop()
    }
  }

  loadLog(flow, delta, target) {
    let dt = delta / this.history;
    for (let i = 0; i < this.history; i++) {
      this.update(flow, dt, target)
    }
  }

  draw(w, h) {
    let x = normalise(this.position.x, -1, 1) * w;
    let y = normalise(this.position.y, -1, 1) * h;
    let colour = this.colour[0];
    strokeWeight(0);
    fill(colour);
    circle(x, y, this.circle_size)
    for (let i = this.log.length - 3; i > 1; i--) {
      let x0 = normalise(this.log[i + 2].x, -1, 1) * w;
      let y0 = normalise(this.log[i + 2].y, -1, 1) * h;
      let x1 = normalise(this.log[i + 1].x, -1, 1) * w;
      let y1 = normalise(this.log[i + 1].y, -1, 1) * h;
      let x2 = normalise(this.log[i + 0].x, -1, 1) * w;
      let y2 = normalise(this.log[i + 0].y, -1, 1) * h;
      let x3 = normalise(this.log[i - 1].x, -1, 1) * w;
      let y3 = normalise(this.log[i - 1].y, -1, 1) * h;
      colour = colourmap(this.colour, i / this.log.length);
      strokeWeight(4);
      stroke(colour)
      curve(x0, y0, x1, y1, x2, y2, x3, y3)
    }
  }
}

/**
 * Draw a vector v at coordinate x, y
 * @param {number} x x coordinate
 * @param {number} y y coordinate
 * @param {Vec2} v Vector to draw
 * @param {number} scale
 */
function drawVector(x, y, v, scale) {
  if (!scale) {
    scale = 1;
  }
  let magnitude = Math.min(v.norm() * scale, 16)
  let vec = v.times(magnitude / v.norm());
  push();
  stroke(255);
  fill(255)
  strokeWeight(2)
  line(x, y, x + vec.x, y + vec.y); //draw a line beetween the vertices
  let offset = 5 * vec.norm() / 10;
  var angle = atan2(v.y, v.x); //gets the angle of the line
  translate(x + vec.x, y + vec.y); //translates to the destination vertex
  rotate(angle + HALF_PI); //rotates the arrow point
  triangle(-offset * 0.5, offset, offset * 0.5, offset, 0, -offset / 2);
  pop();
}