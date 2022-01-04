/**
 * R2 vectors over field Z2
 */
class VectorField {
    /**
     * 
     * @param {number} w width integer
     * @param {number} h height integer
     */
    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.data = [];

    }

    initialise() {
        for (let x = 0; x < this.width; x++) {
            this.data[x] = [];
        }
    }

    /**
     * Get vector at coordinate (x, y)
     * @param {number} x x coordinate integer
     * @param {number} y y coordinate integer
     * @returns {Vec2} Vector at x, y
     */
    at(x, y) {
        return this.data[x][y];
    }

    /**
     * Get vector at coordinate (x, y) with interpolation
     * @param {number} x x coordinate
     * @param {number} y y coordinate
     */
    get(x, y) {
        const eps = 1E-6;
        if (x == this.width) {
            x -= eps;
        }
        if (y == this.height) {
            y -= eps;
        }
        // Claculate our grid verticies.
        let x0 = Math.floor(x);
        let x1 = x0 + 1;
        let y0 = Math.floor(y);
        let y1 = y0 + 1;

        // Relative location in grid cell
        const sx = x - x0;
        const sy = y - y0;

        let v0 = addVec2(this.at(x0, y0).times(1 - sx), this.at(x1, y0).times(sx))
        let v1 = addVec2(this.at(x0, y1).times(1 - sx), this.at(x1, y1).times(sx))

        let v = addVec2(v0.times(1 - sy), v1.times(sy))
        return v;
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

/**
 * Build a vector field of zero vectors
 * @param {number} w width integer
 * @param {number} h height integer
 */
function buildZeroVectorField(w, h) {
    let field = new VectorField(w, h);
    field.initialise();

    for (let x = 0; x < field.width; x++) {
        for (let y = 0; y < field.width; y++) {
            field.data[x][y] = new Vec2(0, 0);
        }
    }
}

/**
 * Build a vector field of random vectors with magnitude < 1
 * @param {number} w width integer
 * @param {number} h height integer
 * @param {Function} rand PRNG function to use.
 */
function buildRandomVectorField(w, h, rand) {
    let field = new VectorField(w, h);
    field.initialise();

    for (let x = 0; x < field.width; x++) {
        for (let y = 0; y < field.width; y++) {
            let theta = rand() * Math.PI * 2;
            let r = rand();
            field.data[x][y] = new Vec2(r * Math.cos(theta), r * Math.sin(theta));
        }
    }
}


/**
 * Build a vector field of random vectors with magnitude == 1
 * @param {number} w width integer
 * @param {number} h height integer
 * @param {Function} rand PRNG function to use.
 */
function buildUnitVectorField(w, h, rand) {
    let field = new VectorField(w, h);
    field.initialise();

    for (let x = 0; x < field.width; x++) {
        for (let y = 0; y < field.width; y++) {
            let theta = uniform(rand(), 0, Math.PI * 2);
            field.data[x][y] = new Vec2(Math.cos(theta), Math.sin(theta));
        }
    }
}

/**
 * ABC for scalar fields
 */
class ScalarField {
    at(x, y) { };
    get(x, y) { };
}

class ExplicitScalarField extends ScalarField {
    /**
     * 
     * @param {number} width Field width
     * @param {number} height Field height
     */
    constructor(width, height) {
        super();
        this.width = width;
        this.height = height;
        this.data = [];
        this.initialise();
    }

    initialise() {
        for (let x = 0; x < this.width; x++) {
            this.data[x] = [];
            for (let y = 0; y < this.height; y++) {
                this.data[x][y] = 0;
            }
        }
    }

    clear() {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                this.data[x][y] = 0;
            }
        }
    }

    /**
     * Get value at coordinate (x, y)
     * @param {number} x x coordinate integer
     * @param {number} y y coordinate integer
     * @returns {number} value at x, y
     */
    at(x, y) {
        return this.data[x][y];
    }

    /**
     * Get value at coordinate (x, y) with interpolation
     * @param {number} x x coordinate
     * @param {number} y y coordinate
     */
    get(x, y) {
        if (x == this.width) {
            x -= 1E-8;
        }
        if (y == this.height) {
            y -= 1E-8;
        }
        // Caculate our grid verticies.
        let x0 = Math.floor(x);
        let x1 = x0 + 1;
        let y0 = Math.floor(y);
        let y1 = y0 + 1;

        // Relative location in grid cell
        const sx = x - x0;
        const sy = y - y0;

        let v0 = this.at(x0, y0) * (1 - sx) + this.at(x1, y0) * (sx)
        let v1 = this.at(x0, y1) * (1 - sx) + this.at(x1, y1) * (sx)

        let v = v0 * (1 - sy) + v1 * sy;
        return v;
    }
}


