import { Place, Settings, Trajectory } from './types'
import * as d3 from 'd3'
import { DateTime } from 'luxon'
import { useEffect, useRef } from 'react'

interface LinearTimelineProps {
  trajectories: Trajectory[]
  width?: number
  height?: number
  xMargin?: number
  yMargin?: number
  places: Place[]
  settings?: Settings
}

const LinearTimeline: React.FC<LinearTimelineProps> = ({
  trajectories = [],
  width = 1000,
  height = 500,
  xMargin = 20,
  yMargin = 30,
  places = [],
  settings,
}) => {
  const axisRef = useRef<SVGGElement>(null)
  const placeIndex: { [key: string]: Place } = places.reduce((acc, place) => {
    acc[place.id] = place
    return acc
  }, {} as { [key: string]: Place })
  // uncomment to debug
  console.debug('[LinearTimeline] trajectories:', settings)
  // console.debug('[CircularTimeline] placeIndex:', placeIndex)
  // Parse dates and sort chronologically
  const parsedData = trajectories
    .map((d) => ({
      ...d,
      targetId: d.targetId.trim(),
      sourceId: d.sourceId.trim(),
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
  const distancesByPlaceId = locationArray.reduce((acc, loc) => {
    try {
      acc[loc] = parseFloat(placeIndex[loc].distance as string)
    } catch (e) {
      console.error(e, loc)
    }
    return acc
  }, {} as { [key: string]: number })
  const exponent: number = settings?.exponent
    ? parseFloat(settings.exponent as string)
    : 0.5
  const createBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const controlX = (x1 + x2) / 2 // Control point for smooth curve
    const controlY = (y1 + y2) / 2 - 50 // Adjust curvature
    return `M ${x1},${y1} Q ${controlX},${controlY} ${x2},${y2}`
  }
  // Define time scale mapped to angle (0 to 2π)
  const timeScale = d3
    .scaleTime()
    .domain([
      parsedData[0].date as Date,
      parsedData[parsedData.length - 1].date as Date,
    ])
    .range([0, width - xMargin * 2])

  const spaceScale = d3
    .scalePow()
    .domain([0, d3.max(Object.values(distancesByPlaceId)) || 1])
    .range([0, height - yMargin * 2]) // "Home" is small, others grow with distance
    .exponent(exponent) // Adjust curvature
  useEffect(() => {
    if (axisRef.current) {
      const axis = d3.axisTop(timeScale).tickFormat((d) =>
        DateTime.fromJSDate(d as Date).toLocaleString({
          year: 'numeric',
          month: 'short',
        })
      )
      d3.select(axisRef.current).call(axis)
    }
  }, [timeScale])
  return (
    <svg width={width} height={height}>
      <g
        ref={axisRef}
        width={width - xMargin * 2}
        transform={`translate(${xMargin},20)`}
      ></g>

      {locationArray
        .sort((a, b) => distancesByPlaceId[a] - distancesByPlaceId[b])
        .map((loc, i) => {
          const y = spaceScale(distancesByPlaceId[loc])
          const color = colorScale(placeIndex[loc].type) as string
          return (
            <g
              key={i}
              className={`place-${placeIndex[loc].id}`}
              transform={`translate(${xMargin}, ${yMargin})`}
            >
              <line
                x1={0}
                y1={y}
                x2={width - xMargin * 2}
                y2={y}
                stroke={color}
              />
              {/* <text x={10} y={y - 5} textAnchor='start'>
                  {placeIndex[loc].name}
                </text> */}
            </g>
          )
        })}
      {parsedData.map((d, index) => {
        const color = colorScale(d.targetId) as string
        const y = spaceScale(distancesByPlaceId[d.targetId])
        const x = timeScale(d.date!)
        const curvePath =
          index < parsedData.length - 1
            ? createBezierPath(
                x,
                y,
                timeScale(parsedData[index + 1].date!),
                spaceScale(distancesByPlaceId[parsedData[index + 1].targetId])
              )
            : ''

        return (
          <g key={index} transform={`translate(${xMargin}, ${yMargin})`}>
            <path d={curvePath} fill='none' stroke={color} strokeWidth={2} />
            <line
              x1={x}
              y1={0}
              x2={x}
              y2={height - yMargin * 2}
              stroke={'#00000020'}
            ></line>
            {index === 0 || index === parsedData.length - 1 ? (
              <text
                x={index === 0 ? x - 10 : x + 5}
                y={y - 5}
                className='font-weight-bold'
                textAnchor={index === 0 ? 'end' : 'start'}
                fill='#000'
              >
                {index + 1}
              </text>
            ) : null}
            <circle r={index === 0 ? 8 : 3} cx={x} cy={y} fill={color} />
          </g>
        )
      })}
    </svg>
  )
}

export default LinearTimeline
