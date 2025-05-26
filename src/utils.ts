interface Point {
  x: number
  y: number
}

/**
 * Generates a path resembling a directed radio wave emanating from a source and arriving precisely at a target,
 * with its amplitude increasing as it moves along the path.
 *
 * The path is an expanding wave where its central direction is from source to target.
 * The wave oscillates around this central direction, and the amplitude of this oscillation
 * grows proportionally with the distance from the source. The last point of the path
 * will be at the target coordinates.
 *
 * @param xSource The X coordinate of the wave's origin point.
 * @param ySource The Y coordinate of the wave's origin point.
 * @param xTarget The X coordinate of the point where the wave is directed towards and will terminate.
 * @param yTarget The Y coordinate of the point where the wave is directed towards and will terminate.
 * @param startRadiusOffset The distance from the source where the wave *visually begins*. The wave path will start at this radius from the source along the direction to the target. Must be less than the distance from source to target.
 * @param numPoints The number of points to generate for the path. A higher number results in a smoother curve.
 * @param waveCyclesAlongPath The number of full wave cycles (peaks and troughs) that occur along the *length* of the path from `startRadiusOffset` to the target. Controls the "density" of the ripples.
 * @param amplitudeGrowthRate A factor determining how quickly the wave's oscillation amplitude increases with radial distance from the source. A value of 0 means constant amplitude.
 * @param beamWidthRadians The total angular spread of the wave, centered around the direction from source to target. Use `Math.PI` for a 180-degree spread, `Math.PI * 2` for a full 360-degree spread.
 * @returns An array of `Point` objects representing the expanding, oscillating, directed wave path.
 * @throws Error if `numPoints` is less than 2, or if `startRadiusOffset` is too large (wave starts beyond target).
 */
export function generateDirectedWaveToTargetPath(
  xSource: number,
  ySource: number,
  xTarget: number,
  yTarget: number,
  startRadiusOffset: number,
  numPoints: number,
  waveCyclesAlongPath: number,
  amplitudeGrowthRate: number
): Point[] {
  if (numPoints < 2) {
    throw new Error('`numPoints` must be at least 2.')
  }

  const path: Point[] = []

  // Calculate the total distance from source to target
  const deltaX = xTarget - xSource
  const deltaY = yTarget - ySource
  const totalDistanceToTarget = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

  // Determine the central direction angle from source to target
  const centralDirectionAngle = Math.atan2(deltaY, deltaX)

  // Check if startRadiusOffset is valid
  if (startRadiusOffset >= totalDistanceToTarget) {
    throw new Error(
      '`startRadiusOffset` must be less than the distance from source to target ' +
        `(${totalDistanceToTarget.toFixed(
          2
        )}). Wave cannot start beyond its destination.`
    )
  }

  // Calculate perpendicular direction (90 degrees to central direction)
  const perpendicularAngle = centralDirectionAngle + Math.PI / 2

  for (let i = 0; i < numPoints; i++) {
    // Normalized progress (t) from 0 to 1 across the number of points
    const t = i / (numPoints - 1)

    // 1. Calculate the distance along the central path
    const distanceAlongPath =
      startRadiusOffset + t * (totalDistanceToTarget - startRadiusOffset)

    // 2. Calculate the position along the central path (from source toward target)
    const centralX =
      xSource + distanceAlongPath * Math.cos(centralDirectionAngle)
    const centralY =
      ySource + distanceAlongPath * Math.sin(centralDirectionAngle)

    // 3. Calculate the current amplitude of the oscillation
    // It grows with distance from the source
    const currentAmplitude =
      (distanceAlongPath - startRadiusOffset) * amplitudeGrowthRate

    // 4. Calculate the sinusoidal oscillation
    const oscillationPhase = t * waveCyclesAlongPath * 2 * Math.PI
    const oscillation = Math.sin(oscillationPhase)

    // 5. Calculate the perpendicular offset from the central path
    const perpendicularOffset = oscillation * currentAmplitude

    // 6. Calculate the final position by adding the perpendicular offset
    const x = centralX + perpendicularOffset * Math.cos(perpendicularAngle)
    const y = centralY + perpendicularOffset * Math.sin(perpendicularAngle)

    path.push({ x, y })
  }

  // Ensure the last point is exactly at the target
  if (path.length > 0) {
    path[path.length - 1] = { x: xTarget, y: yTarget }
  }

  return path
}

