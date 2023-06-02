import { Interpolator, createAkimaSplineInterpolator } from "./mathUtils"
import { FlightHelper } from "./flightHelper"

export class InterpolationHelper {

    // domain + values
    pathOriginalPoints: Array<Array<Array<number>>>
    pathAkimaXZCoefficients: Array<ArrayLike<number>[]>
    pathAkimaXYCoefficients: Array<ArrayLike<number>[]>

    // vector field values sampled along the line integral - same domain as path: pathOriginalPoints[0]
    fieldOriginalXYPoints!: Array<number>
    fieldOriginalXZPoints!: Array<number>
    fieldOriginalAbsSizePoints!: Array<number>
    fieldAkimaCoefficients!: ArrayLike<number>[]
    fieldAkimaXCoefficients!: Array<ArrayLike<number>[]>
    fieldAkimaYCoefficients!: Array<ArrayLike<number>[]>
    fieldAkimaZCoefficients!: Array<ArrayLike<number>[]>

    // number of splines
    sampleSize: number
    maxIndex = -1

    timeNode: Text
    indexNode: Text
    worker: Worker
    workerInProgress = false

    constructor(sampleSize: number) {
        this.sampleSize = sampleSize
        this.worker = new Worker(new URL('interpolationWorker.ts', import.meta.url))

        this.pathOriginalPoints = new Array<Array<Array<number>>>(FlightHelper.flightPaths.length)
        this.pathAkimaXZCoefficients = new Array<ArrayLike<number>[]>(FlightHelper.flightPaths.length)
        this.pathAkimaXYCoefficients = new Array<ArrayLike<number>[]>(FlightHelper.flightPaths.length)

        this.fieldAkimaXCoefficients = new Array<ArrayLike<number>[]>(FlightHelper.flightPaths.length)
        this.fieldAkimaYCoefficients = new Array<ArrayLike<number>[]>(FlightHelper.flightPaths.length)
        this.fieldAkimaZCoefficients = new Array<ArrayLike<number>[]>(FlightHelper.flightPaths.length)

        for (let i = 0; i < FlightHelper.flightPaths.length; i++) {
            this.pathOriginalPoints[i] = FlightHelper.getFlightPathAt(i).sampleFlightPath(sampleSize)

            // XZ coeffs
            let fnc = createAkimaSplineInterpolator(this.pathOriginalPoints[i][0], this.pathOriginalPoints[i][1])
            this.pathAkimaXZCoefficients[i] = Interpolator.cachedCoefficients

            // XY coeffs
            fnc = createAkimaSplineInterpolator(this.pathOriginalPoints[i][0], this.pathOriginalPoints[i][2])
            this.pathAkimaXYCoefficients[i] = Interpolator.cachedCoefficients
        }

        let timeElement = document.querySelector("#pathprices")
        this.timeNode = document.createTextNode("");
        timeElement!.appendChild(this.timeNode)

        let indexElement = document.querySelector("#bestpriceindex")
        this.indexNode = document.createTextNode("");
        indexElement!.appendChild(this.indexNode)
    }

    createNoiseInterpolation(fieldOriginalXYPoints: Float32Array, fieldOriginalXZPoints: Float32Array, fieldOriginalAbsSizePoints: Float32Array, flightIndex: number) {
        this.fieldOriginalXYPoints = Array.prototype.slice.call(fieldOriginalXYPoints)
        this.fieldOriginalXZPoints = Array.prototype.slice.call(fieldOriginalXZPoints)
        this.fieldOriginalAbsSizePoints = Array.prototype.slice.call(fieldOriginalAbsSizePoints)

        // convert from our polar space to Cartesian space
        let multipleCoeff = 2*Math.PI
        let xVector = new Array<number>()
        let yVector = new Array<number>()
        let zVector = new Array<number>()
        for (let i = 0; i < this.pathOriginalPoints[0][0].length; i++) {
            xVector.push(this.fieldOriginalAbsSizePoints[i]*Math.cos(this.fieldOriginalXYPoints[i]*multipleCoeff)*Math.cos(this.fieldOriginalXZPoints[i]*multipleCoeff))
            yVector.push(this.fieldOriginalAbsSizePoints[i]*Math.sin(this.fieldOriginalXYPoints[i]*multipleCoeff)*Math.cos(this.fieldOriginalXZPoints[i]*multipleCoeff))
            zVector.push(this.fieldOriginalAbsSizePoints[i]*Math.cos(this.fieldOriginalXYPoints[i]*multipleCoeff)*Math.sin(this.fieldOriginalXZPoints[i]*multipleCoeff))
        }

        let fncX = createAkimaSplineInterpolator(this.pathOriginalPoints[0][0], xVector)
        this.fieldAkimaXCoefficients[flightIndex] = Interpolator.cachedCoefficients

        let fncY = createAkimaSplineInterpolator(this.pathOriginalPoints[0][0], yVector)
        this.fieldAkimaYCoefficients[flightIndex] = Interpolator.cachedCoefficients

        let fncZ = createAkimaSplineInterpolator(this.pathOriginalPoints[0][0], zVector)
        this.fieldAkimaZCoefficients[flightIndex] = Interpolator.cachedCoefficients
    }

    calculateFieldWork() {

        if (this.workerInProgress) {
            return
        }

        this.workerInProgress = true

        this.timeNode.nodeValue = "Calculating: 0 %"

        this.worker.postMessage({
            'pathAkimaXZCoefficients': this.pathAkimaXZCoefficients,
            'pathAkimaXYCoefficients': this.pathAkimaXYCoefficients,
            'pathOriginalPoints': this.pathOriginalPoints,
            'fieldAkimaXCoefficients': this.fieldAkimaXCoefficients,
            'fieldAkimaYCoefficients': this.fieldAkimaYCoefficients,
            'fieldAkimaZCoefficients': this.fieldAkimaZCoefficients,
        })
        this.worker.onmessage = event => {
            if (event.data.progress) {
                this.timeNode.nodeValue = `Calculating: ${event.data.progress} %`
            } else {
                this.timeNode.nodeValue = "" + event.data.flightsPathCost
                this.workerInProgress = false

                let maxValue = -50
                event.data.flightsPathCost.forEach((element: number, index: number) => {
                    if (element > maxValue) {
                        maxValue = element
                        this.maxIndex = index
                    }
                });

                this.indexNode.nodeValue = "" + this.maxIndex
            }
        }

    }

}