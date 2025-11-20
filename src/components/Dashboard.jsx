import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart2, FileText, Plus, Share2, LogOut, Download } from 'lucide-react'

export default function Dashboard(){
  const base = import.meta.env.VITE_BACKEND_URL
  const [forms, setForms] = useState([])
  const [selected, setSelected] = useState(null)
  const [analytics, setAnalytics] = useState(null)

  const token = window.localStorage.getItem('firebase_id_token') || ''

  const load = async()=>{
    const res = await fetch(`${base}/api/forms`, { headers: { Authorization: `Bearer ${token}` }})
    if(res.ok){
      const data = await res.json(); setForms(data.forms)
    }
  }

  const loadAnalytics = async (slug) => {
    const res = await fetch(`${base}/api/forms/${slug}/analytics`, { headers: { Authorization: `Bearer ${token}` }})
    if (res.ok) setAnalytics(await res.json())
  }

  useEffect(()=>{ load() }, [])

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-bold'>Dashboard</h1>
          <div className='flex gap-2'>
            <Link to='/builder' className='bg-blue-600 text-white px-3 py-2 rounded inline-flex items-center gap-2'><Plus className='w-4 h-4'/> New Form</Link>
            <button onClick={()=>{ window.localStorage.removeItem('firebase_id_token'); window.location.href='/' }} className='px-3 py-2 border rounded inline-flex items-center gap-2'><LogOut className='w-4 h-4'/> Log out</button>
          </div>
        </div>

        <div className='grid md:grid-cols-3 gap-4'>
          <div className='md:col-span-2'>
            <div className='bg-white border rounded-xl p-4'>
              <h2 className='font-semibold mb-3'>Your Forms</h2>
              <div className='divide-y'>
                {forms.map((f)=> (
                  <div key={f._id} className='py-3 flex items-center justify-between'>
                    <div>
                      <div className='font-medium'>{f.title}</div>
                      <div className='text-sm text-slate-600'>/{f.share_slug}</div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <a href={`/f/${f.share_slug}`} target='_blank' className='px-3 py-1.5 border rounded inline-flex items-center gap-2'><Share2 className='w-4 h-4'/> Open</a>
                      <button onClick={()=>{ setSelected(f); loadAnalytics(f.share_slug) }} className='px-3 py-1.5 border rounded inline-flex items-center gap-2'><BarChart2 className='w-4 h-4'/> Analytics</button>
                      <a href={`${base}/api/forms/${f.share_slug}/export/csv`} className='px-3 py-1.5 border rounded inline-flex items-center gap-2'><Download className='w-4 h-4'/> CSV</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className='bg-white border rounded-xl p-4 min-h-[200px]'>
              <h2 className='font-semibold mb-3'>Analytics</h2>
              {selected && analytics ? (
                <div>
                  <div className='text-sm text-slate-600 mb-2'>{selected.title}</div>
                  <div className='text-3xl font-bold'>{analytics.count}</div>
                  <div className='text-sm text-slate-600'>Total submissions</div>
                  <div className='mt-3'>
                    <h3 className='font-medium text-sm mb-1'>Recent entries</h3>
                    <div className='space-y-2 max-h-48 overflow-auto'>
                      {analytics.recent.map(r=> (
                        <div key={r._id} className='text-xs bg-slate-50 border rounded px-2 py-1'>
                          <pre className='whitespace-pre-wrap break-all'>{JSON.stringify(r.data, null, 2)}</pre>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-sm text-slate-600'>Select a form to see analytics</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
