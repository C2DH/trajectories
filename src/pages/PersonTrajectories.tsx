import { Trajectory, Place, Settings } from '../types'
import LinearTimeline from '../LinearTimeline'
import { useParams } from 'react-router'

interface TrajectoriesProps {
  data: [Trajectory[], Place[], Settings[]]
}

const PersonTrajectory: React.FC<TrajectoriesProps> = ({
  data = [[], [], []],
}) => {
  const [trajectories, places, settings] = data
  const { personId } = useParams<{ personId: string }>()

  if (Array.isArray(trajectories)) {
    const personTrajectories: Trajectory[] = trajectories.filter(
      (d: Trajectory) => d.personId === personId
    )
    if (personTrajectories.length === 0) {
      return (
        <>
          <h2>No data for person {personId}</h2>
          <pre>{JSON.stringify(trajectories, null, 2)}</pre>
        </>
      )
    }

    return (
      <>
        <LinearTimeline
          trajectories={personTrajectories}
          places={places}
          settings={settings.find((s) => s.personId === personId)}
        />
      </>
    )
  }
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export default PersonTrajectory
