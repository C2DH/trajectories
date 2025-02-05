import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'

interface Place {
  id: string
  name: string
  lat: number
  lng: number
  accuracy: string
  type: string
}

const CsvLoader: React.FC<{ url: string; children: React.ReactNode }> = ({
  url,
  children,
}) => {
  const [data, setData] = useState<Place[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const csvText = await response.text()

        Papa.parse<Place>(csvText, {
          header: true, // Assuming the first row contains column names
          skipEmptyLines: true,

          complete: (result) => {
            setData(result.data)
          },
          error: (err: Error) => {
            setError(err.message)
          },
        })
      } catch (err) {
        setError((err as Error).message)
      }
    }

    fetchData()
  }, [url])

  if (error) {
    return <div>Error: {error}</div>
  }
  if (children) {
    return React.cloneElement(children as React.ReactElement<any>, { data })
  }
  return (
    <div>
      <h1>Places</h1>
      {data.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Accuracy</th>
              <th>Type</th>
              <th>Latitude</th>
              <th>Longitude</th>
            </tr>
          </thead>
          <tbody>
            {data.map((place, index) => (
              <tr key={index}>
                <td>{place.id}</td>
                <td>{place.name}</td>
                <td>{place.accuracy}</td>
                <td>{place.type}</td>
                <td>{place.lat}</td>
                <td>{place.lng}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  )
}

export default CsvLoader
