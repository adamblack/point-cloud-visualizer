let nerdamer = require("nerdamer/all.min")
import { Expression } from "nerdamer"

onmessage = (message) => {

    let pathAkimaXZCoefficients = message.data.pathAkimaXZCoefficients
    let pathAkimaXYCoefficients = message.data.pathAkimaXYCoefficients
    let fieldAkimaXCoefficients = message.data.fieldAkimaXCoefficients
    let fieldAkimaYCoefficients = message.data.fieldAkimaYCoefficients
    let fieldAkimaZCoefficients = message.data.fieldAkimaZCoefficients
    let pathOriginalPoints = message.data.pathOriginalPoints

    let flightsPathCost = Array<number>()

    for (let flightIndex = 0; flightIndex < pathAkimaXZCoefficients.length; flightIndex++) {
        let pathXZEquations = generatePathEquations(pathAkimaXZCoefficients[flightIndex], pathOriginalPoints[flightIndex])
        let pathXYEquations = generatePathEquations(pathAkimaXYCoefficients[flightIndex], pathOriginalPoints[flightIndex])
        // x vector field 
        let fieldXEquations = generateFieldEquations(fieldAkimaXCoefficients[flightIndex], pathOriginalPoints[flightIndex])
        // y vector field 
        let fieldYEquations = generateFieldEquations(fieldAkimaYCoefficients[flightIndex], pathOriginalPoints[flightIndex])
        // z vector field - is actually y direction
        let fieldZEquations = generateFieldEquations(fieldAkimaZCoefficients[flightIndex], pathOriginalPoints[flightIndex])
    
        let pathXZDiffEquations = new Array<Expression>()
        pathXZEquations.forEach(pathEquation => {
            pathXZDiffEquations.push(nerdamer.diff(pathEquation, 'x'))
        })
    
        let pathXYDiffEquations = new Array<Expression>()
        pathXYEquations.forEach(pathEquation => {
            pathXYDiffEquations.push(nerdamer.diff(pathEquation, 'x'))
        })
    
        let numIntegrands = new Array<Expression>()
        let finalIntegrals = new Array<Expression>()
        let pathCost = 0
    
        for (let i = 0; i < pathXZDiffEquations.length; i++) {
            let dotXProduct = fieldXEquations[i]
            let dotYProduct = fieldYEquations[i].multiply(pathXZDiffEquations[i])
            let dotZProduct = fieldZEquations[i].multiply(pathXYDiffEquations[i])

            let integrand = dotXProduct.add(dotYProduct).add(dotZProduct)

            numIntegrands.push(integrand)
            let finalIntegral = nerdamer.integrate(integrand.expand(), 'x')
            finalIntegrals.push(finalIntegral)

        }

        finalIntegrals.forEach((finalIntegral, index) => {
            let integralToEval = finalIntegral.buildFunction()
            pathCost += integralToEval(pathOriginalPoints[flightIndex][0][index+1]) - integralToEval(pathOriginalPoints[flightIndex][0][index])
        })

        flightsPathCost.push(pathCost)

        const progress = (100 * (flightIndex + 1) / pathAkimaXZCoefficients.length).toFixed(1)
        postMessage({progress})
    }

    postMessage({flightsPathCost})
  }

  function generatePathEquations(akimaCoefficients: ArrayLike<number>[], pathOriginalPoints: any) : Array<Expression>{
    let splines = akimaCoefficients.length
    let splineEquations = new Array<Expression>()
    let coeffs = new Array<number>(4)
    for (let i = 0; i < splines; i++) {

        for (let j = 0; j < 4; j++) {
            if (akimaCoefficients[i][j]) {
                coeffs[j] = akimaCoefficients[i][j]
            } else {
                coeffs[j] = 0
            }
        }

        let expr = `${coeffs[0]} + ${coeffs[1]}*(x-${pathOriginalPoints[0][i]}) + ${coeffs[2]}*(x-${pathOriginalPoints[0][i]})^2 + ${coeffs[3]}*(x-${pathOriginalPoints[0][i]})^3`
        splineEquations.push(nerdamer(expr))
    }

    return splineEquations
}

function generateFieldEquations(akimaCoefficients: ArrayLike<number>[], pathOriginalPoints: any) : Array<Expression>{
    let splines = akimaCoefficients.length
    let splineEquations = new Array<Expression>()
    let coeffs = new Array<number>(4)

    for (let i = 0; i < splines; i++) {
        
        for (let j = 0; j < 4; j++) {
            if (akimaCoefficients[i][j]) {
                coeffs[j] = akimaCoefficients[i][j]
            } else {
                coeffs[j] = 0
            }
        }

        let expr = `${coeffs[0]} + ${coeffs[1]}*(x-${pathOriginalPoints[0][i]}) + ${coeffs[2]}*(x-${pathOriginalPoints[0][i]})^2 + ${coeffs[3]}*(x-${pathOriginalPoints[0][i]})^3`
        splineEquations.push(nerdamer(expr))
    }

    return splineEquations
}