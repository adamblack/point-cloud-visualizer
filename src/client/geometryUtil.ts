import * as THREE from 'three'

let grayscaleNormalizationSize = 10000
let colorSpaceNormalizationSize = 16777215 / 5
let aiImagesNormalizationSize = 30000

let POS_NUM = 3
let COL_NUM = 3
let UV_NUM = 2

export type GeneratedMeshWrapper = {
    geometry: THREE.BufferGeometry,
    imgMinZ: number,
    imgMaxZ: number
}

export function getFarmBufferGeometry(scenarioDataWrapper: ScenarioDataWrapper, imgCenterPoints: {[sceneType: string] : Array<THREE.Vector3>}, targetGeometry: string) : GeneratedMeshWrapper {
    
    const geometry = new THREE.BufferGeometry()
    const height = scenarioDataWrapper.getHeightOfFrame(0)
    const width = scenarioDataWrapper.getWidthOfFrame(0)
    const numOfPoints = width*height

    const pointUv = new Float32Array(numOfPoints*2);
    const pointsToRender = new Float32Array(numOfPoints*3);
    const pointsToRenderMapped = new Float32Array(numOfPoints*3);
    const pointsToRenderFlat = new Float32Array(numOfPoints*3);
    const pointsColors = new Float32Array(numOfPoints*3);

    let pointPointer = 0
    let imgMinZ: number = 100
    let imgMaxZ: number = -100
    
    let centerDepth = scenarioDataWrapper.getCenterValueAt(1)

    // Do not forget that we are adding 3 versions of the image
    imgCenterPoints[targetGeometry] = [
        new THREE.Vector3(0,0,centerDepth / grayscaleNormalizationSize),
        new THREE.Vector3(0,0,centerDepth / grayscaleNormalizationSize),
        new THREE.Vector3(0,0,centerDepth / grayscaleNormalizationSize)
    ]

    for(let i = 0; i < height; i++) {
        for(let j = 0; j < width; j++) {
        
            const u = i/width
            const v = j/width

            // Default view - depth map
            pointsToRender[pointPointer*3 + 1] = -u + (height/width)/2
            pointsToRender[pointPointer*3] = v - 0.5
            pointsToRender[pointPointer*3 + 2] = scenarioDataWrapper.getValueAt(1, i, j, pointPointer*4) / 30


            // values passed to vertex shader for parallax
            if (pointsToRender[pointPointer*3 + 2] < imgMinZ) {
                imgMinZ = pointsToRender[pointPointer*3 + 2]
            }
            if (pointsToRender[pointPointer*3 + 2] > imgMaxZ) {
                imgMaxZ = pointsToRender[pointPointer*3 + 2]
            }

            // Custom RGB mapping
            pointsToRenderMapped[pointPointer*3 + 1] = -u + (height/width)/2
            pointsToRenderMapped[pointPointer*3] = v - 0.5
            pointsToRenderMapped[pointPointer*3 + 2] = rgbToInt([scenarioDataWrapper.getValueAt(0, i, j, pointPointer*4, true, 0), scenarioDataWrapper.getValueAt(0, i, j, pointPointer*4 + 1, true, 1), scenarioDataWrapper.getValueAt(0, i, j, pointPointer*4 + 2, true, 2)]) / colorSpaceNormalizationSize

            // Standard image
            pointsToRenderFlat[pointPointer*3 + 1] = -u + (height/width)/2
            pointsToRenderFlat[pointPointer*3] = v - 0.5
            pointsToRenderFlat[pointPointer*3 + 2] = 0

            pointsColors[pointPointer*3] = scenarioDataWrapper.getValueAt(0, i, j, pointPointer*4, true, 0) / 255
            pointsColors[pointPointer*3 + 1] = scenarioDataWrapper.getValueAt(0, i, j, pointPointer*4 + 1, true, 1) / 255
            pointsColors[pointPointer*3 + 2] = scenarioDataWrapper.getValueAt(0, i, j, pointPointer*4 + 2, true, 2) / 255

            pointPointer++
        }
    }

    // if (this.guiWrapper.textureOptions.textureUsage) {
    //     geometry.setAttribute('uv', new THREE.BufferAttribute(pointUv, this.UV_NUM))
    // } else {
    //     geometry.setAttribute('color', new THREE.BufferAttribute(pointsColors, this.COL_NUM))
    // }
    geometry.setAttribute('color', new THREE.BufferAttribute(pointsColors, COL_NUM))
    geometry.setAttribute('position', new THREE.BufferAttribute(pointsToRender, POS_NUM))

    geometry.morphAttributes.position = []
    geometry.morphAttributes.color = []

    // // Add final destination image
    geometry.morphAttributes.position[0] = new THREE.BufferAttribute(pointsToRenderFlat, POS_NUM)
    geometry.morphAttributes.color[0] = new THREE.BufferAttribute(pointsColors, COL_NUM)

    geometry.morphAttributes.position[1] = new THREE.BufferAttribute(pointsToRenderMapped, POS_NUM)
    geometry.morphAttributes.color[1] = new THREE.BufferAttribute(pointsColors, COL_NUM)

    return {geometry, imgMinZ, imgMaxZ}
}


