# Point clouds visualization with Three.js

Showcase project about point clouds, depth maps, image morphing and Three.js. You can find more information about the project's background in my [blog post](https://medium.com/@adamias/point-clouds-visualization-with-three-js-5ef2a5e24587).

Project also [contains examples](https://adamblack.github.io/point-cloud-demo/dist/client/vector.html) of how to compute / select the best path within the vector field. More detailed description is in [another blog post](https://medium.com/@adamias/vector-fields-and-fuel-consumption-wrapped-in-3d-475a8a9fd57c).

## Usage - Point clouds

Live demo is already hosted at [Github pages](https://adamblack.github.io/point-cloud-demo/dist/client/index.html).

In case you want to run project locally:

``` bash
git clone git@github.com:adamblack/point-cloud-visualizer.git
cd ./point-cloud-visualizer
npm i
npm run dev
```

Default scenario uses the same resources as the Live demo. If you want to use raw data for better quality, set variables in **geometryHelper.ts** as:

``` typescript
// true and false - prod
// true | false and true - dev -> i.e. provide images from your server in api pathPrefix settings
// do not forget to edit imports
useLocalAssets = true
useRawData = true

// if true, mesh generation is offloaded to worker and useLocalAssets/useRawData is ignored
// used in prod, behaves like useLocalAssets = true, useRawData = false
useWorker = false
```

Also, you have to use different set of imports (gzip ones) at **api.ts**. This rather clumsy setup process will be streamlined later.

## Usage - Vector fields

``` bash
git clone git@github.com:adamblack/point-cloud-visualizer.git
cd ./point-cloud-visualizer
npm i
npm run dev
```

In **client.ts**, just comment out init of CloudPointRenderer.

## Future plans

- probably merge geometry generators methods
- import of local resources via webpack should be streamlined 
- move even more operations to Web worker
- investigate OffscreenCanvas and improve performance
- a lot of new features


## Known issues

- Some scenarios cause page reload on the iPhone while using Safari or Chrome
