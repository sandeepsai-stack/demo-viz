import { useState } from 'react'
import MGatewayOne from './components/MGatewayOne'
import MGatewayTwo from './components/MGatewayTwo'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <MGatewayOne/>
    <MGatewayTwo/>
    </>
  )
}

export default App
