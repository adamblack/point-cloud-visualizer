import { FlightHelper } from "../flightHelper";
import { GLUtils } from "../glutils";
import { AttributeWrapper, Program } from "./program";

export class SampleSimplexProgram extends Program {

    flightIndex = 0
    numOfParts = 0

    generateData(numOfParts: number, customBuffers: WebGLBuffer[] | null): void {
        this.vertexCount = 6
        this.numOfParts = numOfParts

        let particlesPositions = new Float32Array((numOfParts+1) * 3)
        let pathOriginalPoints = FlightHelper.getFlightPathAt(this.flightIndex).sampleFlightPath(numOfParts)
        for (let i = 0; i <= numOfParts; i++) {
            particlesPositions[3*i] = pathOriginalPoints[0][i]
            particlesPositions[3*i + 1] = pathOriginalPoints[1][i]
            //this is actually y
            particlesPositions[3*i + 2] = pathOriginalPoints[2][i]
        }

        let sampleSimplexAttributePosition = new AttributeWrapper("a_positionToSample", particlesPositions, 3, GLUtils.gl.FLOAT, GLUtils.gl.STATIC_DRAW, false)
        this.setAttributes([sampleSimplexAttributePosition])

        const tf = GLUtils.gl.createTransformFeedback();
                GLUtils.gl.bindTransformFeedback(GLUtils.gl.TRANSFORM_FEEDBACK, tf);
        let buffer = GLUtils.gl.createBuffer()
        GLUtils.gl.bindBuffer(GLUtils.gl.ARRAY_BUFFER, buffer)
        GLUtils.gl.bufferData(GLUtils.gl.ARRAY_BUFFER, (numOfParts+1) * 3 * 4, GLUtils.gl.STATIC_DRAW)
        GLUtils.gl.bindBufferBase(GLUtils.gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer);
        GLUtils.gl.bindTransformFeedback(GLUtils.gl.TRANSFORM_FEEDBACK, null);
        GLUtils.gl.bindBuffer(GLUtils.gl.ARRAY_BUFFER, null)

        this.transformBuffers.push(tf!)
        this.buffers.push(buffer!)

    }

    setFlightIndexAndRegenerate(flightIndex: number) {
        this.flightIndex = flightIndex
        
        let particlesPositions = new Float32Array((this.numOfParts+1) * 3)
        let pathOriginalPoints = FlightHelper.getFlightPathAt(flightIndex).sampleFlightPath(this.numOfParts)
        for (let i = 0; i <= this.numOfParts; i++) {
            particlesPositions[3*i] = pathOriginalPoints[0][i]
            particlesPositions[3*i + 1] = pathOriginalPoints[1][i]
            //this is actually y
            particlesPositions[3*i + 2] = pathOriginalPoints[2][i]
        }

        let sampleSimplexAttributePosition = new AttributeWrapper("a_positionToSample", particlesPositions, 3, GLUtils.gl.FLOAT, GLUtils.gl.STATIC_DRAW, false)
        this.updateAttribute(sampleSimplexAttributePosition)
    }
    
}