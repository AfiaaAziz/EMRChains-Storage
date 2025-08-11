import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

function Breadcrumbs({ path, onNavigate }) {
  const parts = path ? path.split('/') : []
  return (
    <div className="mb-3 text-sm">
      <button className="text-blue-600 mr-2" onClick={() => onNavigate('')}>root</button>
      {parts.map((p, i) => {
        const sub = parts.slice(0,i+1).join('/')
        return (<span key={i}>/ <button className="text-blue-600 mr-2" onClick={() => onNavigate(sub)}>{p}</button></span>)
      })}
    </div>
  )
}

export default function App(){
  const [items, setItems] = useState([])
  const [path, setPath] = useState('')
  const [folderName, setFolderName] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchList = async (p = path) => {
    try {
      setLoading(true)
      const res = await axios.get(`${API}/list`, { params: { path: p } })
      setItems(res.data)
    } catch (err) {
      alert(err?.response?.data?.message || err.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchList('') }, [])

  const navigateTo = (p) => { setPath(p); fetchList(p) }
  const openFolder = (name) => navigateTo(path ? `${path}/${name}` : name)

  const createFolder = async () => {
    if (!folderName.trim()) return alert('Enter folder name')
    try {
      await axios.post(`${API}/create-folder`, { folderName }, { params: { path } })
      setFolderName('')
      fetchList()
    } catch (err) { alert(err?.response?.data?.message || err.message) }
  }

  const upload = async () => {
    if (!file) return alert('Choose a file')
    const fd = new FormData(); fd.append('file', file)
    try {
      await axios.post(`${API}/upload`, fd, { params: { path }, headers: { 'Content-Type': 'multipart/form-data' } })
      setFile(null); fetchList()
    } catch (err) { alert(err?.response?.data?.message || err.message) }
  }

  const download = (name) => {
    const filePath = path ? `${path}/${name}` : name
    window.open(`${API}/download?path=${encodeURIComponent(filePath)}`, '_blank')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">EMRChains — File Storage</h1>

      <Breadcrumbs path={path} onNavigate={navigateTo} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-medium mb-2">Create folder</h2>
          <div className="flex">
            <input className="flex-1 border px-2 py-1 rounded" value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="Folder name" />
            <button className="ml-2 px-3 py-1 bg-green-600 text-white rounded" onClick={createFolder}>Create</button>
          </div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-medium mb-2">Upload file</h2>
          <div className="flex items-center">
            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <button className="ml-2 px-3 py-1 bg-blue-600 text-white rounded" onClick={upload}>Upload</button>
          </div>
          <div className="text-xs text-gray-500 mt-2">Uploading to: <span className="font-medium">{path || 'root'}</span></div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h3 className="font-medium mb-3">Contents {loading && <span className="text-sm text-gray-500">loading...</span>}</h3>
        {!items.length && <div className="text-gray-600">No items</div>}
        <ul>
          {items.map(it => (
            <li key={it.name} className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-8 text-center">{it.isFolder ? '📁' : '📄'}</div>
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-gray-500">{it.isFolder ? 'Folder' : `${(it.size/1024).toFixed(1)} KB`} • {new Date(it.mtime).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {it.isFolder ? <button className="px-2 py-1 text-sm border rounded" onClick={() => openFolder(it.name)}>Open</button> :
                  <button className="px-2 py-1 text-sm border rounded" onClick={() => download(it.name)}>Download</button>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}