import { getColorByPlace } from '../constants'
import { OffsettedPosition, Place } from '../types'

const LinearTimelinePlaces = ({
  places = [],
  yScaleFn = (d: number) => d,
  minLabelHeight = 30,
}: {
  places: Place[]
  yScaleFn: (d: number) => number
  minLabelHeight: number
}) => {
  const offsettedPositions: OffsettedPosition[] = []
  // let yOffset = 0
  let yPrevious = 0
  places
    .sort(
      (a, b) =>
        parseFloat(a.distance as string) - parseFloat(b.distance as string)
    )
    .forEach((place, i) => {
      const yOriginal = yScaleFn(parseFloat(place.distance as string))
      let y = yOriginal

      if (i > 0 && yOriginal < yPrevious + minLabelHeight) {
        console.log(i, 'yOriginal', yOriginal)
        console.log('  Previous', yPrevious)
        console.log('   Offsettable', yOriginal < yPrevious + minLabelHeight)
        console.log('   Offsetted', yPrevious + minLabelHeight)
        y = yPrevious + minLabelHeight
        yPrevious = +y
      } else {
        yPrevious = yOriginal
      }
      // yPrevious = y
      offsettedPositions.push({
        item: place,
        x: 0,
        y,
        yOriginal,
        xOriginal: 0,
      })
    })
  return (
    <ul className='list-unstyled w-100'>
      {offsettedPositions.map((d: OffsettedPosition, i) => {
        const y = d.y
        const color = getColorByPlace(d.item)
        return (
          <li
            key={i}
            className={`place-${d.item.id}`}
            style={{
              position: 'absolute',
              left: 0,
              top: y,
              width: '100%',
              height: minLabelHeight,
              borderTop: `2px solid ${color}`,
              fontSize: '0.8rem',
              lineHeight: `${minLabelHeight}px`,
            }}
          >
            <div
              style={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',

                whiteSpace: 'nowrap',
                width: 'calc(100% - 20px)',
              }}
            >
              <b style={{ color }}>{d.item.name}</b>
              {d.item.type !== 'Home' && (
                <>
                  &nbsp;&middot;&nbsp;
                  {d.item.type}
                </>
              )}
            </div>
            <div
              style={{
                position: 'absolute',
                right: `-${Math.sqrt(20 ** 2 + (d.yOriginal - d.y) ** 2)}px`, // hypotenuse
                top: -2,
                width: `${Math.sqrt(20 ** 2 + (d.yOriginal - d.y) ** 2)}px`, // hypotenuse
                height: '1px',
                background: color,
                transform: `rotate(${
                  Math.atan2(d.yOriginal - d.y, 20) * (180 / Math.PI)
                }deg)`,
                transformOrigin: 'left center',
                pointerEvents: 'none',
              }}
            />
          </li>
        )
      })}
    </ul>
  )
}
export default LinearTimelinePlaces
