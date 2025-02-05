import CircularTimeline, { Trajectory } from '../CircularTimeline'

interface TrajectoriesProps {
  data?: Trajectory[]
}

const Trajectories: React.FC<TrajectoriesProps> = ({ data }) => {
  if (Array.isArray(data)) {
    // group by personId
    const grouped = data.reduce((acc, d) => {
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
          <CircularTimeline data={grouped[personId]} key={personId} />
        ))}
      </>
    )
  }
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export default Trajectories
