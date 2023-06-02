import { GLUtils } from "../glutils";
import { AttributeWrapper, Program } from "./program";

export class ArrowProgram extends Program {

    generateData(numOfParts: number, customBuffers: WebGLBuffer[] | null): void {
        let vectorPositions = new Float32Array([
            0, 0,
            0, 0.1,
            0.2, 0,
            0, 0.1,
            0.2, 0.1,
            0.2, 0,
            0.2, 0.15,
            0.3, 0.05,
            0.2, -0.05
        ])
        this.vertexCount = 9
        let positionAttribute = new AttributeWrapper("a_position", vectorPositions, 2, GLUtils.gl.FLOAT)
        this.setAttributes([positionAttribute])
    }

}