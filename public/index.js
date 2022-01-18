
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
let size = 0;
let pixelscale;
let linestyle = 0;

/**
 * @type {ColourScheme}
 */
let colourscheme;

function setup() {
  const document_width = document.documentElement.clientWidth - 4;
  const document_height = document.documentElement.clientHeight - 4;
  size = Math.min(document_height, document_width);
  const unit_size = 640;
  pixelscale = size / unit_size;
  createCanvas(size, size);


  colourscheme = getColourScheme();

  let ls_select = fxrand();
  let ls_name = "";
  if (ls_select < 0.75) {
    // Long dashes
    linestyle = 0;
    ls_name = "Long dashes"
  } else if (ls_select < 0.93) {
    // Even dashes
    linestyle = 1;
    ls_name = "Even dashes"
  } else {
    // Solid lines
    linestyle = 2;
    ls_name = "Solid lines"
  }

  background(colourscheme.background);
  document.body.style.background = colourscheme.background.toString('#rrggbb');
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
    draw_eqpx = n == 2 ? fxrand() < 0.2 : false;
    draw_eqpy = fxrand() < 0.2
  }
  draw_cm = fxrand() < 0.2;
  draw_orbit = fxrand() < 0.6;
  let lines_select = true; fxrand() < 0.2;
  for (let i = 0; i < bodies.length; i++) {
    draw_rings[i] = fxrand() < (0.6 / n);
    draw_cross[i] = [];
    draw_lines[i] = [];
    for (let j = 0; j < bodies.length; j++) {
      if (j == i) {
        draw_cross[i][j] = false;
        draw_lines[i][j] = false;
      } else {
        draw_cross[i][j] = false//fxrand() < (0.6 / n);
        if (j > i) {
          draw_lines[i][j] = lines_select;
        } else {
          draw_lines[i][j] = false;
        }
      }
    }
  }

  window.$fxhashFeatures = {
    "Bodies": n,
    "Vector Style": ls_name,
    "Colourscheme": colourscheme.name,
  }
  console.log(window.$fxhashFeatures)
}

function draw() {
  clear()
  background(colourscheme.background);
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

  strokeWeight(pixelscale * 2);
  stroke(colourscheme.foreground);
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
        let delta = target.sub(center);
        delta.normalise();
        let v1 = center.add(delta.times(.5 * width * bodies[i].radius))
        let v2 = target.add(delta.times(-.5 * width * bodies[j].radius))
        line(v1.x, v1.y, v2.x, v2.y)
      }
    }
  }

  if (draw_equipotential) {
    let equip_origin = cm.times(-1);
    let n = 3;
    for (let i = 1; i <= n; i++) {
      field.preciseEquipotential(equip_origin.x + i / n, equip_origin.y, width, height, 1, 1)
    }
  }

  if (draw_eqpx) {
    let n = 3;
    field.preciseEquipotential(0, 0, width, height, 1, 1)
    for (let i = 1; i <= n; i++) {
      let x = 0.65 * radius * Math.cos(phase) * i / n;
      let y = 0.65 * radius * Math.sin(phase) * i / n
      let v = new Vec2(x, y)
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
    stroke(colourscheme.foreground);
    noFill()
    circle(origin.x, origin.y, 2 * distVec2(cmpx, origin))
    fill(colourscheme.background);
    circle(cmpx.x, cmpx.y, 10 * pixelscale)
  }

  for (let i = 0; i < bodies.length; i++) {
    bodies[i].draw(width, height);
  }

  if (capture) {
    capturer.capture(canvas);
    console.log(frameCount - animation_start)
    if (frameCount >= animation_start + ANIMATION_FRAMES) {
      console.log('Saving')
      capture = false;
      capturer.stop();
      capturer.save();
    }
  }
}


let capture = false;
let capturer = new CCapture({ format: 'png' });
let animation_start = 0;
const ANIMATION_FRAMES = 60;

