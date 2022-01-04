
let time_passed = 0;
/**
 * @type {GravityField}
 */
let field;
/**
 * @type {InertialFlowParticle}
 */
let particle;

/**
 * @type {MassiveBody[]}
 */
let bodies = [];
/**
 * @type {Moon[]}
 */
let moons = [];

let radius = 0.35;
let period = 90000;

let draw_cross = []
let draw_rings = []
let draw_orbit = false;
let draw_cm = false;
let draw_lines = [];
let draw_equipotential;
let draw_eqpx;
let draw_eqpy;
let mass = 0;
let reduced_mass = 0;
let pixelscale;

function setup() {

  const size = 640;
  const unit_size = 640;
  pixelscale = size / unit_size;
  createCanvas(size, size);
  background(0);
  loop();
  frameRate(50);
  let n = 0;
  let n_select = fxrand();
  if (n_select < 0.1) {
    n = 1;
  } else if (n_select < 0.9) {
    n = 2;
  } else if (n_select < 0.99) {
    n = 3;
  } else {
    n = 5;
  }
  n = 3;
  let invreduced_mass = 0;
  for (let i = 0; i < n; i++) {
    bodies.push(new MassiveBody(uniform(fxrand(), 0.7, 6), new Vec2(0, 0)));
    mass += bodies[i].mass;
    invreduced_mass += 1 / bodies[i].mass;
  }
  reduced_mass = 1 / invreduced_mass;

  time_passed = fxrand() * 100000;
  uniform(fxrand(), 0.2, 0.6)
  for (let i = 0; i < bodies.length; i++) {
    bodies[i].origin.x = radius * Math.cos(2 * Math.PI * (time_passed / period + i / bodies.length))
    bodies[i].origin.y = radius * Math.sin(2 * Math.PI * (time_passed / period + i / bodies.length))
    if (fxrand() < 0.5) {
      let n_moons = 1;
      let n_moons_select = fxrand();
      if (n_moons_select < 0.8) {
        n_moons = 1
      } else if (n_moons_select < 0.9) {
        n_moons = 2
      } else {
        n_moons = 3

      }
      let phase_offset = fxrand() * Math.PI * 2;
      for (let j = 0; j < n_moons; j++) {
        let moon = new Moon(bodies[i]);
        moon.phase_offset = 2 * Math.PI * j / n_moons + phase_offset;
        moons.push(moon)
      }
    }
  }
  for (let i = 0; i < moons.length; i++) {
    moons[i].clear();
  }

  field = new GravityField(bodies, 16, 16);

  draw_equipotential = fxrand() < 0.2;
  if (!draw_equipotential) {
    draw_eqpx = fxrand() < 0.2;
    draw_eqpy = fxrand() < 0.2
  }
  draw_cm = fxrand() < 0.2;
  draw_orbit = fxrand() < 0.8;
  let lines_select = fxrand() < 0.2;
  for (let i = 0; i < bodies.length; i++) {
    draw_rings[i] = fxrand() < (0.6 / n);
    draw_cross[i] = [];
    draw_lines[i] = [];
    for (let j = 0; j < bodies.length; j++) {
      if (j == i) {
        draw_cross[i][j] = false;
        draw_lines[i][j] = false;
      } else {
        draw_cross[i][j] = fxrand() < (0.6 / n);
        if (j > i) {
          draw_lines[i][j] = lines_select;
        } else {
          draw_lines[i][j] = false;
        }
      }
    }
  }
}

