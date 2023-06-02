import { mat4, vec3 } from "gl-matrix";
import { CameraControls } from "../cameraControls";
import { SAMPLE_NOISE_VERTEX_SHADER, SAMPLE_NOISE_FRAGMENT_SHADER } from "../flowShaders";
import { GLUtils } from "../glutils";
import { InterpolationHelper } from "../interpolationHelper";
import { UNIFORM_TYPE } from "../program/program";
import { SampleSimplexProgram } from "../program/sampleSimplexProgram";
import { DrawObject, DrawParams } from "./drawObject";

export class FlightVectorFieldDrawObject implements DrawObject {

    sampleSimplexProgram!: SampleSimplexProgram

    constructor(public interpolationHelper: InterpolationHelper) {
        this.setupPrograms()
    }
    
    setupPrograms(): void {
        this.sampleSimplexProgram = new SampleSimplexProgram(GLUtils.gl, SAMPLE_NOISE_VERTEX_SHADER, SAMPLE_NOISE_FRAGMENT_SHADER, ["sampledValue"])
        this.sampleSimplexProgram.generateData(this.interpolationHelper.sampleSize, null)
    }
    draw(drawParams: DrawParams, cameraControls: CameraControls): void {
        // sample
        this.sampleSimplexProgram.useProgram()
        this.sampleSimplexProgram.setFlightIndexAndRegenerate(drawParams.flightIndex)
        this.sampleSimplexProgram.setUniform("u_time", drawParams.time, UNIFORM_TYPE.f)
        GLUtils.gl.enable(GLUtils.gl.RASTERIZER_DISCARD)
        GLUtils.gl.beginTransformFeedback(GLUtils.gl.POINTS);
        GLUtils.gl.drawArrays(GLUtils.gl.POINTS, 0, this.interpolationHelper.sampleSize + 1);
        GLUtils.gl.endTransformFeedback();
        GLUtils.gl.bindTransformFeedback(GLUtils.gl.TRANSFORM_FEEDBACK, null);

        // // turn on using fragment shaders again
        GLUtils.gl.disable(GLUtils.gl.RASTERIZER_DISCARD);

        // two angles in 2 planes + size of vector
        const results = new Float32Array(3 * (this.interpolationHelper.sampleSize + 1))
        GLUtils.gl.bindBuffer(GLUtils.gl.ARRAY_BUFFER, this.sampleSimplexProgram.buffers[0]);

        GLUtils.gl.getBufferSubData(
            GLUtils.gl.ARRAY_BUFFER,
            0,
            results,
        );

        this.interpolationHelper.createNoiseInterpolation(
            results.filter((element, index) => index % 3 == 0),
            results.filter((element, index) => index % 3 == 1),
            results.filter((element, index) => index % 3 == 2),
            drawParams.flightIndex
        )
        GLUtils.gl.bindBuffer(GLUtils.gl.ARRAY_BUFFER, null)


        // draw vectors
        drawParams.fieldVectorProgram!.useProgram()

        drawParams.fieldVectorProgram!.setUniform("u_fromTexel", 0.0, UNIFORM_TYPE.f)

        for (let i = 0; i < this.interpolationHelper.pathOriginalPoints[drawParams.flightIndex][0].length; i++) {

            drawParams.fieldVectorProgram!.setUniform("u_arrowXYAngleValue", this.interpolationHelper.fieldOriginalXYPoints[i], UNIFORM_TYPE.f)
            drawParams.fieldVectorProgram!.setUniform("u_arrowXZAngleValue", this.interpolationHelper.fieldOriginalXZPoints[i], UNIFORM_TYPE.f)
            drawParams.fieldVectorProgram!.setUniform("u_arrowSizeValue", this.interpolationHelper.fieldOriginalAbsSizePoints[i], UNIFORM_TYPE.f)

            let modelMatrix = mat4.create()
            mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(this.interpolationHelper.pathOriginalPoints[drawParams.flightIndex][0][i], this.interpolationHelper.pathOriginalPoints[drawParams.flightIndex][2][i], 0.2 + this.interpolationHelper.pathOriginalPoints[drawParams.flightIndex][1][i]))

            drawParams.fieldVectorProgram!.setUniform("u_matrix_model", modelMatrix, UNIFORM_TYPE.mat)

            drawParams.fieldVectorProgram!.draw()
        }
    }
    
}