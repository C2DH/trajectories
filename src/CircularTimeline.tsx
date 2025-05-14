import React from "react";
import * as d3 from "d3";
import { Place, Settings, Trajectory } from "./types";
import { DateTime } from "luxon";

interface CircularTimelineProps {
  trajectories: Trajectory[];
  width?: number;
  height?: number;
  margin?: number;
  places: Place[];
  settings?: Settings;
}

const CircularTimeline: React.FC<CircularTimelineProps> = ({
  trajectories = [],
  width = 1000,
  height = 1000,
  margin = 100,
  places = [],
  settings = {},
}) => {
  // Define custom colors
  const customColors = [
    "#067BC2",
    "#8A33FF",
    "#84DD63",
    "#684756",
    "#FB4D3D",
    "#5ABCB9",
    "#9D9171",
    "#FF3366",
    "#26532B",
    "#D56062",
    "#3D314A",
    "#399E5A",
    "#5D675B",
    "#2EC4B6",
  ];

  // Create a name-to-color mapping
  const uniqueNames = [...new Set(places.map((p) => p.name))];
  const nameToColorMap: Record<string, string> = {};
  uniqueNames.forEach((name, index) => {
    nameToColorMap[name] = customColors[index % customColors.length];
  });

  const placeIndex: { [key: string]: Place } = places.reduce((acc, place) => {
    acc[place.id] = place;
    return acc;
  }, {} as { [key: string]: Place });
  // uncomment to debug
  // console.debug('[CircularTimeline] placeIndex:', placeIndex)
  // Parse dates and sort chronologically
  const parsedData = trajectories
    .map((d) => ({
      ...d,
      targetId: d.targetId.trim(),
      sourceId: d.sourceId.trim(),
      date: d3.timeParse("%d/%m/%Y")(d.movingDate),
      dateLabel: DateTime.fromFormat(d.movingDate, "dd/MM/yyyy").toLocaleString(
        {
          year: "numeric",
          month: d.dataAccuracy === "month" ? "long" : "short",
          day: d.dataAccuracy === "day" ? "numeric" : undefined,
        }
      ),
    }))
    .sort((a, b) =>
      a.date && b.date ? a.date.getTime() - b.date.getTime() : 0
    );

  const radius = Math.min(width, height) / 2 - margin;
  const centerX = width / 2;
  const centerY = height / 2;

  // color by place type
  const colorScale = d3
    .scaleOrdinal()
    .domain(places.map((p) => p.type))
    .range(d3.schemeRdYlBu[11]);

  // Extract unique locations (source + target) and map distances
  const locations = new Set<string>();
  parsedData.forEach((d) => {
    locations.add(d.sourceId);
    locations.add(d.targetId);
  });
  const locationArray = Array.from(locations);
  const distancesByPlaceId = locationArray.reduce((acc, loc) => {
    try {
      acc[loc] = parseFloat(placeIndex[loc].distance as string);
    } catch (e) {
      console.error(e, loc);
    }
    return acc;
  }, {} as { [key: string]: number });
  const exponent: number = settings?.exponent
    ? parseFloat(settings.exponent)
    : 0.5;
  const radiusScale = d3
    .scalePow()
    .domain([0, d3.max(Object.values(distancesByPlaceId)) || 1])
    .range([40, radius]) // "Home" is small, others grow with distance
    .exponent(exponent); // Adjust curvature
  // Define time scale mapped to angle (0 to 2π)
  const timeScale = d3
    .scaleTime()
    .domain([
      parsedData[0].date as Date,
      parsedData[parsedData.length - 1].date as Date,
    ])
    .range([
      Math.PI / 6 - Math.PI / 2,
      2 * Math.PI - Math.PI / 6 - Math.PI / 2,
    ]);

  // Helper function to get (x, y) for a given location and date
  const getCoordinates = (id: string, date: Date) => {
    const r = radiusScale(distancesByPlaceId[id]);
    console.info("id", id, distancesByPlaceId[id], r);
    const angle = timeScale(date);
    return { x: r * Math.cos(angle), y: r * Math.sin(angle), r, angle };
  };
  // Function to generate Bézier curve path
  // const createBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
  //   const controlX = (x1 + x2) / 2 // Control point for smooth curve
  //   const controlY = (y1 + y2) / 2 - 50 // Adjust curvature
  //   return `M ${x1},${y1} Q ${controlX},${controlY} ${x2},${y2}`
  // }
  // Create a continuous path using a smooth curve (Catmull-Rom interpolation)
  const lineGenerator = d3
    .line<{ x: number; y: number }>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveCatmullRom.alpha(0.5)); // Smooth interpolation
  // Generate path points (sourceId and targetId positions)
  const pathPoints = parsedData.flatMap((d) => [
    getCoordinates(d.sourceId, d.date!),
    getCoordinates(d.targetId, d.date!),
  ]);
  const topOffset = locationArray.length * 40;

  const downloadAsSVG = () => {
    if (!svgRef.current) return;

    // Get the SVG content as a string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgRef.current);

    // Create a Blob and object URL
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    // Create a download link
    const a = document.createElement("a");
    a.href = url;
    a.download = "download.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up
    URL.revokeObjectURL(url);
  };
  const svgRef = React.useRef<SVGSVGElement>(null);
  return (
    <div className="CircularTimeline">
      <svg width={width} height={height + topOffset} ref={svgRef}>
        {/* draw vertical lines per each location, where x is the location radius */}

        <g transform={`translate(${centerX},${centerY + topOffset})`}>
          {/* Draw circle */}
          {locationArray
            .sort((a, b) => distancesByPlaceId[a] - distancesByPlaceId[b])
            .map((loc, i) => {
              const r = radiusScale(distancesByPlaceId[loc]);
              const y = -radius - (i + 1) * 40;
              const x = -r;
              // const color = colorScale(placeIndex[loc].type) as string;
              const color = nameToColorMap[placeIndex[loc].name];
              console.log("Graph-Name", placeIndex[loc].name);
              return (
                <g key={i}>
                  <circle
                    cx={0}
                    cy={0}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeDasharray="3 2"
                  />
                  <line x1={x} y1={y} x2={x} y2={0} stroke={color} />
                  <circle cx={x} cy={y} r={3} fill={color} />
                  <text
                    x={x + 10}
                    y={y}
                    fill="black"
                    className="font-weight-bold small"
                  >
                    {placeIndex[loc].name}
                  </text>
                  {loc !== "Home" && (
                    <text x={x + 10} y={y + 15} fill="grey" className=" small">
                      {placeIndex[loc].type}
                    </text>
                  )}
                </g>
              );
            })}

          {/* Draw trajectory lines */}
          {parsedData.map((d, i) => {
            if (!d.date) return null;
            const sourceCoords = getCoordinates(d.sourceId, d.date);
            const targetCoords = getCoordinates(d.targetId, d.date);

            return (
              <g key={`line-${i}`}>
                <line
                  x1={sourceCoords.x}
                  y1={sourceCoords.y}
                  x2={targetCoords.x}
                  y2={targetCoords.y}
                  stroke={nameToColorMap[placeIndex[d.targetId].name]}
                  strokeWidth={2}
                />
              </g>
            );
          })}
          {/* Draw continuous smooth Bézier curve */}
          <path
            d={lineGenerator(pathPoints)!}
            fill="none"
            stroke="#0B032D18"
            strokeWidth={10}
          />

          {/* Draw connection lines between successive trajectories */}
          {parsedData.map((d, i) => {
            if (i === 0 || !d.date) return null;
            const prevTarget = parsedData[i - 1].targetId;
            const prevDate = parsedData[i - 1].date;
            const currSource = d.sourceId;
            const currDate = d.date;

            if (!prevDate || !currDate) return null;

            const prevCoords = getCoordinates(prevTarget, prevDate);
            const currCoords = getCoordinates(currSource, currDate);

            const arcGenerator = d3
              .arc()
              .innerRadius(prevCoords.r)
              .outerRadius(currCoords.r)
              .startAngle(prevCoords.angle + Math.PI / 2)
              .endAngle(currCoords.angle + Math.PI / 2);
            // const color = colorScale(placeIndex[d.targetId].type) as string;
            return (
              <>
                <path
                  key={`arc-${i}`}
                  d={arcGenerator({} as any) || ""}
                  fill="none"
                  stroke={nameToColorMap[placeIndex[d.targetId].name]}
                  strokeWidth={2}
                />
              </>
            );
          })}

          {/* Plot points along the circumference */}
          {parsedData.map((d, i) => {
            if (!d.date) return null;
            const angle = timeScale(d.date);
            const r = radiusScale(distancesByPlaceId[d.targetId]);

            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            const x2 = (radius + Math.sin(i) * 100) * Math.cos(angle);
            const y2 = (radius + Math.sin(i) * 100) * Math.sin(angle);
            // const color = colorScale(placeIndex[d.targetId].type) as string;
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={i === 0 ? 5 : 3}
                  fill={nameToColorMap[placeIndex[d.targetId].name]}
                />
                {i === 0 || i === parsedData.length - 1 ? (
                  <text
                    x={x}
                    y={y - 20}
                    dy="0.35em"
                    className="font-weight-bold"
                    textAnchor="middle"
                  >
                    {i + 1}
                  </text>
                ) : null}
                {i === 0 || i === parsedData.length - 1 ? (
                  <>
                    <text
                      x={x2}
                      y={angle > Math.PI ? y2 - 15 : y2 + 15}
                      dy="0.35em"
                      textAnchor="middle"
                      fill="#00000099"
                      className="small"
                    >
                      {d.dateLabel}
                    </text>
                    <circle cx={x2} cy={y2} r={2} stroke="#00000025" />

                    <line
                      x1={x}
                      y1={y}
                      x2={x2}
                      y2={y2}
                      stroke="#00000025"
                      strokeWidth={1}
                    />
                  </>
                ) : null}
              </g>
            );
          })}
          {/* Display years in correct angular position */}
          {d3.timeYear
            .range(
              parsedData[0].date as Date,
              parsedData[parsedData.length - 1].date as Date
            )
            .map((year, i) => {
              const angle = timeScale(year);
              const x = (radius + 50) * Math.cos(angle);
              const y = (radius + 50) * Math.sin(angle);
              return (
                <g key={`year-${i}`}>
                  <line
                    x1={0}
                    y1={0}
                    x2={x}
                    y2={y}
                    stroke="#00000015"
                    strokeWidth={1}
                  />
                  <text
                    key={`year-${i}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    // transform={`rotate(${(angle * 180) / Math.PI}, ${
                    //   x + centerX
                    // }, ${y + centerY + topOffset})`}
                    className="small"
                    color={"#00000025"}
                  >
                    {year.getFullYear()}
                  </text>
                </g>
              );
            })}
        </g>
      </svg>
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={downloadAsSVG}
      >
        download SVG
      </button>
    </div>
  );
};

export default CircularTimeline;
