import { Logger } from "./logger"

export class GLUtils {

    static gl: WebGL2RenderingContext
    static canvas: HTMLCanvasElement
    static resolution = {
        x: window.innerWidth,
        y: window.innerHeight
    }

    static init(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
        this.gl = gl
        this.canvas = canvas

        this.setDimensions()
    }

    private static setDimensions() {
        const dpr = window.devicePixelRatio;
        this.canvas!.height = Math.round(this.resolution.y*dpr)
        this.canvas!.width = Math.round(this.resolution.x*dpr)
    }

    static getAspectRatio() : number {
        return this.resolution.x / this.resolution.y
    }

    static setupScene() {
        this.setDefaultViewport()

        this.gl.clearColor(0, 0, 0, 1)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)
        this.gl.enable(this.gl.DEPTH_TEST)
    }

    static setDefaultViewport() {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
    }

    static setCustomViewport(width: number, height: number) {
        this.gl.viewport(0, 0, width, height)
    }
    
    static compileShader(type: any, source: string) : WebGLShader | null {
        let shader = this.gl.createShader(type)

        if (!shader) {
            Logger.log("Shader not created")
        } else {
            this.gl.shaderSource(shader, source)
            this.gl.compileShader(shader)
            const shaderStatus = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)

            if (shaderStatus) {
                Logger.log("Shader created")
                return shader
            }
        }

        return null

    }

    static linkProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader, transformFeedbackVaryings: [string] | null = null) : WebGLProgram | null {
        let program = this.gl.createProgram()

        if (!program) {
            Logger.log("Shader not created")
        } else {
            this.gl.attachShader(program, vertexShader)
            this.gl.attachShader(program, fragmentShader)

            if (transformFeedbackVaryings) {
                this.gl.transformFeedbackVaryings(program, transformFeedbackVaryings, this.gl.SEPARATE_ATTRIBS)
            }

            this.gl.linkProgram(program)

            const programStatus = this.gl.getProgramParameter(program, this.gl.LINK_STATUS)

            if (programStatus) {
                Logger.log("Program created")
                return program
            }
        }
        
        this.gl.deleteProgram(program)
        return null
    }

    static bindTexture(texture: WebGLTexture) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
    }

    static createOffscreenTexture(targetTextureWidth: number, targetTextureHeight: number) : OffTextureData {
        let targetTexture = this.gl.createTexture()!;
        this.gl.bindTexture(this.gl.TEXTURE_2D, targetTexture);

        let level = 0;
        let internalFormat = this.gl.RGBA
        let border = 0
        let format = this.gl.RGBA
        let typeTex = this.gl.UNSIGNED_BYTE
        let data = null
        this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
            targetTextureWidth, targetTextureHeight, border,
            format, typeTex, data)

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)

        const fb = this.gl.createFramebuffer()
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb)

        const attachmentPoint = this.gl.COLOR_ATTACHMENT0
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachmentPoint, this.gl.TEXTURE_2D, targetTexture, level)

        this.gl.clearColor(1, 1, 1, 1)
        this.gl.viewport(0, 0, targetTextureWidth, targetTextureHeight)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

        return new OffTextureData(targetTexture, fb!)
    }

    static createTexture(targetTextureWidth: number, targetTextureHeight: number, data: Uint8Array) : WebGLTexture {
        let targetTexture = this.gl.createTexture()!;
        this.gl.bindTexture(this.gl.TEXTURE_2D, targetTexture);

        let level = 0;
        let internalFormat = this.gl.RGBA
        let border = 0
        let format = this.gl.RGBA
        let typeTex = this.gl.UNSIGNED_BYTE
        this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
            targetTextureWidth, targetTextureHeight, border,
            format, typeTex, data)

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)

        return targetTexture
    }

    static resetDrawingContext() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }

    static degToRad(deg : number) : number {
        return deg*Math.PI/180
    }
}

export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max)

export class OffTextureData {
    constructor(public targetTexture: WebGLTexture, public frameBuffer: WebGLFramebuffer) {}
}