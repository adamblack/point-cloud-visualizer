import { FlightHelper } from "../flightHelper";
import { GLUtils, clamp } from "../glutils";
import { AttributeWrapper, Program } from "./program";

export class FlightProgram extends Program {

    pathPoints!: Float32Array
    flightIndex = 0
    numOfParts = 0

    generateData(numOfParts: number, customBuffers: WebGLBuffer[] | null): void {
        if (this.pathPoints) {
            return
        }

        this.vertexCount = numOfParts + 1
        this.numOfParts = numOfParts

        this.pathPoints = new Float32Array(3 * (this.vertexCount))
        const step = 2.0 / this.numOfParts
        for (let i = 0; i <= this.numOfParts; i++ ) {
            //bump is defined at <-1;1>
            let position = step * i - 1
        
            this.pathPoints[3*i + 0] = position
            this.pathPoints[3*i + 1] = FlightHelper.getFlightPathAt(this.flightIndex).flightYPathAt(position)
            this.pathPoints[3*i + 2] = FlightHelper.getFlightPathAt(this.flightIndex).flightZPathAt(position)

            this.pathPoints[3*i + 3] = position
            this.pathPoints[3*i + 4] = FlightHelper.getFlightPathAt(this.flightIndex).flightYPathAt(position)
            this.pathPoints[3*i + 5] = FlightHelper.getFlightPathAt(this.flightIndex).flightZPathAt(position) + 0.02
        }
        
        let positionAttribute = new AttributeWrapper("a_position", this.pathPoints, 3, GLUtils.gl.FLOAT)
        this.setAttributes([positionAttribute])
    }

    setFlightIndexAndRegenerate(flightIndex: number) {
        this.flightIndex = flightIndex
        
        this.pathPoints = new Float32Array(3 * (this.vertexCount))
        const step = 2.0 / this.numOfParts
        for (let i = 0; i <= this.numOfParts; i++ ) {
            //bump is defined at <-1;1>
            let position = step * i - 1
        
            this.pathPoints[3*i + 0] = position
            this.pathPoints[3*i + 1] = FlightHelper.getFlightPathAt(this.flightIndex).flightYPathAt(position)
            this.pathPoints[3*i + 2] = FlightHelper.getFlightPathAt(this.flightIndex).flightZPathAt(position)

            this.pathPoints[3*i + 3] = position
            this.pathPoints[3*i + 4] = FlightHelper.getFlightPathAt(this.flightIndex).flightYPathAt(position)
            this.pathPoints[3*i + 5] = FlightHelper.getFlightPathAt(this.flightIndex).flightZPathAt(position) + 0.02
        }
        
        let positionAttribute = new AttributeWrapper("a_position", this.pathPoints, 3, GLUtils.gl.FLOAT)
        this.updateAttribute(positionAttribute)
    }

}