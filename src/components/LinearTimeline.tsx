import { Place, Settings, Trajectory } from '../types'
import * as d3 from 'd3'
import { DateTime } from 'luxon'
import { useEffect, useRef } from 'react'
import LinearTimelinePlaces from './LinearTimelinePlaces'
import { getColorByPlace } from '../constants'
import { generateDirectedWaveToTargetPath, pointsToSvgPath } from '../utils'

const lineGenerator = d3
  .line<{ x: number; y: number }>()
  .x((d) => d.x)
  .y((d) => d.y)
  .curve(d3.curveCatmullRom.alpha(0.5))

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
  height = 1000,
  xMargin = 20,
  yMargin = 30,
  places = [],
  settings,
}) => {
  // Define custom colors
  const customColors = [
    '#067BC2',
    '#8A33FF',
    '#84DD63',
    '#684756',
    '#FB4D3D',
    '#5ABCB9',
    '#9D9171',
    '#FF3366',
    '#26532B',
    '#D56062',
    '#3D314A',
    '#399E5A',
    '#5D675B',
    '#2EC4B6',
  ]

  // Create a name-to-color mapping
  const uniqueNames = [...new Set(places.map((p) => p.name))]
  const nameToColorMap: Record<string, string> = {}
  uniqueNames.forEach((name, index) => {
    nameToColorMap[name] = customColors[index % customColors.length]
  })
  const svgRef = useRef<SVGSVGElement>(null)
  const axisRef = useRef<SVGGElement>(null)
  const yAxisRef = useRef<SVGGElement>(null)
  const placeIndex: { [key: string]: Place } = places.reduce((acc, place) => {
    acc[place.id] = place
    return acc
  }, {} as { [key: string]: Place })
  const labelsWidth = 200
  const svgWidth = width - labelsWidth
  // uncomment to debug
  // console.debug('[LinearTimeline] trajectories:', settings)
  // console.debug('[CircularTimeline] placeIndex:', placeIndex)
  // Parse dates are already sort chronologically
  const parsedData = trajectories.map((d) => ({
    ...d,
    targetId: d.targetId.trim(),
    sourceId: d.sourceId.trim(),
    date: d3.timeParse('%d/%m/%Y')(d.movingDate),
    dateLabel: DateTime.fromFormat(d.movingDate, 'dd/MM/yyyy').toLocaleString({
      year: 'numeric',
      month: d.dataAccuracy === 'month' ? 'long' : 'short',
      day: d.dataAccuracy === 'day' ? 'numeric' : undefined,
    }),
  }))

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
  // const createBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
  //   const controlX = (x1 + x2) / 2 // Control point for smooth curve
  //   const controlY = (y1 + y2) / 2 - 50 // Adjust curvature
  //   return `M ${x1},${y1} Q ${controlX},${controlY} ${x2},${y2}`
  // }
  // Define time scale mapped to angle (0 to 2π)
  const timeScale = d3
    .scaleTime()
    .domain([
      parsedData[0].date as Date,
      parsedData[parsedData.length - 1].date as Date,
    ])
    .range([0, svgWidth - xMargin * 2])

  const spaceScale = d3
    .scalePow()
    .domain([0, d3.max(Object.values(distancesByPlaceId)) || 1])
    .range([0, height - yMargin * 2]) // "Home" is small, others grow with distance
    .exponent(exponent) // Adjust curvature

  const downloadAsSVG = () => {
    if (!svgRef.current) return

    // Get the SVG content as a string
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgRef.current)

    // Create a Blob and object URL
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    // Create a download link
    const a = document.createElement('a')
    a.href = url
    a.download = 'download.svg'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Clean up
    URL.revokeObjectURL(url)
  }

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
    if (yAxisRef.current) {
      const yAxis = d3.axisLeft(spaceScale).ticks(5)
      d3.select(yAxisRef.current).call(yAxis)
    }
  }, [timeScale])

  const pathPoints = parsedData.map((d) => ({
    x: timeScale(d.date!),
    y: spaceScale(distancesByPlaceId[d.sourceId]),
  }))
  const smoothPath = lineGenerator(pathPoints) || ''

  return (
    <>
      <div className='LinearTimeline position-relative'>
        <div
          className='position-absolute'
          style={{ top: yMargin, width: labelsWidth }}
        >
          <LinearTimelinePlaces
            places={locationArray.map((loc) => placeIndex[loc])}
            yScaleFn={spaceScale}
            minLabelHeight={30}
          />
        </div>

        <svg
          width={svgWidth}
          height={height}
          ref={svgRef}
          style={{ marginLeft: labelsWidth }}
        >
          <defs>
            <filter id='wavyLine' x='0%' y='0%' width='100%' height='100%'>
              <feTurbulence
                type='turbulence'
                baseFrequency='0.05'
                seed='1'
                result='ziggyEffect'
              />
              <feDisplacementMap
                in='SourceGraphic'
                in2='ziggyEffect'
                scale='10'
                xChannelSelector='R'
                yChannelSelector='G'
              />
              <feGaussianBlur
                in='SourceGraphic'
                in2='ziggyEffect'
                stdDeviation='3'
              />
            </filter>
            <filter
              id='blurLowConfidence'
              x='-50%'
              y='-50%'
              width='200%'
              height='200%'
            >
              <feGaussianBlur in='SourceGraphic' stdDeviation='3' />
            </filter>
            <filter
              id='blurVeryLowConfidence'
              x='-50%'
              y='-50%'
              width='200%'
              height='200%'
            >
              <feGaussianBlur in='SourceGraphic' stdDeviation='5' />
            </filter>
          </defs>
          <g
            ref={axisRef}
            width={svgWidth - xMargin * 2}
            transform={`translate(${xMargin},20)`}
          ></g>
          <g
            ref={yAxisRef}
            height={height - yMargin * 2}
            transform={`translate(${svgWidth},${yMargin})`}
          ></g>
          <path
            d={smoothPath}
            fill='none'
            stroke='#0B032D18'
            strokeWidth={10}
            transform={`translate(${xMargin}, ${yMargin})`}
          />
          {locationArray
            .sort((a, b) => distancesByPlaceId[a] - distancesByPlaceId[b])
            .map((loc, i) => {
              const y = spaceScale(distancesByPlaceId[loc])
              const location = placeIndex[loc]
              if (!location) {
                console.error('Location not found in Places:', loc)
                return null
              }
              const color = getColorByPlace(location)
              // const color = colorScale(placeIndex[loc].type) as string;
              return (
                <g
                  key={i}
                  className={`place-${placeIndex[loc].id}`}
                  transform={`translate(${xMargin}, ${yMargin})`}
                >
                  <line
                    x1={0}
                    y1={y}
                    x2={svgWidth - xMargin * 2}
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
            // const color = colorScale(d.targetId) as string;
            const xSource = timeScale(d.date!)
            const xTarget =
              index < parsedData.length - 1
                ? timeScale(parsedData[index + 1].date!)
                : xSource
            const ySource = spaceScale(distancesByPlaceId[d.sourceId])
            const yTarget = spaceScale(distancesByPlaceId[d.targetId])
            const colorSource = getColorByPlace(placeIndex[d.sourceId])
            const colorTarget = getColorByPlace(placeIndex[d.targetId])

            return (
              <g key={index} transform={`translate(${xMargin}, ${yMargin})`}>
                {index < parsedData.length && (
                  <>
                    <circle
                      r={3}
                      cx={xTarget}
                      cy={yTarget}
                      fill={colorTarget}
                    />
                    {d.endDate === 'day' && (
                      <>
                        <line
                          x1={xSource}
                          y1={ySource}
                          x2={xTarget}
                          y2={yTarget}
                          stroke={colorTarget}
                          strokeWidth={2}
                          style={{ opacity: 1 }}
                        />
                      </>
                    )}
                    {(d.endDate === 'week' || d.endDate === 'month') && (
                      <>
                        <path
                          d={pointsToSvgPath(
                            generateDirectedWaveToTargetPath(
                              xSource,
                              ySource,
                              xTarget,
                              yTarget,

                              2, // startRadiusOffset
                              300, // numPoints
                              Math.hypot(xTarget - xSource, yTarget - ySource) /
                                50, // waveCyclesAlongPath: proportional to distance
                              0.02 // amplitudeGrowthRate (amplitude grows with distance)
                            )
                          )}
                          fill='none'
                          stroke={colorTarget}
                          strokeWidth={3}
                        />
                      </>
                    )}
                  </>
                )}
                {d.endDate === 'year' && (
                  <>
                    <path
                      d={pointsToSvgPath(
                        generateDirectedWaveToTargetPath(
                          xSource,
                          ySource,
                          xTarget,
                          yTarget,

                          2, // startRadiusOffset
                          300, // numPoints

                          Math.hypot(xTarget - xSource, yTarget - ySource) /
                            100,
                          // waveCyclesAlongPath: proportional to distance
                          0.03 // amplitudeGrowthRate (amplitude grows with distance)
                        )
                      )}
                      fill='none'
                      stroke={colorTarget}
                      strokeWidth={2}
                      strokeLinejoin='round'
                      strokeLinecap='round'
                    />
                  </>
                )}
                {index === 0 || index === parsedData.length - 1 ? (
                  <>
                    <text
                      x={index === 0 ? xSource - 10 : xTarget + 5}
                      y={index === 0 ? ySource - 10 : yTarget - 10}
                      className='font-weight-bold'
                      textAnchor={index === 0 ? 'end' : 'middle'}
                      fill='#000'
                    >
                      {index + 1}
                    </text>
                    <circle
                      r={8}
                      cx={index === 0 ? xSource : xTarget}
                      cy={index === 0 ? ySource : yTarget}
                      fill={index === 0 ? colorSource : colorTarget}
                    />
                  </>
                ) : (
                  <text
                    x={index === 0 ? xSource - 10 : xSource + 5}
                    y={ySource - 5}
                    textAnchor={'middle'}
                    fill='#000'
                    fontSize={10}
                    className='non-printable'
                  >
                    {index + 1}
                  </text>
                )}
                {index == 0 && (
                  <circle
                    r={4}
                    cx={xSource}
                    cy={ySource}
                    fill={'transparent'}
                    strokeWidth={2}
                    stroke={colorTarget}
                  />
                )}

                {/* {d.endDate === 'month' && (
                  <>
                    

                    <circle
                      r={5}
                      cx={xTarget}
                      cy={yTarget}
                      fill={colorTarget}
                      opacity={0.5}
                    />
                    <circle
                      r={10}
                      cx={xTarget}
                      cy={yTarget}
                      opacity={0.5}
                      fill={colorTarget}
                      filter='url(#blurLowConfidence)'
                    />
                  </>
                )}
                {d.endDate === 'year' && (
                  <circle
                    r={20}
                    cx={xTarget}
                    cy={yTarget}
                    opacity={0.5}
                    fill={colorTarget}
                    filter='url(#blurVeryLowConfidence)'
                  />
                )} */}
              </g>
            )
          })}
        </svg>
        <div>
          <button
            className='btn btn-sm btn-outline-primary'
            onClick={downloadAsSVG}
          >
            download SVG
          </button>
        </div>
      </div>
      <pre className='non-printable'>
        {JSON.stringify(
          {
            trajectories,
          },
          null,
          2
        )}
      </pre>
    </>
  )
}

export default LinearTimeline
