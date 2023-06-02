import { GLUtils } from "../glutils"

export abstract class Program {

    program: WebGLProgram
    primitiveType: number
    vertexCount = 0
    vaos: WebGLVertexArrayObject[]
    transformBuffers: WebGLTransformFeedback[]
    buffers: WebGLBuffer[]
    attributeBuffer = new Map<string, WebGLBuffer>()

    flipVaos = false
    flipIndex = 0
    prg = ""

    constructor(gl: WebGL2RenderingContext, sourceVertex: string, sourceFragment: string, transformFeedbackVaryings: [string] | null = null, primitiveType: number = GLUtils.gl.TRIANGLES) {
        let vertexShader = GLUtils.compileShader(GLUtils.gl.VERTEX_SHADER, sourceVertex)!
        let fragmentShader = GLUtils.compileShader(GLUtils.gl.FRAGMENT_SHADER, sourceFragment)!
        this.program = GLUtils.linkProgram(vertexShader, fragmentShader, transformFeedbackVaryings)!

        this.vaos = Array<WebGLVertexArrayObject>()
        this.transformBuffers = Array<WebGLTransformFeedback>()
        this.buffers = Array<WebGLBuffer>()
        this.primitiveType = primitiveType
    }

    useProgram() {

        GLUtils.gl.useProgram(this.program)

        // ping pong used for transform buffers
        GLUtils.gl.bindVertexArray(this.vaos[this.flipIndex])

        if (this.transformBuffers && this.transformBuffers.length > 1) {
            GLUtils.gl.bindTransformFeedback(GLUtils.gl.TRANSFORM_FEEDBACK, this.transformBuffers[(this.flipIndex + 1) % 2])
        } else if (this.transformBuffers) {
            GLUtils.gl.bindTransformFeedback(GLUtils.gl.TRANSFORM_FEEDBACK, this.transformBuffers[0])
        }

        if (this.flipVaos) {
            this.flipIndex = (this.flipIndex + 1) % 2
        }
    }

    bindCurrentVao() {
        GLUtils.gl.bindVertexArray(this.vaos[this.flipIndex])
    }

    setAttributes(attributes: AttributeWrapper[]) {
        let vao = GLUtils.gl.createVertexArray()
        this.vaos.push(vao!)
        GLUtils.gl.bindVertexArray(vao)

        attributes.forEach(attribute => {
            let attributeLocation = GLUtils.gl.getAttribLocation(this.program, attribute.name)
            let buffer = null
            
            if (attribute.customBuffer) {
                buffer = attribute.customBuffer
                GLUtils.gl.bindBuffer(GLUtils.gl.ARRAY_BUFFER, buffer)
            } else {
                buffer = GLUtils.gl.createBuffer()
                GLUtils.gl.bindBuffer(GLUtils.gl.ARRAY_BUFFER, buffer)
                GLUtils.gl.bufferData(GLUtils.gl.ARRAY_BUFFER, attribute.data, attribute.bufferUsage)
                this.attributeBuffer.set(attribute.name, buffer!)
            }
            
            GLUtils.gl.enableVertexAttribArray(attributeLocation)

            // might be added as a param
            let normalize = false;
            let stride = 0;
            let offset = 0;
            GLUtils.gl.vertexAttribPointer(attributeLocation, attribute.size, attribute.type, normalize, stride, offset)

            if(attribute.transform) {
                this.buffers.push(buffer!)
            }
            
        })
    }

    //Updates attribute's buffer if created before
    updateAttribute(attribute: AttributeWrapper) {
        GLUtils.gl.bindBuffer(GLUtils.gl.ARRAY_BUFFER, this.attributeBuffer.get(attribute.name)!)

        GLUtils.gl.bufferSubData(GLUtils.gl.ARRAY_BUFFER, 0, attribute.data!)
        GLUtils.gl.bindBuffer(GLUtils.gl.ARRAY_BUFFER, null);
    }

    // TODO : inspect index i, possible bug
    setTransform() {
        this.buffers.forEach(buffer => {
                const tf = GLUtils.gl.createTransformFeedback();
                GLUtils.gl.bindTransformFeedback(GLUtils.gl.TRANSFORM_FEEDBACK, tf);
                GLUtils.gl.bindBufferBase(GLUtils.gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer);
                this.transformBuffers.push(tf!)
            
        });
    }

    setUniform(name: string, data: any, type: UNIFORM_TYPE) {
        let uniformLocation = GLUtils.gl.getUniformLocation(this.program, name);
        switch (type) {
            case UNIFORM_TYPE.f:
                GLUtils.gl.uniform1f(uniformLocation, data)
                break;
            case UNIFORM_TYPE.fv:
                GLUtils.gl.uniform2fv(uniformLocation, data)
                break;
            case UNIFORM_TYPE.iv:
                GLUtils.gl.uniform2iv(uniformLocation, data)
                break;
            case UNIFORM_TYPE.mat:
                GLUtils.gl.uniformMatrix4fv(uniformLocation, false, data)
                break;
            default:
                break;
        }
    }

    makeTransformFeedback() {

    }
    
    abstract generateData(numOfParts: number, customBuffers: WebGLBuffer[] | null) : void

    draw() {
        let offset = 0
        GLUtils.gl.drawArrays(this.primitiveType, offset, this.vertexCount)
    }
}

export enum UNIFORM_TYPE {
    f, fv, mat, iv
}

export class AttributeWrapper {
    constructor(public name: string, public data: Float32Array | null, public size: number, public type: any, public bufferUsage: any = GLUtils.gl.STATIC_DRAW, public transform: boolean = false, public customBuffer: WebGLBuffer | null = null) {

    }
}