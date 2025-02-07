import React from 'react'
import * as d3 from 'd3'
import { Place, Trajectory } from './types'
import { DateTime } from 'luxon'

interface CircularTimelineProps {
  trajectories: Trajectory[]
  width?: number
  height?: number
  margin?: number
  places: Place[]
}

const CircularTimeline: React.FC<CircularTimelineProps> = ({
  trajectories = [],
  width = 1000,
  height = 1000,
  margin = 100,
  places = [],
}) => {
  const placeIndex: { [key: string]: Place } = places.reduce((acc, place) => {
    acc[place.id] = place
    return acc
  }, {} as { [key: string]: Place })
  console.info('[CircularTimeline] placeIndex:', placeIndex)
  // Parse dates and sort chronologically
  const parsedData = trajectories
    .map((d) => ({
      ...d,
      date: d3.timeParse('%d/%m/%Y')(d.movingDate),
      dateLabel: DateTime.fromFormat(d.movingDate, 'dd/MM/yyyy').toLocaleString(
        {
          year: 'numeric',
          month: d.dataAccuracy === 'month' ? 'long' : 'short',
          day: d.dataAccuracy === 'day' ? 'numeric' : undefined,
        }
      ),
    }))
    .sort((a, b) =>
      a.date && b.date ? a.date.getTime() - b.date.getTime() : 0
    )

  const radius = Math.min(width, height) / 2 - margin
  const centerX = width / 2
  const centerY = height / 2

  // color by place type
  const colorScale = d3
    .scaleOrdinal()
    .domain(places.map((p) => p.type))
    .range(d3.schemeRdYlBu[11])

  // Extract unique locations (source + target) and map distances
  const locations = new Set<string>()
  parsedData.forEach((d) => {
    locations.add(d.sourceId)
    locations.add(d.targetId)
  })
  const locationArray = Array.from(locations)
  const distancesByPlaceId = locationArray.reduce((acc, loc, i) => {
    acc[loc] = parseFloat(placeIndex[loc].distance as string)
    return acc
  }, {} as { [key: string]: number })
  const radiusScale = d3
    .scalePow()
    .domain([
      0,
      d3.max(
        locationArray.map((id) => (id === 'Home' ? 0 : distancesByPlaceId[id]))
      ) || 1,
    ])
    .range([50, radius]) // "Home" is small, others grow with distance
    .exponent(0.5) // Adjust curvature
  // Define time scale mapped to angle (0 to 2π)
  const timeScale = d3
    .scaleTime()
    .domain([
      parsedData[0].date as Date,
      parsedData[parsedData.length - 1].date as Date,
    ])
    .range([Math.PI / 6 - Math.PI / 2, 2 * Math.PI - Math.PI / 6 - Math.PI / 2])

  // Helper function to get (x, y) for a given location and date
  const getCoordinates = (id: string, date: Date) => {
    const r = radiusScale(distancesByPlaceId[id])
    console.info('id', id, distancesByPlaceId[id], r)
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
  const topOffset = locationArray.length * 40
  return (
    <div className='CircularTimeline'>
      <svg width={width} height={height + topOffset}>
        {/* draw vertical lines per each location, where x is the location radius */}

        <g transform={`translate(${centerX},${centerY + topOffset})`}>
          {/* Draw circle */}
          {locationArray
            .sort((a, b) => distancesByPlaceId[a] - distancesByPlaceId[b])
            .map((loc, i) => {
              const r = radiusScale(distancesByPlaceId[loc])
              const y = -radius - (i + 1) * 40
              const x = -r
              const color = colorScale(placeIndex[loc].type) as string
              return (
                <g key={i}>
                  <circle
                    cx={0}
                    cy={0}
                    r={r}
                    fill='none'
                    stroke={color}
                    strokeDasharray='3 2'
                  />
                  <line x1={x} y1={y} x2={x} y2={0} stroke={color} />
                  <circle cx={x} cy={y} r={3} fill={color} />
                  <text
                    x={x + 10}
                    y={y}
                    fill='black'
                    className='font-weight-bold small'
                  >
                    {placeIndex[loc].name}
                  </text>
                  {loc !== 'Home' && (
                    <text x={x + 10} y={y + 15} fill='grey' className=' small'>
                      {placeIndex[loc].type}
                    </text>
                  )}
                </g>
              )
            })}

          {/* Draw trajectory lines */}
          {parsedData.map((d, i) => {
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
                  strokeWidth={3}
                />
              </g>
            )
          })}
          {/* Draw continuous smooth Bézier curve */}
          <path
            d={lineGenerator(pathPoints)!}
            fill='none'
            stroke='#0000ff25'
            strokeWidth={30}
          />

          {/* Draw connection lines between successive trajectories */}
          {parsedData.map((d, i) => {
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
                  {/* <line
                    x1={prevCoords.x}
                    y1={prevCoords.y}
                    x2={currCoords.x}
                    y2={currCoords.y}
                    stroke='red'
                    strokeWidth={1}
                    strokeDasharray='4 2'
                  /> */}
                </g>
                <path
                  key={`arc-${i}`}
                  d={arcGenerator({} as any) || ''}
                  fill='none'
                  stroke='blue'
                  strokeWidth={3}
                />
              </>
            )
          })}

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
            const r = radiusScale(distancesByPlaceId[d.targetId])

            const x = r * Math.cos(angle)
            const y = r * Math.sin(angle)
            const x2 = (radius / 2 + i * 15) * Math.cos(angle)
            const y2 = (radius / 2 + i * 15) * Math.sin(angle)

            return (
              <g key={i}>
                <circle cx={x} cy={y} r={i === 0 ? 10 : 5} fill='blue' />
                <text
                  x={x}
                  y={y - 20}
                  dy='0.35em'
                  className='font-weight-bold'
                  textAnchor='middle'
                >
                  {i + 1}
                </text>
                <text
                  x={x2}
                  y={angle > Math.PI ? y2 - 15 : y2 + 15}
                  dy='0.35em'
                  textAnchor='middle'
                  fill='black'
                  className='small'
                >
                  {d.dateLabel}
                </text>
                <circle cx={x2} cy={y2} r={2} fill='red' />

                <line
                  x1={x}
                  y1={y}
                  x2={x2}
                  y2={y2}
                  stroke='green'
                  strokeWidth={1}
                />
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

export default CircularTimeline
