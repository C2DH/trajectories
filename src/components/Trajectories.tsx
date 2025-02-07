import CircularTimeline from '../CircularTimeline'
import { Trajectory, Place } from '../types'

interface TrajectoriesProps {
  data: [Trajectory[], Place[]]
}

const Trajectories: React.FC<TrajectoriesProps> = ({ data = [[], []] }) => {
  const [trajectories, places] = data

  if (Array.isArray(trajectories)) {
    // group by personId
    const grouped = trajectories.reduce((acc, d) => {
      if (!acc[d.personId]) {
        acc[d.personId] = []
      }
      acc[d.personId].push(d)
      return acc
    }, {} as Record<string, Trajectory[]>)

    return (
      <>
        {/* {Object.keys(grouped).map((personId) => (
          <pre key={personId}>{JSON.stringify(grouped[personId], null, 2)}</pre>
        ))} */}
        {Object.keys(grouped).map((personId) => (
          <CircularTimeline
            trajectories={grouped[personId]}
            places={places}
            key={personId}
          />
        ))}
      </>
    )
  }
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export default Trajectories