function draw() {
  clear()
  background(0);
  time_passed += deltaTime;
  let phase = 2 * Math.PI * time_passed / period;
  for (let i = 0; i < bodies.length; i++) {
    bodies[i].origin.x = radius * Math.cos(phase + 2 * Math.PI * i / bodies.length)
    bodies[i].origin.y = radius * Math.sin(phase + 2 * Math.PI * i / bodies.length)
  }
  let cm = centerOfMass(bodies);
  let origin = toPixels(new Vec2(0, 0));
  let cmpx = toPixels(cm);

  field.pretty(width, height, 16, 16);
  let n = 3;
  if (draw_equipotential) {
    let equip_origin = cm.times(.5);
    for (let i = 0; i < n; i++) {
      field.preciseEquipotential(equip_origin.x + i / n, equip_origin.y, width, height, 1, 1)
    }
  }


  strokeWeight(pixelscale * 2);
  stroke(255);
  noFill();
  if (draw_orbit) {
    circle(origin.x, origin.y, radius * width)
  }

  for (let i = 0; i < bodies.length; i++) {
    if (draw_rings[i]) {
      bodies[i].drawRing(width, height)
    }
    let center = toPixels(bodies[i].origin);

    for (let j = 0; j < bodies.length; j++) {
      let target = toPixels(bodies[j].origin);
      if (draw_cross[i][j]) {
        let dist = distVec2(center, target)
        circle(center.x, center.y, 2 * dist)
      }
      if (draw_lines[i][j]) {
        line(center.x, center.y, target.x, target.y)
      }
    }
  }

  if (draw_eqpx) {
    let n = 3;
    field.preciseEquipotential(0, 0, width, height, 1, 1)
    for (let i = 1; i <= n; i++) {
      let x = 0.75 * radius * Math.cos(phase) * i / n;
      let y = 0.75 * radius * Math.sin(phase) * i / n
      let v = new Vec2(x, y)
      let vpx = toPixels(v)
      strokeWeight(pixelscale * 2)
      field.preciseEquipotential(v.x, v.y, width, height, 1, 1)
      field.preciseEquipotential(-v.x, -v.y, width, height, 1, 1)
    }
  }
  if (draw_eqpy) {
    let n = 3;
    for (let i = 0; i <= n; i++) {
      let x = radius * Math.cos(phase) * (1.5 + i / n);
      let y = radius * Math.sin(phase) * (1.5 + i / n);
      let v = new Vec2(x, y)
      strokeWeight(pixelscale * 2)
      field.preciseEquipotential(v.x, v.y, width, height, 1, 1)
    }
  }


  for (let i = 0; i < moons.length; i++) {
    let moon = moons[i]
    moon.phase = 4 * phase;
    moon.update();
    moon.draw(width, height)
  }

  if (draw_cm) {
    strokeWeight(pixelscale * 2);
    stroke(255);
    noFill()
    circle(origin.x, origin.y, 2 * distVec2(cmpx, origin))
    fill(0);
    circle(cmpx.x, cmpx.y, 10 * pixelscale)
  }

  for (let i = 0; i < bodies.length; i++) {
    bodies[i].draw(width, height);
  }
}

function toPixels(v) {
  return new Vec2(normalise(v.x, -1, 1) * width, normalise(v.y, -1, 1) * height)
}

class MassiveBody {
  /**
   * 
   * @param {number} mass 
   * @param {Vec2} position 
   */
  constructor(mass, position) {
    this.origin = position;
    this.mass = mass;
    this.fill = color(0);
    this.stroke = color(255);
  }

  draw(w, h) {
    strokeWeight(pixelscale * 3);
    stroke(this.stroke);
    fill(this.fill);
    circle(normalise(this.origin.x, -1, 1) * w, normalise(this.origin.y, -1, 1) * h, Math.sqrt(this.mass) * 50 * pixelscale)
  }

  drawRing(w, h) {
    strokeWeight(pixelscale * 2);
    stroke(this.stroke);
    noFill();
    let radius = Math.sqrt(this.mass) / 10 * pixelscale;
    circle(normalise(this.origin.x, -1, 1) * w, normalise(this.origin.y, -1, 1) * h, radius * w)
  }
}

