import Trajectories from './components/Trajectories'
import CsvLoader from './CsvLoader'
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'

function App() {
  return (
    <div className='container'>
      <div className='row'>
        <CsvLoader url='/data/trajectories.csv,/data/places.csv,/data/settings.csv'>
          <Trajectories data={[[], [], []]} />
        </CsvLoader>
      </div>
    </div>
  )
}

export default App