export function getKoalaBufferGeometry(scenarioDataWrapper: ScenarioDataWrapper, steps: number) : THREE.BufferGeometry {

    const arrayMorphOffset = 2

    const geometry = new THREE.BufferGeometry()

    const height = scenarioDataWrapper.getHeightOfFrame(0)
    const width = scenarioDataWrapper.getWidthOfFrame(0)
    const numOfPoints = width*height

    const pointsToRender = new Float32Array(numOfPoints*3);
    const pointsColors = new Float32Array(numOfPoints*3);
    const pointsToRenderMorph = new Float32Array(numOfPoints*3);
    const pointsColorsMorph = new Float32Array(numOfPoints*3);

    const pointsToRenderSteps : Array<Float32Array> = []
    const pointsColorsSteps : Array<Float32Array> = []
    let pointPointer = 0

    for(let i = 0; i < steps; i++) {
        pointsToRenderSteps[i] = new Float32Array(numOfPoints*3)
        pointsColorsSteps[i] = new Float32Array(numOfPoints*3)
    }

    for(let i = 0; i < height; i++) {
        for(let j = 0; j < width; j++) {
        
            const u = i/width
            const v = j/width
            const rOriginal = scenarioDataWrapper.getValueAt(0, i, j, pointPointer*4 + 0, true, 0)
            const gOriginal = scenarioDataWrapper.getValueAt(0, i, j, pointPointer*4 + 1, true, 1)
            const bOriginal = scenarioDataWrapper.getValueAt(0, i, j, pointPointer*4 + 2, true, 2)

            pointsToRender[pointPointer*3 + 1] = -u + (height/width)/2
            pointsToRender[pointPointer*3] = v - 0.5
            pointsToRender[pointPointer*3 + 2] = rgbToInt([rOriginal, gOriginal, bOriginal]) / colorSpaceNormalizationSize

            pointsColors[pointPointer*3] = rOriginal / 255
            pointsColors[pointPointer*3 + 1] = gOriginal / 255
            pointsColors[pointPointer*3 + 2] = bOriginal / 255


            for(let k = 0; k < steps; k++) {
                const rMorph = scenarioDataWrapper.getValueAt(k + arrayMorphOffset, i, j, pointPointer*4 + 0, true, 0)
                const gMorph = scenarioDataWrapper.getValueAt(k + arrayMorphOffset, i, j, pointPointer*4 + 1, true, 1)
                const bMorph = scenarioDataWrapper.getValueAt(k + arrayMorphOffset, i, j, pointPointer*4 + 2, true, 2)

                pointsToRenderSteps[k][pointPointer*3 + 1] = -u + (height/width)/2
                pointsToRenderSteps[k][pointPointer*3] = v - 0.5
                pointsToRenderSteps[k][pointPointer*3 + 2] = rgbToInt([rMorph, gMorph, bMorph]) / colorSpaceNormalizationSize

                pointsColorsSteps[k][pointPointer*3] = rMorph / 255
                pointsColorsSteps[k][pointPointer*3 + 1] = gMorph / 255
                pointsColorsSteps[k][pointPointer*3 + 2] = bMorph / 255
            }

            const rTarget = scenarioDataWrapper.getValueAt(1, i, j, pointPointer*4 + 0, true, 0)
            const gTarget = scenarioDataWrapper.getValueAt(1, i, j, pointPointer*4 + 1, true, 1)
            const bTarget = scenarioDataWrapper.getValueAt(1, i, j, pointPointer*4 + 2, true, 2)

            pointsToRenderMorph[pointPointer*3 + 1] = -u + (height/width)/2
            pointsToRenderMorph[pointPointer*3] = v - 0.5
            pointsToRenderMorph[pointPointer*3 + 2] = rgbToInt([rTarget, gTarget, bTarget]) / colorSpaceNormalizationSize

            pointsColorsMorph[pointPointer*3] = rTarget / 255
            pointsColorsMorph[pointPointer*3 + 1] = gTarget / 255
            pointsColorsMorph[pointPointer*3 + 2] = bTarget / 255

            pointPointer++
        }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(pointsToRender, POS_NUM))
    geometry.setAttribute('color', new THREE.BufferAttribute(pointsColors, COL_NUM))
    geometry.morphAttributes.position = []
    geometry.morphAttributes.color = []

    for(let i = 0; i < steps; i++) {
        geometry.morphAttributes.position[i] = new THREE.BufferAttribute( pointsToRenderSteps[i], POS_NUM)
        geometry.morphAttributes.color[i] = new THREE.BufferAttribute( pointsColorsSteps[i], COL_NUM)
    }

    // Add final destination image
    geometry.morphAttributes.position[steps] = new THREE.BufferAttribute(pointsToRenderMorph, POS_NUM)
    geometry.morphAttributes.color[steps] = new THREE.BufferAttribute(pointsColorsMorph, COL_NUM)

    return geometry
}

