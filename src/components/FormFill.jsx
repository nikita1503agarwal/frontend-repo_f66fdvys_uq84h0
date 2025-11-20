import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

function Field({ field, value, onChange }) {
  const common = {
    id: field.id,
    name: field.id,
    required: field.required,
    placeholder: field.placeholder || '',
    className: 'w-full border rounded px-3 py-2 bg-white dark:bg-slate-900',
    value: value || '',
    onChange: (e)=>onChange(field.id, e.target.value)
  }
  switch(field.type){
    case 'textarea':
      return <textarea {...common} rows={4} />
    case 'email':
      return <input type="email" {...common} />
    case 'phone':
      return <input type="tel" {...common} />
    case 'number':
      return <input type="number" {...common} />
    case 'date':
      return <input type="date" {...common} />
    case 'file':
      return <input type="file" id={field.id} name={field.id} className='w-full' />
    case 'dropdown':
      return (
        <select {...common}>
          <option value="">Select...</option>
          {(field.options||[]).map((o,i)=> <option key={i} value={o.value}>{o.label}</option>)}
        </select>
      )
    case 'checkbox':
      return (
        <div className='space-y-1'>
          {(field.options||[]).map((o,i)=> (
            <label key={i} className='flex items-center gap-2'>
              <input type='checkbox' name={field.id} value={o.value} onChange={(e)=>onChange(field.id, e.target.checked ? [...(value||[]), o.value] : (value||[]).filter(v=>v!==o.value))} /> {o.label}
            </label>
          ))}
        </div>
      )
    case 'radio':
      return (
        <div className='space-y-1'>
          {(field.options||[]).map((o,i)=> (
            <label key={i} className='flex items-center gap-2'>
              <input type='radio' name={field.id} value={o.value} checked={value===o.value} onChange={(e)=>onChange(field.id, o.value)} /> {o.label}
            </label>
          ))}
        </div>
      )
    case 'signature':
      return <input type='text' {...common} placeholder='Type your name as signature' />
    default:
      return <input type="text" {...common} />
  }
}

export default function FormFill(){
  const { slug } = useParams()
  const [form, setForm] = useState(null)
  const [dark, setDark] = useState(false)
  const [success, setSuccess] = useState('')
  const [errors, setErrors] = useState({})
  const [data, setData] = useState({})

  useEffect(()=>{ (async()=>{
    const base = import.meta.env.VITE_BACKEND_URL
    const res = await fetch(`${base}/api/forms/by-slug/${slug}`)
    if(res.ok){ setForm(await res.json()) }
  })() }, [slug])

  const onChange = (id, val) => {
    setData(d => ({ ...d, [id]: val }))
  }

  const validate = () => {
    const errs = {}
    for (const f of (form?.fields||[])){
      const val = data[f.id]
      if (f.required){
        if (f.type==='checkbox') {
          if (!val || !val.length) errs[f.id] = 'Required'
        } else if (!val){
          errs[f.id] = 'Required'
        }
      }
      if (f.type==='email' && val){
        const re = /[^@]+@[^.]+\..+/
        if (!re.test(val)) errs[f.id] = 'Invalid email'
      }
    }
    setErrors(errs)
    return Object.keys(errs).length===0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form) return
    // Build multipart for files
    const hasFile = (form.fields||[]).some(f=>f.type==='file')
    const base = import.meta.env.VITE_BACKEND_URL
    try{
      let res
      if (hasFile){
        const fd = new FormData(e.target)
        // non-files from state
        for(const [k,v] of Object.entries(data)){
          if (Array.isArray(v)) v.forEach(x=>fd.append(k, x)); else fd.set(k, v)
        }
        res = await fetch(`${base}/api/forms/${form.share_slug}/submit`, { method:'POST', body: fd })
      } else {
        res = await fetch(`${base}/api/forms/${form.share_slug}/submit`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ data }) })
      }
      if (!res.ok) throw new Error(await res.text())
      setSuccess('Thanks! Your response has been recorded.')
    }catch(err){
      setSuccess(`Error: ${err.message}`)
    }
  }

  if (!form) return <div className='min-h-screen flex items-center justify-center text-slate-600'>Loading form…</div>

  return (
    <div className={dark ? 'dark' : ''}>
      <div className='min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100'>
        <div className='max-w-2xl mx-auto px-4 py-8'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-2xl font-bold'>{form.title}</h1>
              <p className='text-slate-600 dark:text-slate-300'>{form.description}</p>
            </div>
            <button onClick={()=>setDark(!dark)} className='px-3 py-2 rounded border border-slate-200 dark:border-slate-700'>Toggle</button>
          </div>

          <form onSubmit={onSubmit} className='space-y-5'>
            {(form.fields||[]).map((f)=> (
              <div key={f.id}>
                <label className='block text-sm mb-1'>{f.label} {f.required && <span className='text-red-500'>*</span>}</label>
                <Field field={f} value={data[f.id]} onChange={onChange} />
                {errors[f.id] && <p className='text-red-500 text-sm mt-1'>{errors[f.id]}</p>}
              </div>
            ))}
            <button onClick={()=>{ if(!validate()) return }} type='submit' className='bg-blue-600 text-white px-4 py-2 rounded'>Submit</button>
          </form>

          {success && <div className='mt-6 p-3 border rounded text-green-700 dark:text-green-200'>{success}</div>}
        </div>
      </div>
    </div>
  )
}
