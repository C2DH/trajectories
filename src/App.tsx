// import Trajectories from './components/Trajectories'
import CsvLoader from './CsvLoader'
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'
import { Link, Route, Routes } from 'react-router'
import Home from './pages/Home'
import PersonTrajectory from './pages/PersonTrajectories'
import { Legend, Place, Settings, Trajectory } from './types'

function RoutesWrapper({
  data = [[], [], [], []],
}: {
  data: [Trajectory[], Place[], Settings[], Legend[]]
}) {
  const [trajectories, places, settings, legends] = data
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
    <div className='container-fluid'>
      <div className='row'>
        <aside className='col-2'>
          <h2>Person Ids</h2>
          <ul className='list-unstyled'>
            {Object.keys(grouped).map((personId) => (
              <li key={personId} className='border-top mt-2 pt-2'>
                <Link to={`/trajectory/linear/${personId}`}>
                  Linear {personId} (n. {grouped[personId].length})
                </Link>
                <br />
                <Link to={`/trajectory/circular/${personId}`}>
                  Circular {personId} (n. {grouped[personId].length})
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <main className='col-10 print-as-full-width'>
          <Routes>
            <Route index element={<Home />} />
            <Route
              path='trajectory/linear/:personId'
              element={
                <PersonTrajectory
                  type='linear'
                  data={[trajectories, places, settings, legends]}
                />
              }
            />
            <Route
              path='trajectory/circular/:personId'
              element={
                <PersonTrajectory
                  type='circular'
                  data={[trajectories, places, settings, legends]}
                />
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
    <CsvLoader url='/data/trajectories.tsv,/data/places.csv,/data/settings.csv,/data/legends.tsv'>
      <RoutesWrapper data={[[], [], [], []]} />
    </CsvLoader>
  )
}

export default App
