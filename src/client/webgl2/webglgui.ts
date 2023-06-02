import { GUI } from "dat.gui"
import { clamp } from "./glutils"
import { CameraFeedback } from "./cameraControls"
import { InterpolationHelper } from "./interpolationHelper"

export class WebGLGUI implements CameraFeedback {

    gui: GUI
    sceneSettingsFolder: GUI | undefined
    guiOptions: any

    simplexViewState = 0.0

    constructor(public interpolationHelper: InterpolationHelper) {
        this.gui = new GUI()

        this.guiOptions = {
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            moveX: 0,
            moveY: 0,
            moveZ: 1.5,
            layers: 1,
            hideFlow: false,
            hideVectors: false,
            zprojection: true,
            hideNoise: true,
            noiseOptions: "All",
            calculate: () => {
                this.interpolationHelper.calculateFieldWork()
            }
        }

        this.initDefaultGui()
    }

    initDefaultGui() {
        //General scene settings
        this.sceneSettingsFolder = this.gui.addFolder('Scene settings')
        this.sceneSettingsFolder.add(this.guiOptions, 'rotateX', 0, 80, 1).onChange(value => {
            
        })
        this.sceneSettingsFolder.add(this.guiOptions, 'rotateY', -90, 90, 1).onChange(value => {
            
        })
        this.sceneSettingsFolder.add(this.guiOptions, 'rotateZ', -180, 180, 1).onChange(value => {
            
        })
        this.sceneSettingsFolder.add(this.guiOptions, 'moveX', -1, 1, 0.01).onChange(value => {
            
        })
        this.sceneSettingsFolder.add(this.guiOptions, 'moveY', -1, 1, 0.01).onChange(value => {
            
        })
        this.sceneSettingsFolder.add(this.guiOptions, 'moveZ', 0, 20, 0.01).onChange(value => {
            
        })
        this.sceneSettingsFolder.add(this.guiOptions, 'layers', 1, 10, 1).onChange(value => {
            
        })
        this.sceneSettingsFolder.add(this.guiOptions, 'hideFlow').onChange(value => {
            
        })
        this.sceneSettingsFolder.add(this.guiOptions, 'hideVectors').onChange(value => {
            
        })
        this.sceneSettingsFolder.add(this.guiOptions, 'hideNoise').onChange(value => {
            
        })
        this.sceneSettingsFolder.add(this.guiOptions, 'zprojection').onChange(value => {
            
        })
        this.sceneSettingsFolder.add(this.guiOptions, 'calculate').onChange(value => {
            
        })

        this.sceneSettingsFolder.add(this.guiOptions, 'noiseOptions', [ 'All', 'XY angle', 'XZ angle', 'Abs Size' ] ).onChange(value => {
            switch (value) {
                case "All":
                    this.simplexViewState = 0.0
                    break;
                case "XY angle":
                    this.simplexViewState = 1.0
                    break;
                case "XZ angle":
                    this.simplexViewState = 2.0
                    break;
                case "Abs Size":
                    this.simplexViewState = 3.0
                    break;
                default:
                    break;
            }
        })
        this.sceneSettingsFolder.open()
    }

    shiftedBy(xShift: number, yShift: number): void {
        this.guiOptions.moveX += xShift
        this.guiOptions.moveY += yShift
    }
    zoomedBy(zoom: number): void {
        this.guiOptions.moveZ += zoom
    }

    //Updates of camera movement
    rotatedBy(xRotation: number, yRotation: number): void {
        this.guiOptions.rotateX += -yRotation
        this.guiOptions.rotateY += -xRotation

        this.guiOptions.rotateX = clamp(this.guiOptions.rotateX, 0, 90)
        this.guiOptions.rotateY = clamp(this.guiOptions.rotateY, -90, 90)
    }
}