export function getAIImagesBufferGeometry(scenarioDataWrapper: ScenarioDataWrapper, imgCenterPoints: {[sceneType: string] : Array<THREE.Vector3>}, targetGeometry: string) : THREE.BufferGeometry {

    if (imgCenterPoints[targetGeometry] == undefined) {
        imgCenterPoints[targetGeometry] = []
    }

    const geometry = new THREE.BufferGeometry()

    const pointsToRender : Array<Float32Array> = []
    const pointsColors : Array<Float32Array> = []
    let pointPointer = 0

    let maxHeight = 0
    let maxWidth = 0
    const gallerySize = scenarioDataWrapper.getFramesCount()/2 
    for(let i = 0; i < gallerySize; i++) {
        maxHeight = Math.max(maxHeight, scenarioDataWrapper.getHeightOfFrame(2*i))
        maxWidth = Math.max(maxHeight, scenarioDataWrapper.getWidthOfFrame(2*i))
    }

    for(let k = 0; k < gallerySize; k++) {

        const height = scenarioDataWrapper.getHeightOfFrame(2*k)
        const width = scenarioDataWrapper.getWidthOfFrame(2*k)
        const numOfPoints = maxWidth*maxHeight
        
        imgCenterPoints[targetGeometry][k] = new THREE.Vector3(0, 0, scenarioDataWrapper.getCenterValueAt(2*k + 1) / aiImagesNormalizationSize)

        const heightDifference = maxHeight - height
        const widthDifference = maxWidth - width
        const heightOffset = Math.floor(heightDifference/2)
        const widthOffset = Math.floor(widthDifference/2)

        pointsToRender[k] = new Float32Array(numOfPoints*3)
        pointsColors[k] = new Float32Array(numOfPoints*3)

        for(let i = 0; i < maxHeight; i++) {
            for(let j = 0; j < maxWidth; j++) {

                const u = i/maxWidth
                const v = j/maxWidth

                if (j < widthOffset || j >= maxWidth - widthOffset - 1 || i < heightOffset || i >= maxHeight - heightOffset - 1) {
                    pointsToRender[k][pointPointer*3 + 1] = -u + (height/width)/2
                    pointsToRender[k][pointPointer*3] = v - 0.5
                    pointsToRender[k][pointPointer*3 + 2] = 0

                    pointsColors[k][pointPointer*3] = 0
                    pointsColors[k][pointPointer*3 + 1] = 0
                    pointsColors[k][pointPointer*3 + 2] = 0
                } else {
                    const iShiftedIndex = i - heightOffset
                    const jShiftedIndex = j - widthOffset

                    pointsToRender[k][pointPointer*3 + 1] = -u + (height/width)/2
                    pointsToRender[k][pointPointer*3] = v - 0.5
                    pointsToRender[k][pointPointer*3 + 2] = scenarioDataWrapper.getValueAt(2*k + 1, iShiftedIndex, jShiftedIndex, 4*(iShiftedIndex*width + jShiftedIndex)) / 40

                    pointsColors[k][pointPointer*3] = scenarioDataWrapper.getValueAt(2*k, iShiftedIndex, jShiftedIndex, 4*(iShiftedIndex*width + jShiftedIndex), true, 0) / 255
                    pointsColors[k][pointPointer*3 + 1] = scenarioDataWrapper.getValueAt(2*k, iShiftedIndex, jShiftedIndex, 4*(iShiftedIndex*width + jShiftedIndex) + 1, true, 1) / 255
                    pointsColors[k][pointPointer*3 + 2] = scenarioDataWrapper.getValueAt(2*k, iShiftedIndex, jShiftedIndex, 4*(iShiftedIndex*width + jShiftedIndex) + 2, true, 2) / 255
                }
                pointPointer++
            }
        }

        pointPointer = 0
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(pointsToRender[0], POS_NUM))
    geometry.setAttribute('color', new THREE.BufferAttribute(pointsColors[0], COL_NUM))

    if (pointsToRender.length > 1) {
        geometry.morphAttributes.position = []
        geometry.morphAttributes.color = []

        for(let i = 1; i < gallerySize; i++) {
            geometry.morphAttributes.position[i - 1] = new THREE.BufferAttribute( pointsToRender[i], POS_NUM)
            geometry.morphAttributes.color[i - 1] = new THREE.BufferAttribute( pointsColors[i], COL_NUM)
        }
    }

    return geometry
}


