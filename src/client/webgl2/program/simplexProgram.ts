import { GLUtils } from "../glutils";
import { AttributeWrapper, Program } from "./program";

export class SimplexProgram extends Program {

    generateData(numOfParts: number, customBuffers: WebGLBuffer[] | null): void {
        let simplexPositions = new Float32Array([
            -1, -1,
            -1, 1,
            1, -1,
            -1, 1,
            1, 1,
            1, -1,
        ])
        this.vertexCount = 6
        let positionAttribute = new AttributeWrapper("a_position", simplexPositions, 2, GLUtils.gl.FLOAT)
        this.setAttributes([positionAttribute])
    }

}