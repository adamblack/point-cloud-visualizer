import * as THREE from 'three'
import * as geometryUtils from "./geometryUtil"

onmessage = (message) => {
    let geometry: THREE.BufferGeometry | undefined
    let imgMinZ: number = 100
    let imgMaxZ: number = -100
    
    const scenarioDataWrapper = new geometryUtils.ScenarioDataWrapper(message.data.imageData)

    switch(message.data.targetGeometry) {
        case 'Waifus': {
            geometry = geometryUtils.getActBufferGeometry(scenarioDataWrapper, message.data.stepsNumber)
            break
        }
        case 'Farm': {
            const generatedWrapper = geometryUtils.getFarmBufferGeometry(scenarioDataWrapper, message.data.centerPointToUpdate, message.data.targetGeometry)
            geometry = generatedWrapper.geometry
            imgMinZ = generatedWrapper.imgMinZ
            imgMaxZ = generatedWrapper.imgMaxZ
            break
        }
        case 'Koala': {
            geometry = geometryUtils.getKoalaBufferGeometry(scenarioDataWrapper, message.data.stepsNumber)
            break
        }
        case 'ai_images': {
            geometry = geometryUtils.getAIImagesBufferGeometry(scenarioDataWrapper, message.data.centerPointToUpdate, message.data.targetGeometry)
            break
        }
    }

    postMessage({geometry, centerPointToUpdate:  message.data.centerPointToUpdate, imgMinZ, imgMaxZ});
  }