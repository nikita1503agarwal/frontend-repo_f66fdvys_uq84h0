import { useState } from 'react'
import { Plus, Trash2, Copy, GripVertical, Edit, Save, Share2, Moon, Sun } from 'lucide-react'

const FIELD_TYPES = [
  { type: 'text', label: 'Single line text' },
  { type: 'textarea', label: 'Multiline text' },
  { type: 'email', label: 'Email' },
  { type: 'phone', label: 'Phone' },
  { type: 'number', label: 'Number' },
  { type: 'date', label: 'Date' },
  { type: 'file', label: 'File upload' },
  { type: 'dropdown', label: 'Dropdown' },
  { type: 'checkbox', label: 'Checkboxes' },
  { type: 'radio', label: 'Radio buttons' },
  { type: 'signature', label: 'Signature' },
]

function uid() { return Math.random().toString(36).slice(2, 9) }

export default function Builder({ onFormCreated }) {
  const [title, setTitle] = useState('Untitled Form')
  const [description, setDescription] = useState('')
  const [fields, setFields] = useState([])
  const [dark, setDark] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const addField = (type) => {
    const base = { id: uid(), type, label: `${type} field`, required: false }
    if (type === 'dropdown' || type === 'checkbox' || type === 'radio') {
      base.options = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ]
    }
    setFields((f) => [...f, base])
  }

  const duplicateField = (id) => {
    const f = fields.find((x) => x.id === id)
    if (!f) return
    setFields((arr) => [...arr, { ...JSON.parse(JSON.stringify(f)), id: uid(), label: f.label + ' (copy)' }])
  }

  const deleteField = (id) => setFields((arr) => arr.filter((x) => x.id !== id))

  const moveField = (index, dir) => {
    const to = index + dir
    if (to < 0 || to >= fields.length) return
    const newArr = [...fields]
    const [item] = newArr.splice(index, 1)
    newArr.splice(to, 0, item)
    setFields(newArr)
  }

  const saveForm = async () => {
    setLoading(true); setMessage('')
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL
      const token = window.localStorage.getItem('firebase_id_token') || ''
      const res = await fetch(`${baseUrl}/api/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, description, fields }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setMessage('Form saved! Share URL copied to clipboard.')
      navigator.clipboard.writeText(data.share_url).catch(() => {})
      onFormCreated?.(data)
    } catch (e) {
      setMessage(`Error: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <header className="border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur z-10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold text-xl">SmartForm Builder</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDark(!dark)} className="px-3 py-2 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                {dark ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
              </button>
              <button onClick={saveForm} disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded">
                <Save className="w-4 h-4"/> Save & Share
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full text-2xl font-semibold bg-transparent outline-none"/>
              <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full mt-2 bg-transparent outline-none text-slate-600 dark:text-slate-300" placeholder="Form description"/>
            </div>

            {fields.map((f, idx) => (
              <div key={f.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <GripVertical className="w-4 h-4"/>
                    <span className="uppercase text-xs tracking-wider">{f.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>moveField(idx,-1)} className="px-2 py-1 text-sm border rounded">Up</button>
                    <button onClick={()=>moveField(idx,1)} className="px-2 py-1 text-sm border rounded">Down</button>
                    <button onClick={()=>duplicateField(f.id)} className="p-2 border rounded"><Copy className="w-4 h-4"/></button>
                    <button onClick={()=>deleteField(f.id)} className="p-2 border rounded text-red-600"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-500">Label</label>
                    <input value={f.label} onChange={(e)=>{
                      const v=e.target.value; setFields(arr=>arr.map(x=>x.id===f.id?{...x,label:v}:x))
                    }} className="w-full mt-1 border rounded px-3 py-2 bg-transparent"/>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500">Placeholder</label>
                    <input value={f.placeholder||''} onChange={(e)=>{
                      const v=e.target.value; setFields(arr=>arr.map(x=>x.id===f.id?{...x,placeholder:v}:x))
                    }} className="w-full mt-1 border rounded px-3 py-2 bg-transparent"/>
                  </div>
                  <div className="flex items-center gap-2">
                    <input id={`req-${f.id}`} type="checkbox" checked={f.required} onChange={(e)=>{
                      const v=e.target.checked; setFields(arr=>arr.map(x=>x.id===f.id?{...x,required:v}:x))
                    }} />
                    <label htmlFor={`req-${f.id}`}>Required</label>
                  </div>
                </div>

                {(f.type==='dropdown'||f.type==='checkbox'||f.type==='radio') && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-500">Options</span>
                      <button onClick={()=>setFields(arr=>arr.map(x=>x.id===f.id?{...x,options:[...(x.options||[]),{label:'New option',value:`opt-${uid()}` }]}:x))} className="px-2 py-1 text-sm border rounded"><Plus className="w-4 h-4"/></button>
                    </div>
                    <div className="space-y-2">
                      {(f.options||[]).map((opt,i)=> (
                        <div key={i} className="flex items-center gap-2">
                          <input value={opt.label} onChange={(e)=>{
                            const v=e.target.value; setFields(arr=>arr.map(x=>x.id===f.id?{...x,options:x.options.map((o,j)=>j===i?{...o,label:v}:o)}:x))
                          }} className="flex-1 border rounded px-3 py-2 bg-transparent"/>
                          <button onClick={()=>setFields(arr=>arr.map(x=>x.id===f.id?{...x,options:x.options.filter((_,j)=>j!==i)}:x))} className="p-2 border rounded text-red-600"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {message && <div className="text-sm p-3 rounded border bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800">{message}</div>}
          </section>

          <aside className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-semibold mb-3">Add a field</h3>
              <div className="grid grid-cols-2 gap-2">
                {FIELD_TYPES.map((t)=> (
                  <button key={t.type} onClick={()=>addField(t.type)} className="px-3 py-2 text-left border rounded hover:bg-slate-50 dark:hover:bg-slate-700">
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-semibold mb-2">Tips</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc pl-5 space-y-1">
                <li>Drag with Up/Down to rearrange</li>
                <li>Use Save to generate a share link</li>
                <li>Required fields will be validated</li>
              </ul>
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}
