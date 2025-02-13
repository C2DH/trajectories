import { Fragment } from 'react/jsx-runtime'
import CircularTimeline from '../CircularTimeline'
import { Trajectory, Place, Settings } from '../types'
import LinearTimeline from '../LinearTimeline'

interface TrajectoriesProps {
  data: [Trajectory[], Place[], Settings[]]
}

const Trajectories: React.FC<TrajectoriesProps> = ({ data = [[], [], []] }) => {
  const [trajectories, places, settings] = data

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
        {Object.keys(grouped).map((personId) => (
          <Fragment key={personId}>
            <h2>Person {personId}</h2>
            <CircularTimeline
              trajectories={grouped[personId]}
              places={places}
              settings={settings.find((s) => s.personId === personId)}
            />
            <LinearTimeline
              trajectories={grouped[personId]}
              places={places}
              settings={settings.find((s) => s.personId === personId)}
            />
          </Fragment>
        ))}
      </>
    )
  }
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export default Trajectories
