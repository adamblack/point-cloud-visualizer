import { CameraControls } from "../cameraControls";
import { SimplexDrawObject } from "./simplexDrawObject";
import { WebGLGUI } from "../webglgui";
import { VectorFieldDrawObject } from "./vectorFieldDrawObject";
import { FlowDrawObject } from "./flowDrawObject";
import { FlightHelper } from "../flightHelper";
import { FlightDrawObject } from "./flightDrawObject";
import { InterpolationHelper } from "../interpolationHelper";
import { Program } from "../program/program";
import { FlightVectorFieldDrawObject } from "./flightVectorFieldDrawObject";

// wrapper for anything that should be updated per frame
export class DrawObjectsWrapper {

    simplexDrawObject: SimplexDrawObject
    vectorFieldDrawObject: VectorFieldDrawObject
    flowDrawObject: FlowDrawObject
    flightDrawObject: FlightDrawObject
    flightVectorFieldDrawObject: FlightVectorFieldDrawObject

    constructor(public cameraControls: CameraControls, public webglgui: WebGLGUI, public drawParams: DrawParams, public interpolationHelper: InterpolationHelper) {
        this.simplexDrawObject = new SimplexDrawObject()
        this.vectorFieldDrawObject = new VectorFieldDrawObject()
        this.flowDrawObject = new FlowDrawObject(drawParams.particlesTextureSize)
        this.flightDrawObject = new FlightDrawObject(interpolationHelper)
        this.flightVectorFieldDrawObject = new FlightVectorFieldDrawObject(interpolationHelper)
    }


    draw() {
        this.drawParams.hideNoise = this.webglgui.guiOptions.hideNoise
        this.drawParams.simplexViewState = this.webglgui.simplexViewState
        for (let i = 1; i <= this.webglgui.guiOptions.layers; i++) {
            this.drawParams.layer = i
            this.simplexDrawObject.draw(this.drawParams, this.cameraControls)
            if (!this.webglgui.guiOptions.hideVectors) {
                this.vectorFieldDrawObject.draw(this.drawParams, this.cameraControls)
            }
        }

        if (this.webglgui.guiOptions.hideFlow == false) {
            this.flowDrawObject.draw(this.drawParams, this.cameraControls)
        }

        for (let i = 0; i < FlightHelper.flightPaths.length; i++) {
            this.drawParams.flightIndex = i
            this.flightDrawObject.draw(this.drawParams, this.cameraControls)
            if (!this.webglgui.guiOptions.hideVectors) {
                this.flightVectorFieldDrawObject.draw(this.drawParams, this.cameraControls)
            }
        }
    }
}

export interface DrawObject {
    setupPrograms() : void
    draw(drawParams: DrawParams, cameraControls: CameraControls) : void
}

// Simple shared data object in renderer
export class DrawParams {
    
    time = 0
    layer = 1
    flightIndex = 0
    //refactor to enum?
    simplexViewState = 0.0
    simplexTextureSize = {
        x: 100,
        y: 100
    }
    particlesTextureSize = {
        x: 0,
        y: 0
    }
    defaultSimplexTexture!: WebGLTexture
    currentSimplexTexture!: WebGLTexture
    hideNoise = true
    //reused program in pipeline
    fieldVectorProgram: Program | undefined

    constructor(public fieldVisualizationDensity: number) {

    }
}