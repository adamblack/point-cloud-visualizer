// Original code: https://github.com/chdh/commons-math-interpolation

// MIT License

// Copyright 2017-2019 these people https://github.com/chdh/commons-math-interpolation/graphs/contributors
// Copyright 2001-2019 The Apache Software Foundation

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


const EPSILON = Number.EPSILON
type UniFunction = (x: number) => number

export class Interpolator {
    static cachedCoefficients: ArrayLike<number>[]
    // static cachedCoefficients: any //!: ArrayLike<number>[]
}

// export let cachedCoefficients!: ArrayLike<number>[]

/**
* Returns a function that computes a cubic spline interpolation for the data
* set using the Akima algorithm, as originally formulated by Hiroshi Akima in
* his 1970 paper "A New Method of Interpolation and Smooth Curve Fitting Based
* on Local Procedures."
* J. ACM 17, 4 (October 1970), 589-602. DOI=10.1145/321607.321609
* http://doi.acm.org/10.1145/321607.321609
*
* This implementation is based on the Akima implementation in the CubicSpline
* class in the Math.NET Numerics library. The method referenced is
* CubicSpline.InterpolateAkimaSorted.
*
* Returns a polynomial spline function consisting of n cubic polynomials,
* defined over the subintervals determined by the x values,
* x[0] < x[1] < ... < x[n-1].
* The Akima algorithm requires that n >= 5.
*
* @param xVals
*    The arguments of the interpolation points, in strictly increasing order.
* @param yVals
*    The values of the interpolation points.
* @returns
*    A function which interpolates the dataset.
*/
export function createAkimaSplineInterpolator(xVals: ArrayLike<number>, yVals: ArrayLike<number>) : UniFunction {
   const segmentCoeffs = computeAkimaPolyCoefficients(xVals, yVals);
   Interpolator.cachedCoefficients = segmentCoeffs
   const xValsCopy = Float64Array.from(xVals);                       // clone to break dependency on passed values
   return (x: number) => evaluatePolySegment(xValsCopy, segmentCoeffs, x);
}

/**
* Computes the polynomial coefficients for the Akima cubic spline
* interpolation of a dataset.
*
* @param xVals
*    The arguments of the interpolation points, in strictly increasing order.
* @param yVals
*    The values of the interpolation points.
* @returns
*    Polynomial coefficients of the segments.
*/
export function computeAkimaPolyCoefficients(xVals: ArrayLike<number>, yVals: ArrayLike<number>) : Float64Array[] {
   if (xVals.length != yVals.length) {
      throw new Error("Dimension mismatch for xVals and yVals.");
   }
   if (xVals.length < 5) {
      throw new Error("Number of points is too small.");
   }
   checkStrictlyIncreasing(xVals);
   const n = xVals.length - 1;                                       // number of segments

   const differences = new Float64Array(n);
   const weights = new Float64Array(n);

   for (let i = 0; i < n; i++) {
      differences[i] = (yVals[i + 1] - yVals[i]) / (xVals[i + 1] - xVals[i]);
   }

   for (let i = 1; i < n; i++) {
      weights[i] = Math.abs(differences[i] - differences[i - 1]);
   }

   // Prepare Hermite interpolation scheme.
   const firstDerivatives = new Float64Array(n + 1);

   for (let i = 2; i < n - 1; i++) {
      const wP = weights[i + 1];
      const wM = weights[i - 1];
      if (Math.abs(wP) < EPSILON && Math.abs(wM) < EPSILON) {
         const xv  = xVals[i];
         const xvP = xVals[i + 1];
         const xvM = xVals[i - 1];
         firstDerivatives[i] = (((xvP - xv) * differences[i - 1]) + ((xv - xvM) * differences[i])) / (xvP - xvM);
      } else {
         firstDerivatives[i] = ((wP * differences[i - 1]) + (wM * differences[i])) / (wP + wM);
      }
   }

   firstDerivatives[0]     = differentiateThreePoint(xVals, yVals, 0, 0, 1, 2);
   firstDerivatives[1]     = differentiateThreePoint(xVals, yVals, 1, 0, 1, 2);
   firstDerivatives[n - 1] = differentiateThreePoint(xVals, yVals, n - 1, n - 2, n - 1, n);
   firstDerivatives[n]     = differentiateThreePoint(xVals, yVals, n    , n - 2, n - 1, n);

   return computeHermitePolyCoefficients(xVals, yVals, firstDerivatives);
}

