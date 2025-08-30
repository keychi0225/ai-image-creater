import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CsvUploadPage from './component/CsvUploadPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <CsvUploadPage />
    </>
  )
}

export default App
