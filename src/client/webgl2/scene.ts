import { GLUtils } from "./glutils"
import { WebGLGUI } from "./webglgui"
import { CameraControls } from "./cameraControls"
import { InterpolationHelper } from "./interpolationHelper"
import { FlightHelper } from "./flightHelper"
import { DrawObjectsWrapper, DrawParams } from "./drawObject/drawObject"

export class Scene {

    fieldVisualizationDensity = 20.0
    drawObjectsWrapper!: DrawObjectsWrapper
    drawParams!: DrawParams

    interpolationHelper!: InterpolationHelper
    cameraControls: CameraControls
    particlesTextureSize = {
        x: 100,
        y: 100
    }

    simplexTextureSize = {
        x: 100,
        y: 100
    }

    webglgui!: WebGLGUI

    constructor() {
        FlightHelper.init()
        this.interpolationHelper = new InterpolationHelper(20)
        this.webglgui = new WebGLGUI(this.interpolationHelper)
        GLUtils.setupScene()
        this.cameraControls = new CameraControls(this.webglgui)
    }

    setupPrograms() {

        this.particlesTextureSize = {
            x: GLUtils.resolution.x,
            y: GLUtils.resolution.y
        }

        this.drawParams = new DrawParams(this.fieldVisualizationDensity)
        this.drawParams.particlesTextureSize = this.particlesTextureSize
        this.drawObjectsWrapper = new DrawObjectsWrapper(this.cameraControls, this.webglgui, this.drawParams, this.interpolationHelper)
    }

    draw() {
        this.cameraControls.calculateViewMatrix()
        this.drawObjectsWrapper.draw()

        this.drawParams.time += 0.01
        requestAnimationFrame(() => this.draw())
    }

}