class Moon {
  /**
   * 
   * @param {MassiveBody} parent 
   * @param {Vec2} position 
   */
  constructor(parent) {
    this.parent = parent;
    this.position = new Vec2(0, 0);
    this.radius = Math.sqrt(parent.mass) / 10;
    this.phase = 0;
    this.phase_offset = fxrand() * 2 * Math.PI;
    this.history = 0;
    if (fxrand() < 0.05) {
      this.history = 600;
    }
    this.log = [];
    this.logskip = 2;
    this.logskipindex = 0;
    //this.colour = [color(200, 0, 60), color(0)];
    this.colour = [color(255)];
    this.fade = color(0);
    this.circle_size = 6;
    this.circle_colour = color(0);
    this.update();
  }
  clear() {
    this.log = [];
  }
  update() {
    this.position.x = this.parent.origin.x + this.radius * Math.cos(this.phase + this.phase_offset);
    this.position.y = this.parent.origin.y + this.radius * Math.sin(this.phase + this.phase_offset);
    this.logskipindex++;
    this.logskipindex %= this.logskip;
    if (this.logskipindex == 0) {
      this.log.unshift(this.position.copy())
      if (this.log.length > this.history) {
        this.log.pop()
      }
    }
  }

  draw(w, h) {
    let fade = 8;
    for (let i = this.log.length - 1; i > 1; i--) {
      let x1 = normalise(this.log[i - 1].x, -1, 1) * w;
      let y1 = normalise(this.log[i - 1].y, -1, 1) * h;
      let x2 = normalise(this.log[i + 0].x, -1, 1) * w;
      let y2 = normalise(this.log[i + 0].y, -1, 1) * h;
      let colour = colourmap(this.colour, i / this.log.length);
      strokeWeight(pixelscale * 1.5);
      if (i > this.history - fade) {
        let x = (this.history - i) / fade;
        strokeWeight(pixelscale * 1.5 * x);
      }
      stroke(colour)
      line(x1, y1, x2, y2)
    }
    let px = toPixels(this.position);
    strokeWeight(pixelscale * 1.5);
    fill(this.circle_colour);
    stroke(this.colour[0])
    circle(px.x, px.y, this.circle_size * pixelscale)
  }
}

/**
 * 
 * @param {MassiveBody[]} bodies 
 */
