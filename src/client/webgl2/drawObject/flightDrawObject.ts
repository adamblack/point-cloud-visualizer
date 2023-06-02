import { mat4, vec3 } from "gl-matrix";
import { CameraControls } from "../cameraControls";
import { FLIGHT_VERTEX_SHADER, FLIGHT_FRAGMENT_SHADER } from "../flowShaders";
import { GLUtils } from "../glutils";
import { InterpolationHelper } from "../interpolationHelper";
import { FlightProgram } from "../program/flightProgram";
import { UNIFORM_TYPE } from "../program/program";
import { DrawObject, DrawParams } from "./drawObject";

export class FlightDrawObject implements DrawObject {

    flightProgram!: FlightProgram

    constructor(public interpolationHelper: InterpolationHelper) {
        this.setupPrograms()
    }
    
    setupPrograms(): void {
        this.flightProgram = new FlightProgram(GLUtils.gl, FLIGHT_VERTEX_SHADER, FLIGHT_FRAGMENT_SHADER, null, GLUtils.gl.TRIANGLE_STRIP)
        this.flightProgram.generateData(this.interpolationHelper.sampleSize * 2, null)
    }
    draw(drawParams: DrawParams, cameraControls: CameraControls): void {
        this.flightProgram.useProgram()
        this.flightProgram.setFlightIndexAndRegenerate(drawParams.flightIndex)//, this.interpolationHelper.sampleSize*2)

        let flightRedColor = 0
        if (drawParams.flightIndex == this.interpolationHelper.maxIndex) {
            flightRedColor = 1.0
        }
        this.flightProgram.setUniform("u_color_r", flightRedColor, UNIFORM_TYPE.f)
        let modelMatrix = mat4.create()
        let trans = vec3.fromValues(0, 0, 0.2)
        mat4.translate(modelMatrix, modelMatrix, trans)

        this.flightProgram.setUniform("u_matrix_model", modelMatrix, UNIFORM_TYPE.mat)
        this.flightProgram.setUniform("u_matrix_view", cameraControls.viewMatrix, UNIFORM_TYPE.mat)
        this.flightProgram.setUniform("u_matrix_projection", cameraControls.projMatrix, UNIFORM_TYPE.mat)
        this.flightProgram.draw()
    }
    
}