export function getActBufferGeometry(scenarioDataWrapper: ScenarioDataWrapper, steps: number) : THREE.BufferGeometry {

    const arrayMorphOffset = 4
    const geometry = new THREE.BufferGeometry()

    const height = scenarioDataWrapper.getHeightOfFrame(0)
    const width = scenarioDataWrapper.getWidthOfFrame(0)
    const numOfPoints = width*height

    const pointsToRender = new Float32Array(numOfPoints*3);
    const pointsColors = new Float32Array(numOfPoints*3);
    const pointsToRenderMorph = new Float32Array(numOfPoints*3);
    const pointsColorsMorph = new Float32Array(numOfPoints*3);

    const pointsToRenderSteps : Array<Float32Array> = []
    const pointsColorsSteps : Array<Float32Array> = []
    let pointPointer = 0

    for(let i = 0; i < steps; i++) {
        pointsToRenderSteps[i] = new Float32Array(numOfPoints*3)
        pointsColorsSteps[i] = new Float32Array(numOfPoints*3)
    }

    for(let i = 0; i < height; i++) {
        for(let j = 0; j < width; j++) {
        
            const u = i/width
            const v = j/width

            pointsToRender[pointPointer*3 + 1] = -u + (height/width)/2
            pointsToRender[pointPointer*3] = v - 0.5
            removeNoise(scenarioDataWrapper.getValueAt(1, i, j, pointPointer*4, false, 0, true), scenarioDataWrapper.getFrameRawDataAt(1), i, j, width, height, pointPointer, pointsToRender)

            pointsColors[pointPointer*3] = scenarioDataWrapper.getValueAt(0, i, j, pointPointer*4, true, 0) / 255
            pointsColors[pointPointer*3 + 1] = scenarioDataWrapper.getValueAt(0, i, j, pointPointer*4 + 1, true, 1) / 255
            pointsColors[pointPointer*3 + 2] = scenarioDataWrapper.getValueAt(0, i, j, pointPointer*4 + 2, true, 2) / 255


            for(let k = 0; k < steps; k++) {

                pointsToRenderSteps[k][pointPointer*3 + 1] = -u + (height/width)/2
                pointsToRenderSteps[k][pointPointer*3] = v - 0.5
                removeNoise(scenarioDataWrapper.getValueAt(arrayMorphOffset + steps + k, i, j, pointPointer*4, false, 0, true), scenarioDataWrapper.getFrameRawDataAt(arrayMorphOffset + steps + k), i, j, width, height, pointPointer, pointsToRenderSteps[k])

                pointsColorsSteps[k][pointPointer*3] = scenarioDataWrapper.getValueAt(k + arrayMorphOffset, i, j, pointPointer*4, true, 0) / 255
                pointsColorsSteps[k][pointPointer*3 + 1] = scenarioDataWrapper.getValueAt(k + arrayMorphOffset, i, j, pointPointer*4 + 1, true, 1) / 255
                pointsColorsSteps[k][pointPointer*3 + 2] = scenarioDataWrapper.getValueAt(k + arrayMorphOffset, i, j, pointPointer*4 + 2, true, 2) / 255
            }



            pointsToRenderMorph[pointPointer*3 + 1] = -u + (height/width)/2
            pointsToRenderMorph[pointPointer*3] = v - 0.5
            removeNoise(scenarioDataWrapper.getValueAt(3, i, j, pointPointer*4, false, 0, true), scenarioDataWrapper.getFrameRawDataAt(3), i, j, width, height, pointPointer, pointsToRenderMorph)

            pointsColorsMorph[pointPointer*3] = scenarioDataWrapper.getValueAt(2, i, j, pointPointer*4, true, 0) / 255
            pointsColorsMorph[pointPointer*3 + 1] = scenarioDataWrapper.getValueAt(2, i, j, pointPointer*4 + 1, true, 1) / 255
            pointsColorsMorph[pointPointer*3 + 2] = scenarioDataWrapper.getValueAt(2, i, j, pointPointer*4 + 2, true, 2) / 255

            pointPointer++
        }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(pointsToRender, POS_NUM))
    geometry.setAttribute('color', new THREE.BufferAttribute(pointsColors, COL_NUM))
    geometry.morphAttributes.position = []
    geometry.morphAttributes.color = []

    for(let i = 0; i < steps; i++) {
        geometry.morphAttributes.position[i] = new THREE.BufferAttribute( pointsToRenderSteps[i], POS_NUM)
        geometry.morphAttributes.color[i] = new THREE.BufferAttribute( pointsColorsSteps[i], COL_NUM)
    }

    // Add final destination image
    geometry.morphAttributes.position[steps] = new THREE.BufferAttribute(pointsToRenderMorph, POS_NUM)
    geometry.morphAttributes.color[steps] = new THREE.BufferAttribute(pointsColorsMorph, COL_NUM)

    return geometry
}

