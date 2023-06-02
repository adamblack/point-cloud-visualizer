import { GLUtils } from "../glutils";
import { AttributeWrapper, Program } from "./program";

export class FlowCalculationProgram extends Program {
    generateData(numOfParts: number, customBuffers: WebGLBuffer[] | null): void {
        this.flipVaos = true
        let unitSize = 3

        let flowDraw1AttributePosition = new AttributeWrapper("position", null, unitSize, GLUtils.gl.FLOAT, GLUtils.gl.STATIC_DRAW, false, customBuffers![1])
        this.setAttributes([flowDraw1AttributePosition])
        let flowDraw2AttributePosition = new AttributeWrapper("position", null, unitSize, GLUtils.gl.FLOAT, GLUtils.gl.STATIC_DRAW, false, customBuffers![0])
        this.setAttributes([flowDraw2AttributePosition])
        
        GLUtils.gl.bindBuffer(GLUtils.gl.ARRAY_BUFFER, null);
        GLUtils.gl.bindBuffer(GLUtils.gl.TRANSFORM_FEEDBACK_BUFFER, null);
    }
}