function centerOfMass(bodies) {
  let cm = new Vec2(0, 0);
  let mass = 0;
  for (let i = 0; i < bodies.length; i++) {
    let body = bodies[i];
    let p = body.origin.times(body.mass);
    cm.increment(p);
    mass += body.mass;
  }
  return cm.times(1 / mass);
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
    this.pretty_delta = 0.002;
    this.pretty_count = 512;
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
    strokeWeight(pixelscale * this.pretty_stroke_weight);
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
      if (flow.norm() > 3E2) {
        break;
      }
      let vmax = 8;
      if (flow.norm() > vmax) {
        flow = flow.times(vmax / flow.norm())
      }
      let vmin = 2;
      if (flow.norm() < vmin) {
        flow = flow.times(vmin / flow.norm())
      }
      let r = last.add(flow.times(this.pretty_delta));
      if (i % a < b) {
        line((last.x + 1) * w / 2, (last.y + 1) * h / 2, (r.x + 1) * w / 2, (r.y + 1) * h / 2);
      }
      last = r;
    }
  }

  equipotential(x, y, w, h) {
    let count = 256;
    stroke(color(255, 0, 0));
    strokeWeight(pixelscale * 3);

    let a = 6;
    let b = 6;
    let delta = 1E-4;
    let last = new Vec2(x, y);
    for (let i = 0; i < count; i++) {
      let flow = this.get(last.x, last.y);
      if (flow.norm() > 1E4) {
        break;
      }
      let dv = new Vec2(flow.y, -flow.x)
      let r = last.add(dv.times(delta));
      if (i % a < b) {
        line((last.x + 1) * w / 2, (last.y + 1) * h / 2, (r.x + 1) * w / 2, (r.y + 1) * h / 2);
      }
      last = r;
    }

    last = new Vec2(x, y);
    for (let i = 0; i < count; i++) {
      let flow = this.get(last.x, last.y);
      if (flow.norm() > 1E4) {
        break;
      }
      let dv = new Vec2(-flow.y, flow.x)
      let r = last.add(dv.times(delta));
      if (i % a < b) {
        line((last.x + 1) * w / 2, (last.y + 1) * h / 2, (r.x + 1) * w / 2, (r.y + 1) * h / 2);
      }
      last = r;
    }
  }


  preciseEquipotential(x, y, w, h, a, b) {
    let count = 5E3;
    let delta = 3E-3;
    let first = new Vec2(x, y);
    let last0 = first;
    let last1 = first;
    for (let i = 0; i < count; i++) {
      let flow0 = this.get(last0.x, last0.y);
      if (flow0.norm() > 1E4) {
        break;
      }
      flow0.normalise();
      let dv = new Vec2(flow0.y, -flow0.x)
      let r0 = last0.add(dv.times(delta));
      if (i % a < b) {
        line((last0.x + 1) * w / 2, (last0.y + 1) * h / 2, (r0.x + 1) * w / 2, (r0.y + 1) * h / 2);
      }

      let flow1 = this.get(last1.x, last1.y);
      flow1.normalise();
      if (flow1.norm() > 1E4) {
        break;
      }
      dv = new Vec2(-flow1.y, flow1.x)
      let r1 = last1.add(dv.times(delta));
      if (i % a < b) {
        line((last1.x + 1) * w / 2, (last1.y + 1) * h / 2, (r1.x + 1) * w / 2, (r1.y + 1) * h / 2);
      }
      if (distVec2(r0, r1) < 1E-2 && i > 64) {
        line((r0.x + 1) * w / 2, (r0.y + 1) * h / 2, (r1.x + 1) * w / 2, (r1.y + 1) * h / 2);
        break;
      }
      last0 = r0;
      last1 = r1;
    }
  }

  energyEquipotential(e, w, h, a, b) {
    let current = 0
    let cm = centerOfMass(this.bodies)
    let last = cm;
    stroke(255, 0, 0)
    for (let x = 0; x < 2; x += 0.001) {
      let xr = x;
      let yr = x;

      let v = new Vec2(cm.x + xr, cm.y + yr);
      let flow = this.get(v.x, v.y);
      let dv = v.sub(last);
      current += dotVec2(dv, flow);
      if ((e < 0) && (current < e) || (e > 0) && (current > e)) {
        this.preciseEquipotential(xr, yr, w, h, a, b);
        return;
      }
    }
    for (let x = 0; x < 2; x += 0.001) {
      let xr = -x;
      let yr = -x;

      let v = new Vec2(cm.x + xr, cm.y + yr);
      let flow = this.get(v.x, v.y);
      let dv = v.sub(last);
      current += dotVec2(dv, flow);
      if ((e < 0) && (current < e) || (e > 0) && (current > e)) {
        this.preciseEquipotential(xr, yr, w, h, a, b);
        return;
      }
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
    this.history = 100;
    this.log = [origin];
    this.velocity = new Vec2(0, 0);
    this.colour = [color(240, 0, 60), color(240, 0, 60), color(0, 0, 0)];
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
      let maxg = 5E2;
      if (acceleration.norm() > maxg) {
        acceleration = acceleration.times(maxg / acceleration.norm());
      }
      let maxv = 1E3;
      this.velocity.increment(acceleration.times(target));
      if (this.velocity.norm() > maxv) {
        this.velocity = this.velocity.times(maxv / this.velocity.norm());
      }
      this.position.increment(this.velocity.times(target));
      if (this.position.x > 1) {
        this.velocity.x = -this.velocity.x;
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
    strokeWeight(pixelscale * 0);
    fill(colour);
    circle(x, y, this.circle_size * pixelscale)
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
      strokeWeight(pixelscale * 4);
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
  strokeWeight(pixelscale * 2)
  line(x, y, x + vec.x, y + vec.y); //draw a line beetween the vertices
  let offset = 5 * vec.norm() / 10;
  var angle = atan2(v.y, v.x); //gets the angle of the line
  translate(x + vec.x, y + vec.y); //translates to the destination vertex
  rotate(angle + HALF_PI); //rotates the arrow point
  triangle(-offset * 0.5, offset, offset * 0.5, offset, 0, -offset / 2);
  pop();
}