// util functions

function removeNoise(depthMapColor: number, depthmap: Array<Array<number>> | ImageData, i: number, j: number, width: number, height: number, pointPointer: number, pointsToRender: Float32Array) {
    if (depthMapColor != 0) {

        const percentage = depthMapColor/100
        let left = depthMapColor
        let right = depthMapColor
        let top = depthMapColor
        let down = depthMapColor
        const dropThreshold = 5*percentage

        if (!Array.isArray(depthmap)) {
            if (j > 0) left = (depthmap as ImageData).data[pointPointer*4-4]
            if (j < width - 1) right = (depthmap as ImageData).data[pointPointer*4+4]
            if (pointPointer - width > 0) top = (depthmap as ImageData).data[4*(pointPointer - width)]
            if (pointPointer + width < height*width-1) down = (depthmap as ImageData).data[4*(pointPointer + width)]
        } else {
            if (j > 0) left = depthmap[i][j-1]
            if (j < width-1) right = depthmap[i][j+1]
            if (i > 0) top = depthmap[i-1][j]
            if (i < height-1) down = depthmap[i+1][j]
        }
        
        if(Math.abs(left - depthMapColor) > dropThreshold || Math.abs(right - depthMapColor) > dropThreshold) {
            pointsToRender[pointPointer*3 + 2] = 0
        }
        else if(Math.abs(top - depthMapColor) > dropThreshold || Math.abs(down - depthMapColor) > dropThreshold) {
            pointsToRender[pointPointer*3 + 2] = 0
        } else {
            // extra scale
            if (!Array.isArray(depthmap)) {
                pointsToRender[pointPointer*3 + 2] = 10 + -1*depthMapColor / 20
            } else {
                pointsToRender[pointPointer*3 + 2] = 3*(1 - depthMapColor)
            }
        }
    }
}

