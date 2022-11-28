import { GuiWrapper } from "./guiWrapper"
import * as THREE from 'three'
import * as SHADERS from './shader'
import { Api, ASSET_TYPE } from "./api"
import * as geometryUtils from "./geometryUtil"

export class GeometryHelper {

    steps = 10
    imgCenterPoints: {[sceneType: string] : Array<THREE.Vector3>}= {}
    imgMinZ: number = 100
    imgMaxZ: number = -100
    api = new Api()
    
    // true and false - prod
    // true | false and true - dev -> i.e. provide images from your server in api pathPrefix settings
    // do not forget to edit imports
    useLocalAssets = true
    useRawData = false

    // if true, mesh generation is offloaded to worker and useLocalAssets/useRawData is ignored
    // used in prod, behaves like useLocalAssets = true, useRawData = false
    useWorker = true
    
    constructor(public guiWrapper: GuiWrapper, public parallaxUniforms: any) {

    }

    // Method used for local setting - main thread
    async generatePoints() : Promise<THREE.Points | THREE.Mesh>{
        let geometry: THREE.BufferGeometry | undefined
        this.steps = 10
        
        const target = this.guiWrapper.renderingType?.getValue()
        switch(target) {
            case 'Waifus': {
                if (this.useRawData) {
                    const imageJsons = await this.api.getAssets(this.steps, ASSET_TYPE.ACT, this.useLocalAssets)
                    geometry = geometryUtils.getActBufferGeometry(new geometryUtils.ScenarioDataWrapper([], imageJsons), this.steps)
                } else {
                    let textures : any[] = await this.api.fetchImages(0, ASSET_TYPE.ACT, true);
                    let imageData = await this.textureToImageData(textures)
                    geometry = geometryUtils.getActBufferGeometry(new geometryUtils.ScenarioDataWrapper(imageData), this.steps)
                }
                this.guiWrapper.updateFrameCounter(this.steps + 1)
                break
            }
            case 'Farm': {
                let generatedWrapper : geometryUtils.GeneratedMeshWrapper
                if (this.useRawData) {
                    const imageJsons = await this.api.getAssets(0, ASSET_TYPE.FARM, this.useLocalAssets)
                    generatedWrapper = geometryUtils.getFarmBufferGeometry(new geometryUtils.ScenarioDataWrapper([], imageJsons), this.imgCenterPoints, target)
                } else {
                    let textures : any[] = await this.api.fetchImages(0, ASSET_TYPE.FARM, true);
                    let imageData = await this.textureToImageData(textures)
                    generatedWrapper = geometryUtils.getFarmBufferGeometry(new geometryUtils.ScenarioDataWrapper(imageData), this.imgCenterPoints, target)
                }
                geometry = generatedWrapper.geometry
                this.imgMinZ = generatedWrapper.imgMinZ
                this.imgMaxZ = generatedWrapper.imgMaxZ
                this.guiWrapper.updateFrameCounter(2)
                break
            }
            case 'Koala': {
                if (this.useRawData) {
                    const imageJsons = await this.api.getAssets(this.steps, ASSET_TYPE.KOALA, this.useLocalAssets)
                    geometry = geometryUtils.getKoalaBufferGeometry(new geometryUtils.ScenarioDataWrapper([], imageJsons), this.steps)
                } else {
                    let textures : any[] = await this.api.fetchImages(0, ASSET_TYPE.KOALA, true);
                    let imageData = await this.textureToImageData(textures)
                    geometry = geometryUtils.getKoalaBufferGeometry(new geometryUtils.ScenarioDataWrapper(imageData), this.steps)
                }
                this.guiWrapper.updateFrameCounter(this.steps + 1)
                break
            }
            case 'ai_images': {
                if (this.useRawData) {
                    const imageJsons = await this.api.getAssets(0, ASSET_TYPE.AI, this.useLocalAssets)
                    geometry = geometryUtils.getAIImagesBufferGeometry(new geometryUtils.ScenarioDataWrapper([], imageJsons), this.imgCenterPoints, target)
                } else {
                    let textures : any[] = await this.api.fetchImages(0, ASSET_TYPE.AI, true);
                    let imageData = await this.textureToImageData(textures)
                    geometry = geometryUtils.getAIImagesBufferGeometry(new geometryUtils.ScenarioDataWrapper(imageData), this.imgCenterPoints, target)
                }
                this.guiWrapper.updateFrameCounter(this.api.aiAssetsList.length/2 - 1)
                break
            }
        }
        
        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: this.parallaxUniforms,
            vertexShader: SHADERS.VERTEX_SHADER,
            fragmentShader: SHADERS.FRAGMENT_SHADER
        })
    
        //Cache in case of heavy/default usage
        if (this.guiWrapper.textureOptions.textureUsage) {
            const loadedTexture = new THREE.TextureLoader().load( 'http://127.0.0.1:8081/images/house/houseapic.jpg' );
            shaderMaterial.uniforms.u_texture.value = loadedTexture
        }
        shaderMaterial.uniforms.u_use_texture.value = this.guiWrapper.textureOptions.textureUsage
        shaderMaterial.uniforms.u_minZ.value = this.imgMinZ
        shaderMaterial.uniforms.u_maxZ.value = this.imgMaxZ
    
        return new THREE.Points(geometry, shaderMaterial);
    }

    // Method used for prod setting - geometry creation in Webworker
    async generatePointsByWorker() : Promise<{mesh: THREE.Points | THREE.Mesh, centerPositions: {[sceneType: string] : Array<THREE.Vector3>}, minZ: number, maxZ: number}>{
        let geometry: THREE.BufferGeometry | undefined
        this.steps = 10

        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: this.parallaxUniforms,
            vertexShader: SHADERS.VERTEX_SHADER,
            fragmentShader: SHADERS.FRAGMENT_SHADER
        })
    
        //Cache in case of heavy/default usage
        if (this.guiWrapper.textureOptions.textureUsage) {
            const loadedTexture = new THREE.TextureLoader().load( 'http://127.0.0.1:8081/images/house/houseapic.jpg' );
            shaderMaterial.uniforms.u_texture.value = loadedTexture
        }
        shaderMaterial.uniforms.u_use_texture.value = this.guiWrapper.textureOptions.textureUsage

        let textures : any[] | undefined
        let targetGeometry = this.guiWrapper.renderingType?.getValue()
        let stepsNumber = this.steps
        let centerPointToUpdate = this.imgCenterPoints

        switch(targetGeometry) {
            case 'Waifus': {
                textures = await this.api.fetchImages(this.steps, ASSET_TYPE.ACT, true);
                this.guiWrapper.updateFrameCounter(this.steps + 1)
                break
            }
            case 'Farm': {
                textures = await this.api.fetchImages(0, ASSET_TYPE.FARM, true);
                this.guiWrapper.updateFrameCounter(2)
                break
            }
            case 'Koala': {
                textures = await this.api.fetchImages(this.steps, ASSET_TYPE.KOALA, true);
                this.guiWrapper.updateFrameCounter(this.steps + 1)
                break
            }
            case 'ai_images': {
                textures = await this.api.fetchImages(0, ASSET_TYPE.AI, true);
                this.guiWrapper.updateFrameCounter(7)
                break
            }
        }

        let imageData = await this.textureToImageData(textures!)

        let geometryPromise = new Promise<{mesh: THREE.Points | THREE.Mesh, centerPositions: {[sceneType: string] : Array<THREE.Vector3>}, minZ: number, maxZ: number}>(function(resolve, reject) {
            let worker = new Worker(new URL('worker.ts', import.meta.url))
            worker.postMessage({imageData, targetGeometry, stepsNumber, centerPointToUpdate});
            worker.onmessage = function(event){
                const workerGeometry = event.data.geometry
                const geometry = new THREE.BufferGeometry()
            
                for ( let attributeName of Object.keys( workerGeometry.attributes ) ) {
    
                    const workerAttribute = workerGeometry.attributes[ attributeName ]
            
                    const attribute = new THREE.BufferAttribute(
                        workerAttribute.array,
                        workerAttribute.itemSize,
                        false
                    );
            
                    geometry.setAttribute( attributeName, attribute )
            
                }
                
                geometry.morphAttributes.position = []
                geometry.morphAttributes.color = []

                for ( let attributeName of Object.keys( workerGeometry.morphAttributes ) ) {
                    for ( let i = 0; i < workerGeometry.morphAttributes[ attributeName ].length; i++ ) {
                        
                        const workerAttribute = workerGeometry.morphAttributes[ attributeName ][i];
                
                        const attribute = new THREE.BufferAttribute(
                            workerAttribute.array,
                            workerAttribute.itemSize,
                            false
                        )
                        geometry.morphAttributes[attributeName][i] = attribute
                    }
                }

                const points = new THREE.Points(geometry, shaderMaterial)
                resolve({mesh: points, centerPositions: event.data.centerPointToUpdate, minZ: event.data.imgMinZ, maxZ: event.data.imgMaxZ});
            }
        })

        return geometryPromise
        
    }

    async textureToImageData(textures: THREE.Texture[]) : Promise<ImageData[]> {
        let imageData: ImageData[] = [] 
        const canvas = document.createElement( 'canvas' )

        for (let i = 0; i < textures.length; i++) {

            let tex = textures[i]
            
            canvas.width = tex.image.width
            canvas.height = tex.image.height
            // @ts-ignore
            // do more testing with offscreen - safari seems still behind
            // let offscreencanvas = canvas.transferControlToOffscreen()
            const context = canvas.getContext( '2d' );
            context?.drawImage( tex.image, 0, 0 )
            
            const data = context?.getImageData( 0, 0, canvas.width, canvas.height )
            imageData.push(data!)

            tex.dispose()
        }

        canvas.width = 0;
        canvas.height = 0;
        canvas.remove()

        return imageData
    }
}