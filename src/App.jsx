import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

// src/App.jsx
export default function App() {
  return (
    <div className="min-h-dvh grid place-items-center bg-neutral-950 text-neutral-100">
      <h1 className="text-3xl md:text-4xl font-bold">Speako ✅</h1>
      {/* TODO: nanti diisi TeleprompterPage */}
    </div>
  );
}



// function App() {
//   const [count, setCount] = useState(0)
//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1 className="text-4xl font-bold text-purple-500">Vite + React + Tailwind</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