/**
 * Alternative version that creates a spreading wave beam (fan-like)
 * This version spreads the wave across the beam width while maintaining oscillation
 */
export function generateDirectedWaveBeamPath(
  xSource: number,
  ySource: number,
  xTarget: number,
  yTarget: number,
  startRadiusOffset: number,
  numPoints: number,
  waveCyclesAlongPath: number,
  amplitudeGrowthRate: number,
  beamWidthRadians: number
): Point[] {
  if (numPoints < 2) {
    throw new Error('`numPoints` must be at least 2.')
  }

  const path: Point[] = []

  // Calculate the total distance from source to target
  const deltaX = xTarget - xSource
  const deltaY = yTarget - ySource
  const totalDistanceToTarget = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

  // Determine the central direction angle from source to target
  const centralDirectionAngle = Math.atan2(deltaY, deltaX)

  // Check if startRadiusOffset is valid
  if (startRadiusOffset >= totalDistanceToTarget) {
    throw new Error(
      '`startRadiusOffset` must be less than the distance from source to target ' +
        `(${totalDistanceToTarget.toFixed(
          2
        )}). Wave cannot start beyond its destination.`
    )
  }

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1)

    // Calculate the base radius along the path
    const baseRadius =
      startRadiusOffset + t * (totalDistanceToTarget - startRadiusOffset)

    // Calculate the current angle within the beam spread
    // This creates the fan/spreading effect
    const spreadAngle = centralDirectionAngle + (t - 0.5) * beamWidthRadians

    // Calculate the current amplitude
    const currentAmplitude =
      (baseRadius - startRadiusOffset) * amplitudeGrowthRate

    // Calculate the oscillation
    const oscillationPhase = t * waveCyclesAlongPath * 2 * Math.PI
    const oscillation = Math.sin(oscillationPhase)

    // Apply oscillation as a radial modulation
    const actualRadius = baseRadius + oscillation * currentAmplitude

    // Convert to Cartesian coordinates
    const x = xSource + actualRadius * Math.cos(spreadAngle)
    const y = ySource + actualRadius * Math.sin(spreadAngle)

    path.push({ x, y })
  }

  return path
}

/**
 * Converts an array of Point objects into an SVG path data string.
 */
export function pointsToSvgPath(points: Point[]): string {
  if (points.length === 0) {
    return ''
  }

  let pathD = `M ${points[0].x} ${points[0].y}`

  for (let i = 1; i < points.length; i++) {
    pathD += ` L ${points[i].x} ${points[i].y}`
  }

  return pathD
}

// Example usage:
/*
// Example 1: Standard oscillating wave from point A to point B
const wavePath1 = generateDirectedWaveToTargetPath(
  50,    // xSource
  50,    // ySource  
  300,   // xTarget
  200,   // yTarget
  10,    // startRadiusOffset
  200,   // numPoints
  5,     // waveCyclesAlongPath (5 full oscillations)
  0.3,   // amplitudeGrowthRate (amplitude grows with distance)
  0      // beamWidthRadians (not used in standard version)
);

// Example 2: Spreading wave beam
const waveBeam = generateDirectedWaveBeamPath(
  100,      // xSource
  100,      // ySource
  400,      // xTarget
  300,      // yTarget  
  20,       // startRadiusOffset
  150,      // numPoints
  8,        // waveCyclesAlongPath
  0.2,      // amplitudeGrowthRate
  Math.PI/4 // beamWidthRadians (45 degree spread)
);

// Convert to SVG path
const svgPath1 = pointsToSvgPath(wavePath1);
const svgPath2 = pointsToSvgPath(waveBeam);
*/
