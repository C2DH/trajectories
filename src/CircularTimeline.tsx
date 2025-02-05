import React from 'react'
import * as d3 from 'd3'

export interface Trajectory {
  trajNumber: number
  personId: number
  sourceId: string
  targetId: string
  movingDate: string
  dataAccuracy: string
  trajectoryType?: string
}

interface CircularTimelineProps {
  data: Trajectory[]
  width?: number
  height?: number
}

const CircularTimeline: React.FC<CircularTimelineProps> = ({
  data,
  width = 1000,
  height = 1000,
}) => {
  // Parse dates and sort chronologically
  const parsedData = data
    .map((d) => ({ ...d, date: d3.timeParse('%d/%m/%Y')(d.movingDate) }))
    .sort((a, b) =>
      a.date && b.date ? a.date.getTime() - b.date.getTime() : 0
    )

  const radius = Math.min(width, height) / 2 - 20
  const centerX = width / 2
  const centerY = height / 2

  // Extract unique locations (source + target) and map distances
  const locations = new Set<string>()
  parsedData.forEach((d) => {
    locations.add(d.sourceId)
    locations.add(d.targetId)
  })
  const locationArray = Array.from(locations)
  const radiusScale = d3
    .scaleSqrt()
    .domain([
      0,
      d3.max(locationArray.map((id) => (id === 'Home' ? 0 : parseInt(id)))) ||
        1,
    ])
    .range([50, radius]) // "Home" is small, others grow with distance

  // Define time scale mapped to angle (0 to 2π)
  const timeScale = d3
    .scaleTime()
    .domain([
      parsedData[0].date as Date,
      parsedData[parsedData.length - 1].date as Date,
    ])
    .range([0, 1.5 * Math.PI])

  // Helper function to get (x, y) for a given location and date
  const getCoordinates = (id: string, date: Date) => {
    const r = radiusScale(id === 'Home' ? 0 : parseInt(id))
    const angle = timeScale(date)
    return { x: r * Math.cos(angle), y: r * Math.sin(angle), r, angle }
  }
  // Function to generate Bézier curve path
  const createBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const controlX = (x1 + x2) / 2 // Control point for smooth curve
    const controlY = (y1 + y2) / 2 - 50 // Adjust curvature
    return `M ${x1},${y1} Q ${controlX},${controlY} ${x2},${y2}`
  }
  // Create a continuous path using a smooth curve (Catmull-Rom interpolation)
  const lineGenerator = d3
    .line<{ x: number; y: number }>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveCatmullRom.alpha(0.5)) // Smooth interpolation
  // Generate path points (sourceId and targetId positions)
  const pathPoints = parsedData.flatMap((d) => [
    getCoordinates(d.sourceId, d.date!),
    getCoordinates(d.targetId, d.date!),
  ])

  return (
    <>
      <svg width={width} height={height}>
        <g transform={`translate(${centerX},${centerY})`}>
          {/* Draw circle */}
          {/* <circle cx={0} cy={0} r={radius} fill='none' stroke='black' /> */}
          {/* Draw circles for each unique location */}
          {locationArray.map((loc, i) => {
            const r = radiusScale(loc === 'Home' ? 0 : parseInt(loc)) // Scale based on numeric ID
            return (
              <g key={i}>
                <circle
                  cx={0}
                  cy={0}
                  r={r}
                  fill='none'
                  stroke='gray'
                  strokeDasharray='3 3'
                />
                <text x={r} y={-5} fontSize='10' fill='black'>
                  {loc}
                </text>
              </g>
            )
          })}
          {/* Draw trajectory lines */}
          {/* {parsedData.map((d, i) => {
            if (!d.date) return null
            const sourceCoords = getCoordinates(d.sourceId, d.date)
            const targetCoords = getCoordinates(d.targetId, d.date)

            return (
              <g key={`line-${i}`}>
                <line
                  x1={sourceCoords.x}
                  y1={sourceCoords.y}
                  x2={targetCoords.x}
                  y2={targetCoords.y}
                  stroke='blue'
                  strokeWidth={2}
                />
              </g>
            )
          })} */}
          {/* Draw continuous smooth Bézier curve */}
          <path
            d={lineGenerator(pathPoints)!}
            fill='none'
            stroke='#ff1500a5'
            strokeWidth={5}
          />

          {/* Draw connection lines between successive trajectories */}
          {/* {parsedData.map((d, i) => {
            if (i === 0 || !d.date) return null
            const prevTarget = parsedData[i - 1].targetId
            const prevDate = parsedData[i - 1].date
            const currSource = d.sourceId
            const currDate = d.date

            if (!prevDate || !currDate) return null

            const prevCoords = getCoordinates(prevTarget, prevDate)
            const currCoords = getCoordinates(currSource, currDate)

            const arcGenerator = d3
              .arc()
              .innerRadius(prevCoords.r)
              .outerRadius(currCoords.r)
              .startAngle(prevCoords.angle + Math.PI / 2)
              .endAngle(currCoords.angle + Math.PI / 2)

            return (
              <>
                <g key={`link-${i}`}>
                  <line
                    x1={prevCoords.x}
                    y1={prevCoords.y}
                    x2={currCoords.x}
                    y2={currCoords.y}
                    stroke='red'
                    strokeWidth={1}
                    strokeDasharray='4 2'
                  />
                </g>
                <path
                  key={`arc-${i}`}
                  d={arcGenerator({} as any) || ''}
                  fill='none'
                  stroke='blue'
                  strokeWidth={2}
                />
              </>
            )
          })} */}

          {/* Draw Bézier curve from previous targetId to current sourceId */}
          {/* {parsedData.map((d, i) => {
            if (i === 0 || !d.date) return null
            const prevTargetCoords = getCoordinates(
              parsedData[i - 1].targetId,
              parsedData[i - 1].date
            )
            const currentSourceCoords = getCoordinates(d.sourceId, d.date)

            return (
              <g key={`bezier-${i}`}>
                <path
                  d={createBezierPath(
                    prevTargetCoords.x,
                    prevTargetCoords.y,
                    currentSourceCoords.x,
                    currentSourceCoords.y
                  )}
                  fill='none'
                  stroke='blue'
                  strokeWidth={2}
                />
              </g>
            )
          })} */}
          {/* Plot points along the circumference */}
          {parsedData.map((d, i) => {
            if (!d.date) return null
            const angle = timeScale(d.date)
            console.info('angle', angle)
            const r = radiusScale(
              d.targetId === 'Home' ? 0 : parseInt(d.targetId)
            )

            const x = r * Math.cos(angle)
            const y = r * Math.sin(angle)
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={3.5} fill='blue' />
                <text
                  x={x}
                  y={y - 20}
                  dy='0.35em'
                  textAnchor='middle'
                  fontSize='10'
                >
                  {d.trajNumber} - {d.dataAccuracy}
                </text>
                <text
                  x={(radius + 30) * Math.cos(angle)}
                  y={(radius + 30) * Math.sin(angle)}
                  dy='0.35em'
                  textAnchor='middle'
                  fontSize='10'
                  fill='black'
                >
                  {d.movingDate}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </>
  )
}

export default CircularTimeline
