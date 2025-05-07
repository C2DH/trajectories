// import Trajectories from './components/Trajectories'
import CsvLoader from './CsvLoader'
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'
import { Link, Route, Routes } from 'react-router'
import Home from './pages/Home'
import PersonTrajectory from './pages/PersonTrajectories'
import { Place, Settings, Trajectory } from './types'

function RoutesWrapper({
  data = [[], [], []],
}: {
  data: [Trajectory[], Place[], Settings[]]
}) {
  const [trajectories, places, settings] = data
  let grouped = {} as Record<string, Trajectory[]>
  if (Array.isArray(trajectories)) {
    // group by personId
    grouped = trajectories.reduce((acc, d) => {
      if (!acc[d.personId]) {
        acc[d.personId] = []
      }
      acc[d.personId].push(d)
      return acc
    }, {} as Record<string, Trajectory[]>)
  }
  // gives me all personIds
  return (
    <div className='container'>
      <div className='row'>
        <aside className='col-2'>
          <h2>Person Ids</h2>
          <ul className='list-unstyled'>
            {Object.keys(grouped).map((personId) => (
              <li key={personId}>
                <Link to={`/trajectory/${personId}`}>
                  Person {personId} (n. {grouped[personId].length})
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <main className='col-10'>
          <Routes>
            <Route index element={<Home />} />
            <Route
              path='trajectory/:personId'
              element={
                <PersonTrajectory data={[trajectories, places, settings]} />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <CsvLoader url='/data/trajectories.tsv,/data/places.csv,/data/settings.csv'>
      <RoutesWrapper data={[[], [], []]} />
    </CsvLoader>
  )
}

export default App
