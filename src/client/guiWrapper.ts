import { GUI, GUIController } from "dat.gui";

export class GuiWrapper {

    gui: GUI
    sceneSettingsFolder: GUI | undefined
    renderingType: GUIController | undefined

    optionsFolder: GUI | undefined
    frameOptionGui: GUIController | undefined

    textureRenderFolder: GUI | undefined
    
    parallaxFolder: GUI | undefined
    parallaxGui: GUIController | undefined

    constructor(public interpolationOptions: any, public textureOptions: any, public renderingOptions: any, public parallaxOptions: any, public callbackOptions: any) {
        this.gui = new GUI()
        this.initDefaultGui()
    }

    initDefaultGui() {
        //General scene settings
        this.sceneSettingsFolder = this.gui.addFolder('Scene settings')
        this.renderingType = this.sceneSettingsFolder.add(this.renderingOptions, 'type', ['Waifus', 'Farm', 'Koala', 'ai_images']).name("Rendering type").onChange(value => {
            this.callbackOptions.renderSelectedMesh(value)
        })
        this.sceneSettingsFolder.add(this.interpolationOptions, 'scale', -2, 2, 0.001).onChange(value => {
            this.callbackOptions.scaleScene(value)
        })
        this.sceneSettingsFolder.open()

        //Add texture options
        this.createTextureOptions()
        
        //Add parallax options
        this.createParallaxOptions()
    }

    triggerInitialScene() {
        this.renderingType?.setValue('Farm')
    }

    createTextureOptions() {
        if (this.textureRenderFolder != undefined) {
            return
        }
        this.textureRenderFolder = this.gui.addFolder('Texture settings')
        this.textureRenderFolder.add(this.textureOptions, 'textureUsage').name("Texture as color source").onChange(value => {
            this.callbackOptions.renderSelectedMesh('Farm')
        });
        this.textureRenderFolder.open()
    }
    
    createParallaxOptions() {
        if (this.parallaxFolder != undefined) {
            return
        }
        this.parallaxFolder = this.gui.addFolder('Parallax settings')
        this.parallaxGui = this.parallaxFolder.add(this.parallaxOptions, 'type', ['None', 'Auto', 'Dynamic']).name("Parallax type").onChange(value => {
            this.callbackOptions.handleParallaxSelection(value)
        })
        this.parallaxGui.setValue('Auto')
        this.parallaxFolder.open()
    }

    createDetailedOptions(liteVersion = false) {
        this.optionsFolder =  this.gui.addFolder('Options')
        // caution on max value - steps in original
        this.frameOptionGui =  this.optionsFolder.add( this.interpolationOptions, 'frame', 0, 11, 1).onChange(value => {
            this.callbackOptions.moveToFrame(value)
        })
    
        if (!liteVersion) {
            this.optionsFolder.add(this.interpolationOptions, 'auto')
            this.optionsFolder.add(this.interpolationOptions, "resetCurrent").name("Reset current frame")
            this.optionsFolder.add(this.interpolationOptions, "reset").name("Reset")
            this.optionsFolder.add(this.interpolationOptions, "invert").name("Invert")
        }
        this.optionsFolder.open()
    }

    addOptions() {
        if (this.optionsFolder != undefined) {
            this.gui.removeFolder(this.optionsFolder)
            this.optionsFolder = undefined
        }
        switch(this.renderingType?.getValue()) {
            case 'Waifus': {
                if (this.optionsFolder == undefined) {
                    this.createDetailedOptions()
                    this.removeTextureOptions()
                }
                this.sceneSettingsFolder?.updateDisplay()
                this.parallaxGui?.setValue('None')
                this.removeParallaxOptions()
                break
            }
            case 'Farm': {
                if (this.optionsFolder != undefined) {
                    this.gui.removeFolder(this.optionsFolder)
                    this.optionsFolder = undefined
                }
                this.createDetailedOptions(true)
                this.createTextureOptions()
                this.createParallaxOptions()
                break
            }
            case 'Koala': {
                if (this.optionsFolder == undefined) {
                    this.createDetailedOptions()
                    this.removeTextureOptions()
                }
                this.parallaxGui?.setValue('None')
                this.removeParallaxOptions()
                break
            }
            case 'ai_images': {
                if (this.optionsFolder == undefined) {
                    this.removeTextureOptions()
                    this.createDetailedOptions(true)
                }
                this.createParallaxOptions()
                break
            }
        }

        this.updateGui(0)
    }

    updateGui(frame: number) {
        this.interpolationOptions.frame = frame
        this.optionsFolder?.updateDisplay()
    }

    updateFrameCounter(max: number) {
        this.frameOptionGui?.max(max)
    }

    removeTextureOptions() {
        if (this.textureRenderFolder != undefined) {
            this.gui.removeFolder(this.textureRenderFolder)
            this.textureRenderFolder = undefined
        }
    }

    removeParallaxOptions() {
        if (this.parallaxFolder != undefined) {
            this.parallaxGui?.remove()
            this.gui.removeFolder(this.parallaxFolder)
            this.parallaxFolder = undefined
        }
    }

}