/**
 * Interpolate between a and b in 1d
 * @param {number} a First value
 * @param {number} b Second value
 * @param {number} x Interpolating value
 * @returns {number}
 */
function interp1d(a, b, x) {
    x = Math.min(Math.max(x, 0), 1)
    return a * (1 - x) + b * x;
}

/**
 * Table lookup for evenly spaced values (assuming [0, 1] normalised) with interpolation
 * @param {number[]} T Table to lookup
 * @param {number} x [0, 1] normalised interpolation index
 * @returns {number}
 */
function tableLookup(x, T) {
    const n = T.length;
    // Which pair of values are we interpolating between
    const bin = Math.floor(x * (n - 1));
    // What is our [0, 1] normalised interpolation index for this bin.
    const bin_width = 1 / (n - 1);
    const bin_interp = (x - bin_width * bin) / bin_width;
    if (bin >= n - 1) {
        return T[n - 1];
    } else if (bin < 0) {
        return T[0];
    } else {
        return interp1d(T[bin], T[bin + 1], bin_interp);
    }
}

/**
 * Map [0, 1] normalised random number to normal distribution
 * @param {number} x value to normalise
 * @param {number} mu mean
 * @param {number} sig max
 */
function distNormal(x, mu, sig) {
    // Inverse error function tabluated values. (maxing at 3 sigma)
    const inverf = [0, 0.0889, 0.1791, 0.2725, 0.3708, 0.4769, 0.5951, 0.7329, 0.9062, 1.163, 3]
    if (x > 0.5) {
        // Renormalise s to [0, 1]
        // s == 0 --> return mu
        // s == 1 --> return mu + 4.2 sig
        let s = clamp(2 * x - 1, 0, 1);
        return mu + tableLookup(s, inverf) * sig * 1.4142;
    } else {
        let s = clamp(1 - 2 * x, 0, 1);
        return mu - tableLookup(s, inverf) * sig * 1.4142;
    }
}

/**
 * Implementation of LinearSegmentedColormap from mpl
 * @param {p5.Color[]} colours List of colours
 * @param {number} x [0, 1] normalised interpolation index
 */
function colourmap(colours, x) {
    const n = colours.length;
    // Which pair of colours are we interpolating between
    const bin = Math.floor(x * (n - 1));
    // What is our [0, 1] normalised interpolation index for this bin.
    const bin_width = 1 / (n - 1);
    const bin_interp = (x - bin_width * bin) / bin_width;
    if (bin >= n - 1) {
        return colours[n - 1];
    } else if (bin < 0) {
        return colours[0];
    } else {
        return lerpColor(colours[bin], colours[bin + 1], bin_interp);
    }
}

/**
 * Clamp x in [a, b]
 * @param {number} x value to clamp
 * @param {number} a min
 * @param {number} b max
 */
function clamp(x, a, b) {
    return Math.min(Math.max(x, a), b);
}

/**
 * Take x in [a, b], normalise to [0, 1]
 * @param {number} x value to normalise
 * @param {number} a min
 * @param {number} b max
 */
function normalise(x, a, b) {
    return (x - a) / (b - a);
}

/**
 * Take x in [a, b], normalise to [0, 1] with clamping.
 * @param {number} x value to normalise
 * @param {number} a min
 * @param {number} b max
 */
function nclamp(x, a, b) {
    return clamp(normalise(x, a, b), 0, 1);
}

/**
 * Map [0, 1] normalised random number to [a, b]
 * @param {number} x value to normalise
 * @param {number} a min
 * @param {number} b max
 */
function uniform(x, a, b) {
    return a + x * (b - a);
}

/**
 * Sample from A with random number x
 * @param {number} x selection value
 * @param {any[]} A set
 */
function sample(x, A) {
    return A[Math.floor(clamp(x, 0, 1) * A.length)];
}

function shuffleArray(rand, array) {
    let curId = array.length;
    // There remain elements to shuffle
    while (0 !== curId) {
        // Pick a remaining element
        let randId = Math.floor(rand() * curId);
        curId -= 1;
        // Swap it with the current element.
        let tmp = array[curId];
        array[curId] = array[randId];
        array[randId] = tmp;
    }
    return array;
}

/**
 * Map [0, 1] to n steps in [0, 1]
 * @param {number} x Value to stagger
 * @param {number} lut Number of steps
 */
function stagger(x, lut) {
    return Math.floor(x*lut) / lut;
}