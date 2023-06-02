import { GLUtils } from "../glutils";
import { AttributeWrapper, Program } from "./program";

export class FlowHistoryProgram extends Program {
    
    generateData(numOfParts: number, customBuffers: WebGLBuffer[] | null): void {
        let flowHistoryPositions = new Float32Array([
            -1, -1,
            -1, 1,
            1, -1,
            -1, 1,
            1, 1,
            1, -1,
        ])

        let flowHistoryCoords = new Float32Array([
                    0, 0,
                    0, 1,
                    1, 0,
                    0, 1,
                    1, 1,
                    1, 0,
                ])

        this.vertexCount = 6
        let positionAttribute = new AttributeWrapper("a_position", flowHistoryPositions, 2, GLUtils.gl.FLOAT)
        let coordAttribute = new AttributeWrapper("a_texcoord", flowHistoryCoords, 2, GLUtils.gl.FLOAT)
        this.setAttributes([positionAttribute, coordAttribute])
    }
}