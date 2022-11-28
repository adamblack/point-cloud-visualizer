import * as pako from 'pako'
import * as THREE from 'three'

// HD data source, local only

// //farm
// import housepic from "./assets/house/houseapic.json.gz"
// import housemapzip from "./assets/house/housemap.json.gz"

// //ai
// import ai1 from "./assets/ai/stable1.json.gz"
// import ai2 from "./assets/ai/stable1depth.json.gz"
// import ai3 from "./assets/ai/ryska/worm.json.gz"
// import ai4 from "./assets/ai/ryska/wormdepth.json.gz"
// import ai5 from "./assets/ai/cand1.json.gz"
// import ai6 from "./assets/ai/canddepth1.json.gz"
// import ai7 from "./assets/ai/ryska/resistancecity.json.gz"
// import ai8 from "./assets/ai/ryska/resistancecitydepth.json.gz"
// import ai9 from "./assets/ai/cand3.json.gz"
// import ai10 from "./assets/ai/canddepth3.json.gz"
// import ai11 from "./assets/ai/cand4.json.gz"
// import ai12 from "./assets/ai/canddepth4.json.gz"
// import ai13 from "./assets/ai/ryska/bus.json.gz"
// import ai14 from "./assets/ai/ryska/busdepth.json.gz"
// import ai15 from "./assets/ai/ryska/resistance.json.gz"
// import ai16 from "./assets/ai/ryska/resistancedepth.json.gz"

// //act
// import act1 from "./assets/act/anneoriginal.json.gz"
// import act2 from "./assets/act/annedepthmap.json.gz"
// import act3 from "./assets/act/oliviaoriginal.json.gz"
// import act4 from "./assets/act/oliviadepthmap.json.gz"

// import act5 from "./assets/act/morph1.json.gz"
// import act6 from "./assets/act/morph2.json.gz"
// import act7 from "./assets/act/morph3.json.gz"
// import act8 from "./assets/act/morph4.json.gz"
// import act9 from "./assets/act/morph5.json.gz"
// import act10 from "./assets/act/morph6.json.gz"
// import act11 from "./assets/act/morph7.json.gz"
// import act12 from "./assets/act/morph8.json.gz"
// import act13 from "./assets/act/morph9.json.gz"
// import act14 from "./assets/act/morph10.json.gz"
// import act15 from "./assets/act/anneoliviadepth1.json.gz"
// import act16 from "./assets/act/anneoliviadepth2.json.gz"
// import act17 from "./assets/act/anneoliviadepth3.json.gz"
// import act18 from "./assets/act/anneoliviadepth4.json.gz"
// import act19 from "./assets/act/anneoliviadepth5.json.gz"
// import act20 from "./assets/act/anneoliviadepth6.json.gz"
// import act21 from "./assets/act/anneoliviadepth7.json.gz"
// import act22 from "./assets/act/anneoliviadepth8.json.gz"
// import act23 from "./assets/act/anneoliviadepth9.json.gz"
// import act24 from "./assets/act/anneoliviadepth10.json.gz"

// //koala
// import koala1 from "./assets/koala/koala1.json.gz"
// import koala2 from "./assets/koala/koala2.json.gz"
// import koala3 from "./assets/koala/morphoutput1.json.gz"
// import koala4 from "./assets/koala/morphoutput2.json.gz"
// import koala5 from "./assets/koala/morphoutput3.json.gz"
// import koala6 from "./assets/koala/morphoutput4.json.gz"
// import koala7 from "./assets/koala/morphoutput5.json.gz"
// import koala8 from "./assets/koala/morphoutput6.json.gz"
// import koala9 from "./assets/koala/morphoutput7.json.gz"
// import koala10 from "./assets/koala/morphoutput8.json.gz"
// import koala11 from "./assets/koala/morphoutput9.json.gz"
// import koala12 from "./assets/koala/morphoutput10.json.gz"


// Web friendly data source

//farm
import housepic from "./assets/house/housepic.jpg"
import housemapzip from "./assets/house/housemap.png"


//ai
import ai1 from "./assets/ai/stable1.jpg"
import ai2 from "./assets/ai/stable1depth.jpg"
import ai3 from "./assets/ai/ryska/worm.jpg"
import ai4 from "./assets/ai/ryska/wormdepth.jpg"
import ai5 from "./assets/ai/cand1.jpg"
import ai6 from "./assets/ai/canddepth1.jpg"
import ai7 from "./assets/ai/ryska/resistancecity.jpg"
import ai8 from "./assets/ai/ryska/resistancecitydepth.jpg"
import ai9 from "./assets/ai/cand3.jpg"
import ai10 from "./assets/ai/canddepth3.jpg"
import ai11 from "./assets/ai/cand4.jpg"
import ai12 from "./assets/ai/canddepth4.jpg"
import ai13 from "./assets/ai/ryska/bus.jpg"
import ai14 from "./assets/ai/ryska/busdepth.jpg"
import ai15 from "./assets/ai/ryska/resistance.jpg"
import ai16 from "./assets/ai/ryska/resistancedepth.jpg"

