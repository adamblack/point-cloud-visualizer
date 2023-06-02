import { mat4, vec3 } from "gl-matrix";
import { SIMPLEXA_VERTEX_SHADER, SIMPLEXB_FRAGMENT_SHADER } from "../flowShaders";
import { GLUtils, OffTextureData } from "../glutils";
import { Program, UNIFORM_TYPE } from "../program/program";
import { SimplexProgram } from "../program/simplexProgram";
import { DrawObject, DrawParams } from "./drawObject";
import { CameraControls } from "../cameraControls";

export class SimplexDrawObject implements DrawObject {

    simplexProgram!: Program
    tempSimplexTexWrapper!: OffTextureData

    constructor() {
        this.setupPrograms()
    }

    setupPrograms(): void {
        this.simplexProgram = new SimplexProgram(GLUtils.gl, SIMPLEXA_VERTEX_SHADER, SIMPLEXB_FRAGMENT_SHADER)
        this.simplexProgram.generateData(0, null)
    }

    draw(drawParams: DrawParams, cameraControls: CameraControls): void {
        this.simplexProgram.useProgram()
        this.simplexProgram.setUniform("u_time", drawParams.time, UNIFORM_TYPE.f)

        let modelMatrix = mat4.create()
        let trans = vec3.fromValues(0, 0, -0.05)
        mat4.translate(modelMatrix, modelMatrix, trans)
        this.simplexProgram.setUniform("u_matrix_model", modelMatrix, UNIFORM_TYPE.mat)

        if (!drawParams.hideNoise) {
            this.simplexProgram.useProgram()
            this.simplexProgram.setUniform("u_time", drawParams.time, UNIFORM_TYPE.f)
            this.simplexProgram.setUniform("u_z_layer", 0.1, UNIFORM_TYPE.f)
            this.simplexProgram.setUniform("u_screen_size", [GLUtils.resolution.x, GLUtils.resolution.y], UNIFORM_TYPE.fv)
            this.simplexProgram.setUniform("u_filter_visualization", drawParams.simplexViewState, UNIFORM_TYPE.f)

            this.simplexProgram.setUniform("u_matrix_view", cameraControls.viewMatrix, UNIFORM_TYPE.mat)
            this.simplexProgram.setUniform("u_matrix_projection", cameraControls.projMatrix, UNIFORM_TYPE.mat)

            this.simplexProgram.draw()
        }

        // reset to draw all
        this.simplexProgram.setUniform("u_filter_visualization", 0.0, UNIFORM_TYPE.f)

        //offscreen - do not forget to draw without matrix transformations
        GLUtils.setCustomViewport(drawParams.simplexTextureSize.x, drawParams.simplexTextureSize.y)

        this.simplexProgram.setUniform("u_matrix_view", cameraControls.particlesViewMatrix, UNIFORM_TYPE.mat)
        this.simplexProgram.setUniform("u_matrix_projection", cameraControls.orthoMatrix, UNIFORM_TYPE.mat)
        this.simplexProgram.setUniform("u_z_layer", drawParams.layer * 0.1, UNIFORM_TYPE.f)
        this.simplexProgram.setUniform("u_screen_size", [drawParams.simplexTextureSize.x, drawParams.simplexTextureSize.y], UNIFORM_TYPE.fv)

        if (!this.tempSimplexTexWrapper) {
            this.tempSimplexTexWrapper = GLUtils.createOffscreenTexture(drawParams.simplexTextureSize.x, drawParams.simplexTextureSize.y)
        } else {
            GLUtils.gl.bindTexture(GLUtils.gl.TEXTURE_2D, this.tempSimplexTexWrapper.targetTexture)
            GLUtils.gl.bindFramebuffer(GLUtils.gl.FRAMEBUFFER, this.tempSimplexTexWrapper.frameBuffer)
        }
        this.simplexProgram.draw()

        //save bottom texture for flow animation
        if (drawParams.layer == 1) {
            drawParams.defaultSimplexTexture = this.tempSimplexTexWrapper.targetTexture
        }
        drawParams.currentSimplexTexture = this.tempSimplexTexWrapper.targetTexture

        GLUtils.resetDrawingContext()
        GLUtils.setDefaultViewport()
    }

}