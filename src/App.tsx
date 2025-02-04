import CircularTimeline from './CircularTimeline'
import CsvLoader from './CsvLoader'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  return (
    <div className='container'>
      <div className='row'>
        <CircularTimeline
          data={[
            // Traj. Number	personId 	sourceId 	targetId 	Moving date (dd-MM-yyyy)		DataAccuracy	 trajectoryType
            // 1	1	Home 	12	12/10/1959		day	consultation
            // 2	1	12	Home	12/10/1959		day
            // 3	1	Home 	71	01/07/1960		month	stay
            // 4	1	71	Home 	01/09/1960		month
            // 5	1	Home 	57	02/07/1961		day	stay
            // 6	1	57	Home 	24/08/1961		day
            // 7	1	Home 	12	18/12/1961		day	consultation
            // 8	1	12	Home 	18/12/1961		day
            // 9	1	Home 	12	26/12/1961		day	consultation
            {
              trajNumber: 1,
              personId: 1,
              sourceId: 'Home',
              targetId: '12',
              movingDate: '12/10/1959',
              dataAccuracy: 'day',
              trajectoryType: 'consultation',
            },
            {
              trajNumber: 2,
              personId: 1,
              sourceId: '12',
              targetId: 'Home',
              movingDate: '12/10/1959',
              dataAccuracy: 'day',
            },
            {
              trajNumber: 3,
              personId: 1,
              sourceId: 'Home',
              targetId: '71',
              movingDate: '01/07/1960',
              dataAccuracy: 'month',
              trajectoryType: 'stay',
            },
            {
              trajNumber: 4,
              personId: 1,
              sourceId: '71',
              targetId: 'Home',
              movingDate: '01/09/1960',
              dataAccuracy: 'month',
            },
            {
              trajNumber: 5,
              personId: 1,
              sourceId: 'Home',
              targetId: '57',
              movingDate: '02/07/1961',
              dataAccuracy: 'day',
              trajectoryType: 'stay',
            },
            {
              trajNumber: 6,
              personId: 1,
              sourceId: '57',
              targetId: 'Home',
              movingDate: '24/08/1961',
              dataAccuracy: 'day',
            },
            {
              trajNumber: 7,
              personId: 1,
              sourceId: 'Home',
              targetId: '12',
              movingDate: '18/12/1961',
              dataAccuracy: 'day',
              trajectoryType: 'consultation',
            },
            {
              trajNumber: 8,
              personId: 1,
              sourceId: '12',
              targetId: 'Home',
              movingDate: '18/12/1961',
              dataAccuracy: 'day',
            },
            {
              trajNumber: 9,
              personId: 1,
              sourceId: 'Home',
              targetId: '12',
              movingDate: '26/12/1961',
              dataAccuracy: 'day',
              trajectoryType: 'consultation',
            },
          ]}
        />
        <div className='col'>
          <CsvLoader url='/data/places.csv' />
        </div>
        <div className='col'></div>
      </div>
    </div>
  )
}

export default App