//act
import act1 from "./assets/act/anneoriginal.jpg"
import act2 from "./assets/act/annedepthmap.png"
import act3 from "./assets/act/oliviaoriginal.jpeg"
import act4 from "./assets/act/oliviadepthmap.png"

import act5 from "./assets/act/morph1.jpg"
import act6 from "./assets/act/morph2.jpg"
import act7 from "./assets/act/morph3.jpg"
import act8 from "./assets/act/morph4.jpg"
import act9 from "./assets/act/morph5.jpg"
import act10 from "./assets/act/morph6.jpg"
import act11 from "./assets/act/morph7.jpg"
import act12 from "./assets/act/morph8.jpg"
import act13 from "./assets/act/morph9.jpg"
import act14 from "./assets/act/morph10.jpg"
import act15 from "./assets/act/anneoliviadepth1.png"
import act16 from "./assets/act/anneoliviadepth2.png"
import act17 from "./assets/act/anneoliviadepth3.png"
import act18 from "./assets/act/anneoliviadepth4.png"
import act19 from "./assets/act/anneoliviadepth5.png"
import act20 from "./assets/act/anneoliviadepth6.png"
import act21 from "./assets/act/anneoliviadepth7.png"
import act22 from "./assets/act/anneoliviadepth8.png"
import act23 from "./assets/act/anneoliviadepth9.png"
import act24 from "./assets/act/anneoliviadepth10.png"

//koala
import koala1 from "./assets/koala/koala1.jpeg"
import koala2 from "./assets/koala/koala2.jpg"
import koala3 from "./assets/koala/morph1.jpg"
import koala4 from "./assets/koala/morph2.jpg"
import koala5 from "./assets/koala/morph3.jpg"
import koala6 from "./assets/koala/morph4.jpg"
import koala7 from "./assets/koala/morph5.jpg"
import koala8 from "./assets/koala/morph6.jpg"
import koala9 from "./assets/koala/morph7.jpg"
import koala10 from "./assets/koala/morph8.jpg"
import koala11 from "./assets/koala/morph9.jpg"
import koala12 from "./assets/koala/morph10.jpg"


export enum ASSET_TYPE {
    FARM, AI, ACT, KOALA
}

export class Api {
    
    //Whatever server you might be running, not needed for usage of original site
    pathPrefix = 'http://127.0.0.1:8081/images/'
    localBundle = false
    aiAssetsList = [ai1, ai2, ai3, ai4, ai5, ai6, ai7, ai8, ai9, ai10, ai11, ai12, ai13, ai14, ai15, ai16]
    
    constructor() {}

    async getAssets(steps: number, type: ASSET_TYPE, useLocalBundle = false) : Promise<any[]> {
        let folder: string = ''
        let imageUrls: any[] = []

        switch(type) {
            case ASSET_TYPE.FARM: {
                if (!useLocalBundle) {
                    folder = 'house/'
                    imageUrls = ['houseapic.json', 'housemap.json']
                } else {
                    imageUrls = [housepic, housemapzip]
                }
                break
            }
            case ASSET_TYPE.AI: {
                if (!useLocalBundle) {
                    folder = 'ai/'
                    imageUrls = ['stable1.json', 'stable1depth.json', 'ryska/worm.json', 'ryska/wormdepth.json', 'cand1.json', 'canddepth1.json', 'ryska/resistancecity.json', 'ryska/resistancecitydepth.json', 'cand3.json', 'canddepth3.json', 'cand4.json', 'canddepth4.json', 'ryska/bus.json', 'ryska/busdepth.json', 'ryska/resistance.json', 'ryska/resistancedepth.json']
                } else {
                    imageUrls = this.aiAssetsList
                }
                break
            }
            case ASSET_TYPE.ACT: {
                // need debug!
                if (!useLocalBundle) {
                    folder = 'act/'
                    imageUrls = ['anneoriginal.json', 'annedepthmap.json', 'oliviaoriginal.json', 'oliviadepthmap.json']

                    for(let i = 1; i <= steps; i++) {
                        imageUrls.push('anneolivia' + i + '.json')
                    }
                
                    for(let i = 1; i <= steps; i++) {
                        imageUrls.push('anneoliviadepth' + i + '.json')
                    }
                } else {
                    imageUrls = [act1, act2, act3, act4, act5, act6, act7, act8, act9, act10, act11, act12, act13, act14, act15, act16, act17, act18, act19, act20, act21, act22, act23, act24]
                }
                break
            }
            case ASSET_TYPE.KOALA: {
                if (!useLocalBundle) {
                    folder = 'koala/'
                    imageUrls = ['koala1.json', 'koala2.json']
                    for(let i = 1; i <= steps; i++) {
                        imageUrls.push('morphoutput' + i + '.json')
                    }
                } else {
                    imageUrls = [koala1, koala2, koala3, koala4, koala5, koala6, koala7, koala8, koala9, koala10, koala11, koala12 ]
                }
                break
            }
        }

        if (useLocalBundle) {
            const imageZips = await this.fetch(folder, imageUrls, true, false)
            return await this.decom(imageZips)
        } else {
            return await this.fetch(folder, imageUrls)
        }
    }