/**
* Three point differentiation helper, modeled off of the same method in the
* Math.NET CubicSpline class.
*
* @param xVals
*    x values to calculate the numerical derivative with.
* @param yVals
*    y values to calculate the numerical derivative with.
* @param indexOfDifferentiation
*    Index of the elemnt we are calculating the derivative around.
* @param indexOfFirstSample
*    Index of the first element to sample for the three point method.
* @param indexOfSecondsample
*    index of the second element to sample for the three point method.
* @param indexOfThirdSample
*    Index of the third element to sample for the three point method.
* @returns
*    The derivative.
*/
function differentiateThreePoint(xVals: ArrayLike<number>, yVals: ArrayLike<number>,
      indexOfDifferentiation: number, indexOfFirstSample: number,
      indexOfSecondsample: number, indexOfThirdSample: number) : number {

   const x0 = yVals[indexOfFirstSample];
   const x1 = yVals[indexOfSecondsample];
   const x2 = yVals[indexOfThirdSample];

   const t  = xVals[indexOfDifferentiation] - xVals[indexOfFirstSample];
   const t1 = xVals[indexOfSecondsample]    - xVals[indexOfFirstSample];
   const t2 = xVals[indexOfThirdSample]     - xVals[indexOfFirstSample];

   const a = (x2 - x0 - (t2 / t1 * (x1 - x0))) / (t2 * t2 - t1 * t2);
   const b = (x1 - x0 - a * t1 * t1) / t1;

   return (2 * a * t) + b;
}

/**
* Computes the polynomial coefficients for the Hermite cubic spline interpolation
* for a set of (x,y) value pairs and their derivatives. This is modeled off of
* the InterpolateHermiteSorted method in the Math.NET CubicSpline class.
*
* @param xVals
*    x values for interpolation.
* @param yVals
*    y values for interpolation.
* @param firstDerivatives
*    First derivative values of the function.
* @returns
*    Polynomial coefficients of the segments.
*/
function computeHermitePolyCoefficients(xVals: ArrayLike<number>, yVals: ArrayLike<number>, firstDerivatives: ArrayLike<number>) : Float64Array[] {
   if (xVals.length != yVals.length || xVals.length != firstDerivatives.length) {
      throw new Error("Dimension mismatch");
   }
   if (xVals.length < 2) {
      throw new Error("Not enough points.");
   }
   const n = xVals.length - 1;                                       // number of segments

   const segmentCoeffs : Float64Array[] = new Array(n);
   for (let i = 0; i < n; i++) {
      const w = xVals[i + 1] - xVals[i];
      const w2 = w * w;

      const yv  = yVals[i];
      const yvP = yVals[i + 1];

      const fd  = firstDerivatives[i];
      const fdP = firstDerivatives[i + 1];

      const coeffs = new Float64Array(4);
      coeffs[0] = yv;
      coeffs[1] = firstDerivatives[i];
      coeffs[2] = (3 * (yvP - yv) / w - 2 * fd - fdP) / w;
      coeffs[3] = (2 * (yv - yvP) / w + fd + fdP) / w2;
      segmentCoeffs[i] = trimPoly(coeffs);
   }
   return segmentCoeffs;
}

// Evaluates the polynomial of the segment corresponding to the specified x value.
export function evaluatePolySegment(xVals: ArrayLike<number>, segmentCoeffs: ArrayLike<number>[], x: number) : number {
    let i = binarySearch(xVals, x);
    if (i < 0) {
       i = -i - 2;
    }
    i = Math.max(0, Math.min(i, segmentCoeffs.length - 1));
    return evaluatePoly(segmentCoeffs[i], x - xVals[i]);
 }
 
 // Evaluates the value of a polynomial.
 // c contains the polynomial coefficients in ascending order.
 export function evaluatePoly(c: ArrayLike<number>, x: number) : number {
    const n = c.length;
    if (n == 0) {
       return 0;
    }
    let v = c[n - 1];
    for (let i = n - 2; i >= 0; i--) {
       v = x * v + c[i];
    }
    return v;
 }

// Trims top order polynomial coefficients which are zero.
export function trimPoly(c: Float64Array) : Float64Array {
    let n = c.length;
    while (n > 1 && c[n - 1] == 0) {
       n--;
    }
    return (n == c.length) ? c : c.subarray(0, n);
 }

 // Checks that a number sequence is strictly increasing and all values are finite.
export function checkStrictlyIncreasing(a: ArrayLike<number>) {
    for (let i = 0; i < a.length; i++) {
       if (!isFinite(a[i])) {
          throw new Error("Non-finite number detected.");
       }
       if (i > 0 && a[i] <= a[i - 1]) {
          throw new Error("Number sequence is not strictly increasing.");
       }
    }
 }

 // Corresponds to java.util.Arrays.binarySearch().
// Returns the index of the search key, if it is contained in the array.
// Otherwise it returns -(insertionPoint + 1).
// The insertion point is defined as the point at which the key would be
// inserted into the array: the index of the first element greater than
// the key, or a.length if all elements in the array are less than the
// specified key.
export function binarySearch(a: ArrayLike<number>, key: number) : number {
    let low = 0;
    let high = a.length - 1;
    while (low <= high) {
       const mid = (low + high) >>> 1;                                // tslint:disable-line:no-bitwise
       const midVal = a[mid];
       if (midVal < key) {
          low = mid + 1;
       } else if (midVal > key) {
          high = mid - 1;
       } else if (midVal == key) {
          return mid;
       } else {                                                       // values might be NaN
          throw new Error("Invalid number encountered in binary search.");
       }
    }
    return -(low + 1);                                                // key not found
 }