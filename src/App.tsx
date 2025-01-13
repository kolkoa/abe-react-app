// src/App.tsx
import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>My React App with Cloudflare Pages</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </button>
        <p>Edit src/App.tsx to test auto-deployment</p>
      </div>
    </>
  )
}

export default App