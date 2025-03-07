import invariant from "tiny-invariant"

/**
 * This module was adapted from https://github.com/rsocket/ewma
 * to remove the dependency on the Node assert API.
 */

/**
 * Compute the exponential weighted moving average of a series of values.
 * The time at which you insert the value into `Ewma` is used to compute a
 * weight (recent points are weighted higher).
 * The parameter for defining the convergence speed (like most decay process) is
 * the half-life.
 *
 * e.g. with a half-life of 10 unit, if you insert 100 at t=0 and 200 at t=10
 *      the ewma will be equal to (200 - 100)/2 = 150 (half of the distance
 *      between the new and the old value)
 *
 * @param {Number} halfLifeMs parameter representing the speed of convergence
 * @param {Number} initialValue initial value
 * @param {Object} clock clock object used to read time
 *
 * @returns {Ewma} the object computing the ewma average
 */
export default class Ewma {
  _clock: { now: () => number }
  _stamp: number
  _decay: number
  _ewma: number

  /**
   *
   */
  constructor(
    halfLifeMs: number,
    initialValue: number,
    clock?: { now: () => number }
  ) {
    invariant(typeof halfLifeMs === "number", "halfLifeMs is not a number")
    invariant(!isNaN(halfLifeMs), "halfLifeMs can not be NaN")
    invariant(typeof initialValue === "number", "initialValue is not a number")
    invariant(!isNaN(initialValue), "initialValue can not be NaN")

    if (clock !== undefined) {
      invariant(typeof clock.now === "function", "clock.now is not a function")
    }

    this._decay = halfLifeMs
    this._ewma = initialValue || 0
    this._clock = clock || Date
    this._stamp = typeof initialValue === "number" ? this._clock.now() : 0
  }

  insert(x: number) {
    invariant(typeof x === "number", "x is not a number")
    invariant(!isNaN(x), "x can not be NaN")

    var now = this._clock.now()
    var elapsed = now - this._stamp
    this._stamp = now

    // This seemingly magic equation is derived from the fact that we are
    // defining a half life for each value. A half life is the amount of time
    // that it takes for a value V to decay to .5V or V/2. Elapsed is the time
    // delta between this value being reported and the previous value being
    // reported. Given the half life, and the amount of time since the last
    // reported value, this equation determines how much the new value should
    // be represented in the ewma.
    // For a detailed proof read:
    // A Framework for the Analysis of Unevenly Spaced Time Series Data
    // Eckner, 2014
    var w = Math.pow(2, -elapsed / this._decay)
    this._ewma = w * this._ewma + (1.0 - w) * x
  }

  reset(x: number) {
    invariant(typeof x === "number", "x is not a number")
    invariant(!isNaN(x), "x can not be NaN")

    this._stamp = this._clock.now()
    this._ewma = x
  }

  value() {
    return this._ewma
  }
}
