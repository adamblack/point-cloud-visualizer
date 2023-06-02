import { Expression } from "nerdamer"
import { clamp } from "./glutils"

let nerdamer = require("nerdamer/all.min")

export class FlightHelper {

    static flightPaths: Array<FlightPath>
    
    static init() {
        this.flightPaths = new Array<FlightPath>()
        this.flightPaths.push(
            new FlightPath("sin(3*x)", "e^(-1/(1-x^2))")
        )

        for( let i = 0; i < 5; i++) {
            let offset = "" + (1 + 0.1*i) + "*"
            this.flightPaths.push(
                new FlightPath("0", offset + "e^(-1/(1-x^2))")
            )
        }
    }

    static getFlightPathAt(index: number) : FlightPath {
        return this.flightPaths[index]
    }
}

class FlightPath {

    expressionZ: Expression
    expressionY: Expression

    evaulateZ: any
    evaulateY: any

    constructor(valuesYGenerator: string, valuesZGenerator: string) {
        this.expressionZ = nerdamer(valuesZGenerator)
        this.expressionY = nerdamer(valuesYGenerator)

        this.evaulateZ = this.expressionZ.buildFunction()
        this.evaulateY = this.expressionY.buildFunction()
    }

    //into the space towards camera
    flightZPathAt(x: number) : number {
        x = clamp(x, -0.98, 0.98)
        return this.evaulateZ(x)
    }

    //top to bottom of screen
    flightYPathAt(x: number) : number {
        x = clamp(x, -0.98, 0.98)
        return this.evaulateY(x)
    }

    sampleFlightPath(sampleSize: number) : Array<Array<number>> {
        let samplesZ = new Array<number>(sampleSize + 1)
        let samplesY = new Array<number>(sampleSize + 1)
        let domain = new Array<number>(sampleSize + 1)
        const step = 2.0 / sampleSize

        for (let i = 0; i <= sampleSize; i++ ) {
            //bump is defined at <-1;1>
            let position = step * i - 1
            domain[i] = position
            samplesZ[i] = this.flightZPathAt(position)
            samplesY[i] = this.flightYPathAt(position)
        }

        return new Array(domain, samplesZ, samplesY)
    }
}