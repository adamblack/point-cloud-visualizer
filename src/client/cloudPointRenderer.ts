import Stats from 'three/examples/jsm/libs/stats.module'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GuiWrapper } from './guiWrapper'
import { GeometryHelper } from './geometryHelper'

export class CloudPointRenderer {
    stats = Stats()
    clock = new THREE.Clock()
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(
        80,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    )
    guiWrapper!: GuiWrapper
    geometryHelper!: GeometryHelper
    currentSceneObject : THREE.Points | THREE.Mesh | undefined
    renderer = new THREE.WebGLRenderer({ antialias: true })

    parallaxUniforms = {
        u_time: { type: "f", value: 1.0 },
        u_texture: {type: 't', value: null},
        u_use_texture: {type: 'b', value: null},
        u_minZ: { type: "f", value: 1.0 },
        u_maxZ: { type: "f", value: 1.0 },
        u_camera_angle: { type: "vec3", value: new THREE.Vector3(0, 0, 0) },
        u_scale: { type: "f", value: 1.0 },
        // 0 - no parallax, 1 - sin/cos mapping, 2 - dynamic, follows camera
        u_parallax_type: { type: "i", value: 0 },
    }

    morphValue = 0;
    morphDirection = 1;
    stepCounter = 0
    interpolationStep = 0.01
    lastCameraPosition = new THREE.Vector3(0, 0, 0)

    interpolationOptions = {
        auto: false,
        frame: 0,
        scale: 0.2,
        resetCurrent: () => {
            this.resetCurrentFrame()
        },
        reset: () => {
            this.resetState()
        },
        invert: () => {
            this.invertState()
        }
    }

    textureOptions = {
        textureUsage: false,
    }

    renderingOptions = {
        type: 'Farm',
    }

    parallaxOptions = {
        type: 'Auto'
    }

    // In general we would rather use events
    callbackOptions = {
        renderSelectedMesh: (meshType: string) => {
            this.renderSelectedMesh(meshType)
        },
        scaleScene: (scale: number) => {
            if (this.currentSceneObject == undefined) {
                return
            }
            this.currentSceneObject.scale.z = scale
        },
        handleParallaxSelection: (parallaxType: string) => {
            this.handleParallaxSelection(parallaxType)
        },
        moveToFrame: (frame: number) => {
            this.moveToFrame(frame)
        }
    }