/**
 * R2 vectors over field Z2
 */
class RandomFlowField {
    /**
     * Get vector at coordinate (x, y)
     * @param {number} x x coordinate integer
     * @param {number} y y coordinate integer
     * @returns {Vec2} Vector at x, y
     */
    at(x, y) {
        // Create xmur3 state:
        var seed = xmur3(x + "." + y);
        // Output four 32-bit hashes to provide the seed for sfc32.
        var rand = sfc32(seed(), seed(), seed(), seed());
        // How have seeded prng with coordinates.

        let theta = rand() * Math.PI * 2;
        let r = rand();
        return new Vec2(r * Math.cos(theta), r * Math.sin(theta));
    }

    /**
     * Get vector at coordinate (x, y) with interpolation
     * @param {number} x x coordinate
     * @param {number} y y coordinate
     * @returns {Vec2}
     */
    get(x, y) {
        // Caculate our grid verticies.
        let x0 = Math.floor(x);
        let x1 = x0 + 1;
        let y0 = Math.floor(y);
        let y1 = y0 + 1;

        // Relative location in grid cell
        const sx = x - x0;
        const sy = y - y0;

        let v0 = addVec2(this.at(x0, y0).times(1 - sx), this.at(x1, y0).times(sx))
        let v1 = addVec2(this.at(x0, y1).times(1 - sx), this.at(x1, y1).times(sx))

        let v = addVec2(v0.times(1 - sy), v1.times(sy))
        return v;
    }
}

class RandomScaledFlowField extends RandomFlowField {
    constructor() {
        super()
        this.fx = 1;
        this.fy = 1;
        this.x0 = 0;
        this.y0 = 0;
    }

    /**
     * Get vector at coordinate (fx * x + x0, fy * y + y0) with interpolation
     * @param {number} x x coordinate
     * @param {number} y y coordinate
     * @returns {Vec2}
     */
    get(x, y) {
        return super.get(this.fx * x + this.x0, this.fy * y + this.y0);
    }
}


/**
 * Simulate a particle in a flow field, incrementing a texture everywhere the particle passes.
 * @param {number} x0 starting x
 * @param {number} y0 starting y
 * @param {number} dt time step
 * @param {number} n steps to do
 * @param {RandomFlowField} flow Flow field to evaluate
 * @param {ExplicitScalarField} texture Texture to write to.
 */
function incrementFlowTexture(x0, y0, dt, n, flow, texture) {
    let r = new Vec2(x0, y0);
    for (let i = 0; i < n; i++) {
        let v = flow.get(r.x, r.y);
        let dr = v.times(dt)
        if (r.x > 0 && r.x < texture.width && r.y > 0 && r.y < texture.height) {
            let xi = Math.floor(r.x);
            let yi = Math.floor(r.y);
            texture.data[xi][yi]++;
        }
        r.increment(dr);
    }
}

/**
 * Apply exponential scaling to every point in heigtmap texture
 * @param {number} alpha Exponent
 * @param {ExplicitScalarField} texture Texture to write to.
 */
function scaleExpHeightmap(alpha, texture) {
    for (let x = 0; x < texture.width; x++) {
        for (let y = 0; y < texture.height; y++) {
            let value = texture.at(x, y);
            texture.data[x][y] = 1 - Math.exp(-alpha * value);
        }
    }
}

/**
 * Fill a texture from a function that maps (x, y) --> v
 * @param {ExplicitScalarField} texture Texture to write to.
 * @param {Function} f function to fill with.
 */
function fillHeightmap(texture, f) {
    for (let x = 0; x < texture.width; x++) {
        for (let y = 0; y < texture.height; y++) {
            texture.data[x][y] = f(x, y);
        }
    }
}