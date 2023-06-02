import { CloudPointRenderer } from './cloudPointRenderer'
import { WebGL2Renderer } from './webgl2/WebGL2Renderer'

// Point cloud project
// const cloudPointRenderer = new CloudPointRenderer()
// cloudPointRenderer.start()

// Vector field project
const webGL2Renderer = new WebGL2Renderer()
webGL2Renderer.init()