    async decom(imageZips: any[]) {
        let imageJsons: any[] = []
        for (let i = 0; i < imageZips.length; i++) {
            let fileReader = await imageZips[i].arrayBuffer();
            const binData = new Uint8Array(fileReader);
            var parsed = pako.ungzip(binData,{ 'to': 'string' });
            imageJsons.push(JSON.parse(parsed))
        }

        return imageJsons
    }

    async fetch(folder: string, imageUrls: string[], useAbsolute = false, asJson = true) : Promise<any[]>{
        let finalPrefix = ''
        if (!useAbsolute) {
            finalPrefix = this.pathPrefix + folder
        }
        const imageJsons = await Promise.all(imageUrls.map(async url => {
            const response = await fetch(finalPrefix + url, { headers: { 'Accept-Encoding': 'gzip', 'accept': 'application/json; charset=utf8;' } })

            if (asJson) {
                return response.json()
            } else {
                return response
            }
          })
        )

        return imageJsons
    }

    async fetchImages(steps: number, type: ASSET_TYPE, useLocalBundle = false) : Promise<any[]> {
        let folder: string = ''
        let imageUrls: any[] = []

        switch(type) {
            case ASSET_TYPE.FARM: {
                if (!useLocalBundle) {
                    folder = 'house/'
                    imageUrls = ['housepic.jpg', 'housemap.png']
                } else {
                    imageUrls = [housepic, housemapzip]
                }
                break
            }
            case ASSET_TYPE.AI: {
                if (!useLocalBundle) {
                    folder = 'ai/'
                    imageUrls = ['stable1.png', 'stable1depth.png', 'ryska/worm.png', 'ryska/wormdepth.png', 'cand1.jpg', 'canddepth1.jpg', 'ryska/resistancecity.png', 'ryska/resistancecitydepth.png', 'cand3.jpg', 'canddepth3.jpg', 'cand4.jpg', 'canddepth4.png', 'ryska/bus.png', 'ryska/busdepth.png', 'ryska/resistance.png', 'ryska/resistancedepth.png']
                } else {
                    imageUrls = [ai1, ai2, ai3, ai4, ai5, ai6, ai7, ai8, ai9, ai10, ai11, ai12, ai13, ai14, ai15, ai16]
                }
                break
            }
            case ASSET_TYPE.ACT: {
                if (!useLocalBundle) {
                    folder = 'act/'
                    imageUrls = ['anneoriginal.jpg', 'annedepthmap.png', 'oliviaoriginal.jpeg', 'oliviadepthmap.png']

                    for(let i = 1; i <= steps; i++) {
                        imageUrls.push('morph' + i + '.jpg')
                    }
                
                    for(let i = 1; i <= steps; i++) {
                        imageUrls.push('anneoliviadepth' + i + '.png')
                    }
                } else {
                    imageUrls = [act1, act2, act3, act4, act5, act6, act7, act8, act9, act10, act11, act12, act13, act14, act15, act16, act17, act18, act19, act20, act21, act22, act23, act24]
                }
                break
            }
            case ASSET_TYPE.KOALA: {
                if (!useLocalBundle) {
                    folder = 'koala/'
                    imageUrls = ['koala1.jpeg', 'koala2.jpg']
                    for(let i = 1; i <= steps; i++) {
                        imageUrls.push('morph' + i + '.jpg')
                    }
                } else {
                    imageUrls = [koala1, koala2, koala3, koala4, koala5, koala6, koala7, koala8, koala9, koala10, koala11, koala12 ]
                }
                break
            }
        }

        return await this.makePromise(folder, imageUrls, useLocalBundle)
    }

    async makePromise(folder: string, urls: string[], useAbsolute = false) {
        let finalPrefix = ''
        if (!useAbsolute) {
            finalPrefix = this.pathPrefix + folder
        }

        return new Promise<THREE.Texture[]>((resolve, reject) => {
            let textures: any = [];
            let onLoad = function () {
                resolve(textures);
            };
            let onProgress = function () { };
            let onError = function (url: string) {
                resolve([]);
            };
    
            let manager = new THREE.LoadingManager(onLoad, onProgress, onError);
            for (let i = 0; i < urls.length; i++) {
                let url = finalPrefix + urls[i];
                let loader = new THREE.TextureLoader(manager);
                textures[i] = loader.load(url);
            }
        })
    }
}