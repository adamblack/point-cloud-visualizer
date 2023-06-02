import { mat4, vec3 } from "gl-matrix";
import { CameraControls } from "../cameraControls";
import { ARROW_VERTEX_SHADER, ARROW_FRAGMENT_SHADER } from "../flowShaders";
import { GLUtils } from "../glutils";
import { ArrowProgram } from "../program/arrowProgram";
import { Program, UNIFORM_TYPE } from "../program/program";
import { DrawObject, DrawParams } from "./drawObject";

export class VectorFieldDrawObject implements DrawObject {

    fieldVectorProgram!: Program

    constructor() {
        this.setupPrograms()
    }

    setupPrograms(): void {
        this.fieldVectorProgram = new ArrowProgram(GLUtils.gl, ARROW_VERTEX_SHADER, ARROW_FRAGMENT_SHADER)
        this.fieldVectorProgram.generateData(0, null)
    }

    draw(drawParams: DrawParams, cameraControls: CameraControls): void {

        if (!drawParams.fieldVectorProgram) {
            drawParams.fieldVectorProgram = this.fieldVectorProgram
        }

        this.fieldVectorProgram.useProgram()

        GLUtils.bindTexture(drawParams.currentSimplexTexture)


        this.fieldVectorProgram.setUniform("u_matrix_view", cameraControls.viewMatrix, UNIFORM_TYPE.mat)
        this.fieldVectorProgram.setUniform("u_matrix_projection", cameraControls.projMatrix, UNIFORM_TYPE.mat)

        if (cameraControls.cameraFeedback.guiOptions.zprojection) {
            this.fieldVectorProgram.setUniform("u_z_projection", 1.0, UNIFORM_TYPE.f)
        } else {
            this.fieldVectorProgram.setUniform("u_z_projection", 0.0, UNIFORM_TYPE.f)
        }

        this.fieldVectorProgram.setUniform("u_fromTexel", 1.0, UNIFORM_TYPE.f)
        this.fieldVectorProgram.setUniform("u_noise_size", [drawParams.simplexTextureSize.x, drawParams.simplexTextureSize.y], UNIFORM_TYPE.iv)

        for (let i = 0; i <= drawParams.fieldVisualizationDensity; i++) {

            let u = i * (2.0 / drawParams.fieldVisualizationDensity) - 1

            for (let j = 0; j <= drawParams.fieldVisualizationDensity; j++) {

                let v = j * (2.0 / drawParams.fieldVisualizationDensity) - 1
                // move to atrubute
                this.fieldVectorProgram.setUniform("u_vector_index", [i / drawParams.fieldVisualizationDensity, j / drawParams.fieldVisualizationDensity], UNIFORM_TYPE.fv)

                let modelMatrix = mat4.create()
                mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(u, v, drawParams.layer * 0.1))
                this.fieldVectorProgram.setUniform("u_matrix_model", modelMatrix, UNIFORM_TYPE.mat)

                this.fieldVectorProgram.draw()
            }
        }
        this.fieldVectorProgram.setUniform("u_fromTexel", 1.0, UNIFORM_TYPE.f)
    }
    
}