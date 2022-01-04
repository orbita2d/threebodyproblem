/**
 * Class for 2d vectors
 * @property {number} x
 * @property {number} y
 */
class Vec2 {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    norm() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    increment(that) {
        this.x += that.x;
        this.y += that.y;
    }

    /**
     * 
     * @param {Vec2} that 
     */
    add(that) {
        return new Vec2(
            this.x + that.x,
            this.y + that.y
        )
    }

    /**
     * 
     * @param {Vec2} that 
     */
    sub(that) {
        return new Vec2(
            this.x - that.x,
            this.y - that.y
        )
    }

    /**
     * @param {number} that 
     */
    times(that) {
        return new Vec2(
            this.x * that,
            this.y * that
        )
    }

    normalise() {
        let l = this.norm()
        this.x /= l;
        this.y /= l;
        return this;
    }


    copy() {
        return new Vec2(
            this.x,
            this.y
        )
    }

    heading() {
        return Math.atan2(this.y, this.x);
    }
}

/**
 * Add a to b
 * @param {Vec2} a 
 * @param {Vec2} b 
 */
function addVec2(a, b) {
    return new Vec2(a.x + b.x, a.y + b.y);
}

/**
 * Subract b from a
 * @param {Vec2} a 
 * @param {Vec2} b 
 */
function subVec2(a, b) {
    return new Vec2(a.x - b.x, a.y - b.y);
}

/**
 * Dot product of two vec2s
 * @param {Vec2} a 
 * @param {Vec2} b 
 */
function dotVec2(a, b) {
    return (a.x * b.x) + (a.y * b.y);
}

/**
 * Multiply a * b
 * @param {number} a 
 * @param {Vec2} v vector
 */
function mulVec2(a, v) {
    return new Vec2(v.x * a, v.y * a);
}

/**
 * Distance between vec2s
 * @param {Vec2} a 
 * @param {Vec2} b 
 */
function distVec2(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}


/**
 * Class for 3d vectors
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */
class Vec3 {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    norm() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }
}

/**
 * Add a to b
 * @param {Vec3} a 
 * @param {Vec3} b 
 */
function addVec3(a, b) {
    return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
}

/**
 * Subract b from a
 * @param {Vec3} a 
 * @param {Vec3} b 
 */
function subVec3(a, b) {
    return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
}

/**
 * Add a to b
 * @param {number} n 
 * @param {Vec3} v 
 */
function multiplyVec3(n, v) {
    return new Vec3(n * v.x, n * v.y, n * v.z);
}

/**
 * Dot product of two vec3s
 * @param {Vec3} a 
 * @param {Vec3} b 
 */
function dotVec3(a, b) {
    return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
}

/**
 * Distance between vec2s
 * @param {Vec3} a 
 * @param {Vec3} b 
 */
function distVec3(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}