function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    cnv = createCanvas(size, size, SVG);
    draw()
    const element = document.getElementsByTagName("svg")[0];
    const svg_content = element.outerHTML;
    saveStrings([svg_content], "threebody", "svg");
    noLoop();
  } else if (keyCode === UP_ARROW) {
    console.log('UP')
    if (capture) {

    } else {
      console.log('Starting capture')
      capture = true;
      animation_start = frameCount;
      capturer.start();
    }
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
    this.radius = Math.sqrt(this.mass) / 15;
    this.ring_radius = Math.sqrt(this.mass) / 10;
    this.fill = color(colourscheme.background);
    this.stroke = colourscheme.foreground;
    this.stroke_weight = 3;
    this.draw_outline = colourscheme.sunstroke;
  }

  draw(w, h) {
    if (this.draw_outline) {
      strokeWeight(pixelscale * 3);
      stroke(this.stroke);
    } else {
      noStroke();
    }
    fill(this.fill);
    // this.radius is in image normalised units. -1 at 0px, 1 at width px
    circle(normalise(this.origin.x, -1, 1) * w, normalise(this.origin.y, -1, 1) * h, this.radius * w)
  }

  drawRing(w, h) {
    strokeWeight(pixelscale * 2);
    stroke(this.stroke);
    noFill();
    let radius = this.ring_radius * w;
    circle(normalise(this.origin.x, -1, 1) * w, normalise(this.origin.y, -1, 1) * h, radius)
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
    this.radius = parent.ring_radius;
    this.phase = 0;
    this.phase_offset = fxrand() * 2 * Math.PI;
    this.history = 0;
    if (fxrand() < 0.05) {
      this.history = 600;
    }
    this.log = [];
    this.logskip = 2;
    this.logskipindex = 0;
    this.colour = [colourscheme.foreground];
    this.circle_size = 6;
    this.circle_colour = colourscheme.background;
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
    for (let i = this.log.length - 1; i > 1; i--) {
      let x1 = normalise(this.log[i - 1].x, -1, 1) * w;
      let y1 = normalise(this.log[i - 1].y, -1, 1) * h;
      let x2 = normalise(this.log[i + 0].x, -1, 1) * w;
      let y2 = normalise(this.log[i + 0].y, -1, 1) * h;
      let colour = colourmap(this.colour, i / this.log.length);
      strokeWeight(pixelscale * 1.5);
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

    this.pretty_stroke = colourscheme.foreground;
    this.pretty_stroke_weight = 1.4;
    this.pretty_segments = 8;
    this.pretty_duty_segments = this.pretty_segments * 3 / 4;
    if (linestyle == 0) {
      this.pretty_segments = 8;
      this.pretty_duty_segments = 6;
    } else if (linestyle == 1) {
      this.pretty_segments = 8;
      this.pretty_duty_segments = 4;
    } else if (linestyle == 2) {
      this.pretty_segments = 1E3;
      this.pretty_duty_segments = 1E3;
    }
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
    let idx = 0;
    for (let x = 0; x < wt; x++) {
      let xr = (x + .5) / wt * 2 - 1;
      let yr = -1;
      this.prettyLine(xr, yr, w, h, idx++);
    }
    for (let x = 0; x < wt; x++) {
      let xr = (x + .5) / wt * 2 - 1;
      let yr = 1;
      this.prettyLine(xr, yr, w, h, idx++);
    }
    for (let x = 0; x < ht; x++) {
      let yr = (x + .5) / wt * 2 - 1;
      let xr = -1;
      this.prettyLine(xr, yr, w, h, idx++);
    }
    for (let x = 0; x < ht; x++) {
      let yr = (x + .5) / wt * 2 - 1;
      let xr = 1;
      this.prettyLine(xr, yr, w, h, idx++);
    }
  }

  prettyLine(x, y, w, h, idx) {
    let count = this.pretty_count;
    let a = this.pretty_segments;
    let b = this.pretty_duty_segments;
    let last = new Vec2(x, y);
    for (let i = 0; i < count; i++) {
      if (i % a == 0) {
        let segment = Math.floor(i / a);
        stroke(colourscheme.getVector(idx, segment))
      }
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
      let lastpx = toPixels(last);
      let r = last.add(flow.times(this.pretty_delta));
      let rpx = toPixels(r);
      for (let bi = 0; bi < this.bodies.length; bi++) {
        let body = this.bodies[bi];
        if (distVec2(r, body.origin) < body.radius) {
          let small_steps = 128;
          r = last;
          if (i % a >= b) {
            return;
          }
          for (let j = 0; j <= small_steps; j++) {
            r = last.add(flow.times(j * this.pretty_delta / small_steps));
            if (distVec2(r, body.origin) < body.radius) {
              rpx = toPixels(r);
              line(lastpx.x, lastpx.y, rpx.x, rpx.y);
              return;
            }
          }
        }
      }
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

class ColourScheme {
  constructor() {
    this.background = color(0);
    this.foreground = color(255);
    this.sunstroke = true;
    this.name = "Nightsky"
  }
  getVector(idx, segment) {
    return this.foreground;
  }
}

/**
 * Very quick hashing function.
 * @param {string} str 
 */
function xmur3(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
      h = h << 13 | h >>> 19;
  return function () {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}

class RandomVectorScheme extends ColourScheme {
  constructor() {
    super()
    this.background = color(5, 12, 50)
    this.vectors = [color(185, 128, 106), color(229, 197, 173), color(219, 175, 150)];
    this.name = "Copper"
  }

  getVector(idx, segment) {
    let seed = xmur3(idx + "." + segment);
    var rand = sfc32(seed(), seed(), seed(), seed());

    return sample(rand(), this.vectors);
  }
}

function getColourScheme() {
  let select = fxrand();
  let scheme;
  if (select < 0.3) {
    scheme = new ColourScheme();
  } else if (select < 0.5) {
    // Copper
    scheme = new RandomVectorScheme()
  } else if (select < 0.6) {
    scheme = new RandomVectorScheme()
    scheme.background = color(0);
    scheme.vectors = [color(153, 186, 157), color(187, 153, 183), color(236, 200, 201), color(202, 237, 236),]
    scheme.name = "Pastels"
  } else if (select < 0.7) {
    scheme = new RandomVectorScheme()
    scheme.background = color(0);
    scheme.foreground = color(210, 200, 188)
    scheme.vectors = [color(172, 126, 98), color(186, 154, 136), color(187, 207, 215), color(91, 130, 142),]
    scheme.name = "Beaches"
  } else if (select < 0.75) {
    scheme = new RandomVectorScheme()
    scheme.background = color(0);
    scheme.foreground = color(214, 194, 188)
    scheme.vectors = [color(101, 178, 198), color(192, 204, 204), color(213, 114, 118), color(215, 61, 108)]
    scheme.name = "Candy"
  } else if (select < 0.8) {
    scheme = new RandomVectorScheme()
    scheme.background = color(0, 36, 63);
    scheme.foreground = color(192, 131, 41)
    scheme.vectors = [color(182, 121, 41), color(200, 150, 100), color(60, 90, 120), color(163, 172, 177)]
    scheme.name = "Sol et Luna"
  }
  else {
    scheme = new ColourScheme();
    scheme.foreground = color(0);
    scheme.background = color(255);
    scheme.name = "Inverted"
  }
  scheme.sunstroke = fxrand() < 0.95;
  return scheme;
}