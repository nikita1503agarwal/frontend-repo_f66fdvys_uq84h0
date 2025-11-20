import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Builder from './components/Builder'
import FormFill from './components/FormFill'
import Dashboard from './components/Dashboard'

function Home(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-bold mb-4">SmartForm Builder</h1>
        <p className="text-blue-200/90 mb-8">Create forms, share links, collect responses, and auto-save to Google Sheets with file uploads to Drive.</p>
        <div className="flex gap-3">
          <Link to="/builder" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Open Builder</Link>
          <Link to="/dashboard" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded">View Dashboard</Link>
        </div>
        <div className="mt-12 text-blue-300/70 text-sm">
          Demo mode: store a Firebase ID token in localStorage as "firebase_id_token" to enable admin routes.
        </div>
      </div>
    </div>
  )
}

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/builder" element={<Builder/>} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="/f/:slug" element={<FormFill/>} />
    </Routes>
  )
}
