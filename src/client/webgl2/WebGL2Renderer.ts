import { GLUtils } from "./glutils"
import { Logger } from "./logger"
import { Scene } from "./scene"

export class WebGL2Renderer {
    scene!: Scene

    init() {
        let canvas: HTMLCanvasElement = document.querySelector("#webgl2canvas")!
        let context = canvas.getContext("webgl2")

        if (context) {
            Logger.log("WebGL2 context ok")
            GLUtils.init(context, canvas)
            this.scene = new Scene()
            this.scene.setupPrograms()
            this.scene.draw()
        } else {
            Logger.log("WebGL2 context not available")
        }
    }
}