    constructor() {
        document.body.appendChild(this.stats.dom)
        this.camera.position.z = 3

        this.renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(this.renderer.domElement)

        const controls = new OrbitControls(this.camera, this.renderer.domElement)
        controls.screenSpacePanning = true

        const onWindowResize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.render()
        }
        window.addEventListener('resize', onWindowResize, false)
    }

    start() {
        this.guiWrapper = new GuiWrapper(this.interpolationOptions, this.textureOptions, this.renderingOptions, this.parallaxOptions, this.callbackOptions)
        this.geometryHelper = new GeometryHelper(this.guiWrapper, this.parallaxUniforms)
        this.guiWrapper.triggerInitialScene()
        this.animate()
    }

    async renderSelectedMesh(sceneType: any) {
        //switch gallery
        if (this.currentSceneObject != undefined) {
            this.scene.remove(this.currentSceneObject)
            this.currentSceneObject.geometry.dispose()
            this.currentSceneObject.clear()
        }
        
        this.guiWrapper.addOptions()

        // move to geometryHelper
        if (this.geometryHelper.useWorker) {
            const generatedMeshData = await this.geometryHelper.generatePointsByWorker()
            const renderedType = this.guiWrapper.renderingType!.getValue()
            
            if (generatedMeshData.centerPositions[renderedType] != undefined){
                this.geometryHelper.imgCenterPoints[renderedType] = []
                for (let i = 0; i < generatedMeshData.centerPositions[renderedType].length; i++) {
                    this.geometryHelper.imgCenterPoints[renderedType].push(new THREE.Vector3(
                        generatedMeshData.centerPositions[renderedType][i].x,
                        generatedMeshData.centerPositions[renderedType][i].y,
                        generatedMeshData.centerPositions[renderedType][i].z
                    ))
                }
            }

            this.parallaxUniforms.u_minZ.value = generatedMeshData.minZ
            this.parallaxUniforms.u_maxZ.value = generatedMeshData.maxZ
            this.currentSceneObject = generatedMeshData.mesh
        } else {
            this.currentSceneObject = await this.geometryHelper.generatePoints()
        }
        
        this.currentSceneObject.scale.set( 5, 5, this.interpolationOptions.scale );
        this.scene.add(this.currentSceneObject)

        this.clock.start()
    }

    handleParallaxSelection(value: string) {
        switch(value) {
            case 'None': {
                this.parallaxUniforms.u_parallax_type.value = 0
                break
            }
            case 'Auto': {
                this.parallaxUniforms.u_parallax_type.value = 2
                break
            }
            case 'Dynamic': {
                this.parallaxUniforms.u_parallax_type.value = 1
                break
            }
        }
    }

    animate() {

        requestAnimationFrame(this.animate.bind(this))
        
        if (this.interpolationOptions.auto) {
            this.interpolate()
        }

        this.parallaxUniforms.u_time.value = this.clock.getElapsedTime()

        if (this.guiWrapper.renderingType != undefined &&
            this.geometryHelper.imgCenterPoints[this.guiWrapper.renderingType.getValue()] != undefined &&
            this.lastCameraPosition.angleTo(this.camera.position) != 0 &&
            this.currentSceneObject != undefined
        ) {
            const imgCenterPoint = this.geometryHelper.imgCenterPoints[this.guiWrapper.renderingType.getValue()][this.interpolationOptions.frame]
            this.lastCameraPosition = this.camera.position.clone()

            let angleX = this.camera.position.clone().setY(0).angleTo(imgCenterPoint as THREE.Vector3)
            let angleY = this.camera.position.clone().setX(0).angleTo(imgCenterPoint)

            let normalX = new THREE.Plane().setFromCoplanarPoints(new THREE.Vector3(), this.camera.position.clone().setY(0), imgCenterPoint).normal
            let normalY = new THREE.Plane().setFromCoplanarPoints(new THREE.Vector3(), this.camera.position.clone().setX(0), imgCenterPoint).normal

            this.parallaxUniforms.u_scale.value = 1 + this.currentSceneObject.scale.z
            this.parallaxUniforms.u_camera_angle.value = new THREE.Vector3(-angleX*normalX.y, angleY*normalY.x, 0)
        }

        this.render()
        this.stats.update()
    }

    resetState(updateDirection: boolean = true) {
        this.morphValue = 0;
        if (updateDirection) {
            this.guiWrapper.updateGui(0)
            this.morphDirection = 1;
        }
        this.stepCounter = 0
        for(let i = 0; i < this.geometryHelper.steps+1; i++) {
            if (this.currentSceneObject != undefined) {
                this.currentSceneObject.morphTargetInfluences![i] = 0
            }
        }
    }

    invertState() {
        this.morphDirection *= -1
    }

    moveToFrame(frame: number) {
        this.resetState(false)
        this.stepCounter = frame
        if (frame != 0 && this.currentSceneObject != undefined) {
            this.currentSceneObject.morphTargetInfluences![frame - 1] = 1
            this.stepCounter = frame-1
        }
    }

    resetCurrentFrame() {
        this.moveToFrame(this.stepCounter+1)
    }

    interpolate() {
        if (!this.currentSceneObject) {
            return
        }
        this.currentSceneObject.morphTargetInfluences![this.stepCounter] = this.morphValue
        if (this.stepCounter > 0 && this.morphDirection == 1) {
            this.currentSceneObject.morphTargetInfluences![this.stepCounter - 1] = 1 - this.morphValue
        } else if (this.stepCounter < this.geometryHelper.steps && this.morphDirection == -1) {
            this.currentSceneObject.morphTargetInfluences![this.stepCounter + 1] = 1 - this.morphValue
        }
        this.morphValue += this.interpolationStep * Math.abs(this.morphDirection);
        if (this.morphValue > 1 || this.morphValue < 0) {
            if ((this.stepCounter == this.geometryHelper.steps && this.morphDirection == 1) || (this.stepCounter == 0 && this.morphDirection == -1)) {
                this.morphDirection *= -1;
            }

            this.stepCounter += 1*this.morphDirection
            this.guiWrapper.updateGui(this.stepCounter)
            this.morphValue = 0
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera)
    }
}