function rgbToInt(color: Array<number>): number {
    let rbgInt = 0
    for(let c of color) {
        rbgInt = (rbgInt<<8) + c
    }

    return rbgInt
}

// Wrapper of frame data so we can merge geometry generation methods
export class ScenarioDataWrapper {

    parsedData: any[] = []

    constructor(public imageData: ImageData[] = [], public jsonData: any[] = [] ) {
        if (jsonData.length > 0) {
            for (let i = 0; i < jsonData.length; i++) {
                this.parsedData.push(JSON.parse(jsonData[i]))
            }
        }
    }

    getHeightOfFrame(frame: number) : number {
        if (this.imageData.length != 0) {
            return this.imageData[frame].height
        } else {
            return this.parsedData[frame].length
        }
    }

    getWidthOfFrame(frame: number) : number {
        if (this.imageData.length != 0) {
            return this.imageData[frame].width
        } else {
            return this.parsedData[frame][0].length
        }
    }

    getCenterValueAt(frame: number) : number {
        if (this.imageData.length != 0) {
            return this.imageData[frame].data[this.imageData[frame].width*this.imageData[frame].height*2]
        } else {
            return this.parsedData[frame][Math.floor(this.parsedData[frame].length/2)][Math.floor(this.parsedData[frame][0].length/2)]
        }
    }

    getValueAt(frame: number, height: number, width: number, index: number, isRgb = false, offset = 0, ignoreScale = false) : number {
        if (this.imageData.length != 0) {
            return this.imageData[frame].data[index]
        } else {
            if (isRgb) {
                return this.parsedData[frame][height][width][offset]
            } else {
                let scale = 330
                if (ignoreScale) {
                    scale = 1
                }
                return this.parsedData[frame][height][width] / scale
            }
        }
    }

    getFramesCount() : number {
        if (this.imageData.length != 0) {
            return this.imageData.length
        } else {
            return this.parsedData.length
        }
    }

    getFrameRawDataAt(frame: number) : ImageData | number[][] {
        if (this.imageData.length != 0) {
            return this.imageData[frame]
        } else {
            return this.parsedData[frame]
        }
    }
}