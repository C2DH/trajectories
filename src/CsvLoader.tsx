import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'

const CsvLoader: React.FC<{ url: string; children: React.ReactNode }> = ({
  url,
  children,
}) => {
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all(
          url.split(',').map((u) => fetch(u.trim()))
        )
        const csvTexts = await Promise.all(
          responses.map((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`)
            }
            return response.text()
          })
        )

        const allData: any[] = []
        csvTexts.forEach((csvText) => {
          Papa.parse<any>(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            transform: (value) => {
              return value.trim()
            },
            complete: (result) => {
              allData.push(result.data)
            },
            error: (err: Error) => {
              setError(err.message)
            },
          })
        })

        setData(allData)
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
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export default CsvLoader
