import { mat4, vec3 } from "gl-matrix";
import { CameraControls } from "../cameraControls";
import { FLOW_STEP_VERTEX_SHADER, FLOW_STEP_FRAGMENT_SHADER, FLOW_DRAW_VERTEX_SHADER, FLOW_DRAW_FRAGMENT_SHADER, FLOW_HISTORY_VERTEX_SHADER, FLOW_HISTORY_FRAGMENT_SHADER } from "../flowShaders";
import { GLUtils, OffTextureData } from "../glutils";
import { FlowCalculationProgram } from "../program/flowCalculationProgram";
import { FlowHistoryProgram } from "../program/flowHistoryProgram";
import { UpdateFlowProgram } from "../program/flowUpdateProgram";
import { Program, UNIFORM_TYPE } from "../program/program";
import { DrawObject, DrawParams } from "./drawObject";

export class FlowDrawObject implements DrawObject {

    flowUpdateProgram!: Program
    flowCurrentProgram!: Program
    flowHistoryProgram!: Program

    particlesOffTextureData1!: OffTextureData
    particlesOffTextureData2!: OffTextureData
    particleCount: number = 20000
    particleSpeed: number = 0.001

    constructor(public particlesTextureSize: any) {
        this.setupPrograms()
    }
    
    setupPrograms(): void {
        // Flow vizualization - calculations
        this.flowUpdateProgram = new UpdateFlowProgram(GLUtils.gl, FLOW_STEP_VERTEX_SHADER, FLOW_STEP_FRAGMENT_SHADER, ["newPosition"])
        this.flowUpdateProgram.generateData(this.particleCount, null)

        // Flow vizualization - output particles
        this.flowCurrentProgram = new FlowCalculationProgram(GLUtils.gl, FLOW_DRAW_VERTEX_SHADER, FLOW_DRAW_FRAGMENT_SHADER)
        this.flowCurrentProgram.generateData(0, this.flowUpdateProgram.buffers)

        // Flow vizualization - output history texture
        this.particlesOffTextureData1 = GLUtils.createOffscreenTexture(this.particlesTextureSize.x, this.particlesTextureSize.y)
        GLUtils.resetDrawingContext()

        this.particlesOffTextureData2 = GLUtils.createOffscreenTexture(this.particlesTextureSize.x, this.particlesTextureSize.y)
        GLUtils.resetDrawingContext()

        // FlowHistoryProgram
        this.flowHistoryProgram = new FlowHistoryProgram(GLUtils.gl, FLOW_HISTORY_VERTEX_SHADER, FLOW_HISTORY_FRAGMENT_SHADER)
        this.flowHistoryProgram.generateData(0, null)
    }

    draw(drawParams: DrawParams, cameraControls: CameraControls): void {
        //drawFlowParticles
        this.flowUpdateProgram.useProgram()
        GLUtils.bindTexture(drawParams.defaultSimplexTexture)
        
        this.flowUpdateProgram.setUniform("u_time_delta", this.particleSpeed, UNIFORM_TYPE.f)
        this.flowUpdateProgram.setUniform("u_noise_size", [drawParams.simplexTextureSize.x, drawParams.simplexTextureSize.y], UNIFORM_TYPE.iv)

        GLUtils.gl.enable(GLUtils.gl.RASTERIZER_DISCARD)
        GLUtils.gl.beginTransformFeedback(GLUtils.gl.POINTS);
        GLUtils.gl.drawArrays(GLUtils.gl.POINTS, 0, this.particleCount);
        GLUtils.gl.endTransformFeedback();
        GLUtils.gl.bindTransformFeedback(GLUtils.gl.TRANSFORM_FEEDBACK, null);
        GLUtils.gl.disable(GLUtils.gl.RASTERIZER_DISCARD);

        //drawFlowToTexture
        GLUtils.setCustomViewport(this.particlesTextureSize.x, this.particlesTextureSize.y)
        this.flowHistoryProgram.useProgram()

        this.flowHistoryProgram.setUniform("u_matrix_model", cameraControls.identMatrix, UNIFORM_TYPE.mat)
        this.flowHistoryProgram.setUniform("u_matrix_view", cameraControls.particlesViewMatrix, UNIFORM_TYPE.mat)
        this.flowHistoryProgram.setUniform("u_matrix_projection", cameraControls.orthoMatrix, UNIFORM_TYPE.mat)
        this.flowHistoryProgram.setUniform("u_dimming_ratio", 0.99, UNIFORM_TYPE.f)
        GLUtils.bindTexture(this.particlesOffTextureData2.targetTexture)

        GLUtils.gl.bindFramebuffer(GLUtils.gl.FRAMEBUFFER, this.particlesOffTextureData1.frameBuffer)
        GLUtils.gl.framebufferTexture2D(GLUtils.gl.FRAMEBUFFER, GLUtils.gl.COLOR_ATTACHMENT0, GLUtils.gl.TEXTURE_2D, this.particlesOffTextureData1.targetTexture, 0)
        this.flowHistoryProgram.draw()

        //draw new points with updated position with non-dimmed alpha
        this.flowCurrentProgram.useProgram()

        this.flowCurrentProgram.setUniform("u_matrix_model", cameraControls.identMatrix, UNIFORM_TYPE.mat)
        this.flowCurrentProgram.setUniform("u_matrix_view", cameraControls.particlesViewMatrix, UNIFORM_TYPE.mat)
        this.flowCurrentProgram.setUniform("u_matrix_projection", cameraControls.orthoMatrix, UNIFORM_TYPE.mat)

        GLUtils.gl.bindFramebuffer(GLUtils.gl.FRAMEBUFFER, this.particlesOffTextureData1.frameBuffer)
        GLUtils.gl.framebufferTexture2D(GLUtils.gl.FRAMEBUFFER, GLUtils.gl.COLOR_ATTACHMENT0, GLUtils.gl.TEXTURE_2D, this.particlesOffTextureData1.targetTexture, 0)
        GLUtils.gl.drawArrays(GLUtils.gl.POINTS, 0, this.particleCount);

        GLUtils.resetDrawingContext()
        GLUtils.setDefaultViewport()

        this.flowHistoryProgram.useProgram()
        let modelMatrix = mat4.create()
        let trans = vec3.fromValues(0, 0, 0.05)
        mat4.translate(modelMatrix, modelMatrix, trans)

        this.flowHistoryProgram.setUniform("u_matrix_model", modelMatrix, UNIFORM_TYPE.mat)
        this.flowHistoryProgram.setUniform("u_matrix_view", cameraControls.viewMatrix, UNIFORM_TYPE.mat)
        this.flowHistoryProgram.setUniform("u_matrix_projection", cameraControls.projMatrix, UNIFORM_TYPE.mat)
        this.flowHistoryProgram.setUniform("u_dimming_ratio", 1.0, UNIFORM_TYPE.f)
        GLUtils.bindTexture(this.particlesOffTextureData1.targetTexture)

        this.flowHistoryProgram.draw()

        let tmpOffInfo = this.particlesOffTextureData1
        this.particlesOffTextureData1 = this.particlesOffTextureData2
        this.particlesOffTextureData2 = tmpOffInfo
    }
    
}