import { GLUtils } from "../glutils";
import { AttributeWrapper, Program } from "./program";

export class UpdateFlowProgram extends Program {
    generateData(numOfParts: number, customBuffers: WebGLBuffer[] | null): void {
        this.vertexCount = 6

        let unitSize = 3
        let particlesPositions = new Float32Array(numOfParts * unitSize)

        for (let i = 0; i < numOfParts; i++) {
            particlesPositions[unitSize*i] = Math.random()*2 - 1
            particlesPositions[unitSize*i + 1] = Math.random()*2 - 1
            particlesPositions[unitSize*i + 2] = 1
        }

        let flowAttributePosition = new AttributeWrapper("oldPosition", particlesPositions, unitSize, GLUtils.gl.FLOAT, GLUtils.gl.DYNAMIC_DRAW, true)

        this.setAttributes([flowAttributePosition])
        this.setAttributes([flowAttributePosition])
        this.flipVaos = true
        this.setTransform()
    }
}