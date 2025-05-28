import { Trajectory, Place, Settings, Legend } from '../types'
import LinearTimeline from '../components/LinearTimeline'
import { useParams } from 'react-router'
import CircularTimeline from '../components/CircularTimeline'
import HeaderTimeline from '../components/HeaderTimeline'
import {
  DotArrowDown,
  DotArrowRight,
  OnePointCircle,
  Radius,
} from 'iconoir-react'

interface TrajectoriesProps {
  data: [Trajectory[], Place[], Settings[], Legend[]]
  type: 'linear' | 'circular'
}

const PersonTrajectory: React.FC<TrajectoriesProps> = ({
  data = [[], [], [], []],
  type = 'linear',
}) => {
  const [trajectories, places, settings, legends] = data
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
        <HeaderTimeline
          legend={legends.find((l) => l.personId === personId)}
          showDescription={type === 'circular'}
        >
          {type === 'linear' && (
            <div className='row mt-3'>
              <div className='col-6'>
                <DotArrowRight /> <em>Date</em>
              </div>
              <div className='col-6'>
                <DotArrowDown /> <em>Distance (Km) </em>
              </div>
            </div>
          )}
          {type === 'circular' && (
            <div className='row mt-3'>
              <div className='col-6'>
                <OnePointCircle />{' '}
                <em>
                  Angle : <b>date</b> (sens horaire)
                </em>
              </div>
              <div className='col-6'>
                <Radius />{' '}
                <em>
                  Rayon ∝ √(<b>distance</b>)
                </em>
              </div>
            </div>
          )}
        </HeaderTimeline>
        {type === 'linear' && (
          <LinearTimeline
            trajectories={personTrajectories}
            places={places}
            settings={settings.find((s) => s.personId === personId)}
          />
        )}
        {type === 'circular' && (
          <CircularTimeline
            trajectories={personTrajectories}
            places={places}
            settings={settings.find((s) => s.personId === personId)}
          />
        )}
      </>
    )
  }
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export default PersonTrajectory
