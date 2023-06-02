import { mat4, vec3 } from "gl-matrix"
import { GLUtils } from "./glutils"
import { WebGLGUI } from "./webglgui"

export class CameraControls {

    cameraFeedback: WebGLGUI
    inDrag = false
    shiftActive = false
    initDown = {
        x: 0, y: 0
    }

    projMatrix: mat4
    orthoMatrix: mat4
    viewMatrix: mat4
    particlesViewMatrix!: mat4
    identMatrix = mat4.create()

    constructor(cameraFeedback: WebGLGUI) {
        this.cameraFeedback = cameraFeedback

        GLUtils.canvas.addEventListener("mousedown", (e) => this.mouseDown(e))
        GLUtils.canvas.addEventListener("mouseup", (e) => this.mouseUp(e))
        GLUtils.canvas.addEventListener("mouseout", (e) => this.mouseUp(e))
        GLUtils.canvas.addEventListener("mousemove", (e) => this.mouseMove(e))
        GLUtils.canvas.addEventListener("wheel", (e) => this.wheel(e))

        this.projMatrix = mat4.create()
        mat4.perspectiveNO(this.projMatrix, GLUtils.degToRad(70), GLUtils.getAspectRatio(), 0.001, 10)
        this.orthoMatrix = mat4.create()
        mat4.orthoNO(this.orthoMatrix, -1, 1, -1, 1, 0.1, 2)
        this.viewMatrix = mat4.create()
        this.calculateViewMatrix()
    }

    calculateViewMatrix() {
        let clean = mat4.create()
        let trans = vec3.create()
        trans[0] = this.cameraFeedback.guiOptions.moveX
        trans[1] = this.cameraFeedback.guiOptions.moveY
        trans[2] = this.cameraFeedback.guiOptions.moveZ
        mat4.rotateX(clean, clean, GLUtils.degToRad(this.cameraFeedback.guiOptions.rotateX))
        mat4.rotateY(clean, clean, GLUtils.degToRad(this.cameraFeedback.guiOptions.rotateY))
        mat4.rotateZ(clean, clean, GLUtils.degToRad(this.cameraFeedback.guiOptions.rotateZ))
        mat4.translate(clean, clean, trans)

        mat4.invert(clean, clean)
        this.viewMatrix = clean

        if (!this.particlesViewMatrix) {
            this.particlesViewMatrix = mat4.clone(this.viewMatrix)
        }
    }

    mouseDown(mouseEvent: any) {
        this.inDrag = true
        this.initDown = {
            x: mouseEvent.clientX,
            y: mouseEvent.clientY
        }

        this.shiftActive = mouseEvent.shiftKey
        mouseEvent.preventDefault()
        return false
    }

    private mouseUp(mouseEvent: any) {
        this.inDrag = false
        this.shiftActive = false
    }

    mouseMove(mouseEvent: any) {
        if (!this.inDrag) {
            return false
        }

        let deltaX = (mouseEvent.clientX - this.initDown.x) / 5
        let deltaY = (mouseEvent.clientY - this.initDown.y) / 5
        this.initDown = {
            x: mouseEvent.clientX,
            y: mouseEvent.clientY
        }

        if (this.shiftActive) {
            this.cameraFeedback.shiftedBy(-deltaX * 0.01, deltaY * 0.01)
        } else {
            this.cameraFeedback.rotatedBy(deltaX, deltaY)
        }
        
        mouseEvent.preventDefault()
    }

    wheel(mouseEvent: any) {
        this.cameraFeedback.zoomedBy(Math.sign(mouseEvent.deltaY) * 0.1)
        mouseEvent.preventDefault()
    }

}

export interface CameraFeedback {
    rotatedBy(xRotation: number, yRotation: number) : void
    zoomedBy(zoom: number) : void
    shiftedBy(xShift: number, yShift: number) : void
}