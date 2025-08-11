// client/src/App.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiFolder, FiFile, FiDownload, FiTrash2, FiUpload, FiPlus, FiLoader, FiChevronRight, FiHome } from "react-icons/fi";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// --- BREADCRUMBS COMPONENT ---
function Breadcrumbs({ path, onNavigate }) {
  const parts = path ? path.split("/") : [];
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-4">
      <button className="flex items-center text-emerald-600 hover:underline" onClick={() => onNavigate("")}>
        <FiHome className="mr-2" />
        Root
      </button>
      {parts.map((p, i) => {
        const subPath = parts.slice(0, i + 1).join("/");
        return (
          <span key={i} className="flex items-center">
            <FiChevronRight className="mx-2" />
            <button className="text-emerald-600 hover:underline" onClick={() => onNavigate(subPath)}>
              {p}
            </button>
          </span>
        );
      })}
    </nav>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [items, setItems] = useState([]);
  const [path, setPath] = useState("");
  const [folderName, setFolderName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); // Ref for hidden file input

  const fetchList = async (p = path) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/list`, { params: { path: p } });
      setItems(res.data);
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList("");
  }, []);

  const navigateTo = (p) => {
    setPath(p);
    fetchList(p);
  };

  const openFolder = (name) => navigateTo(path ? `${path}/${name}` : name);

  const createFolder = async () => {
    if (!folderName.trim()) return alert("Please enter a folder name.");
    try {
      await axios.post(`${API}/create-folder`, { folderName }, { params: { path } });
      setFolderName("");
      await fetchList();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      upload(selectedFile);
    }
  }

  const upload = async (fileToUpload) => {
    const fd = new FormData();
    fd.append("file", fileToUpload);
    try {
      await axios.post(`${API}/upload`, fd, { params: { path } });
      await fetchList();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally {
        // Clear the file input
        if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const download = (name) => {
    const filePath = path ? `${path}/${name}` : name;
    window.open(`${API}/download?path=${encodeURIComponent(filePath)}`, "_blank");
  };

  const deleteItem = async (name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    const itemPath = path ? `${path}/${name}` : name;
    try {
        await axios.delete(`${API}/delete`, { params: { path: itemPath } });
        await fetchList();
    } catch (err) {
        alert(err?.response?.data?.message || err.message);
    }
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">EMRChains - Secure Storage</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2 flex items-center"><FiPlus className="mr-2"/>Create Folder</h2>
            <div className="flex">
              <input className="flex-1 border px-3 py-2 rounded-l-md focus:ring-emerald-500 focus:border-emerald-500" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Folder name" />
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-r-md hover:bg-emerald-700 font-semibold" onClick={createFolder}>Create</button>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2 flex items-center"><FiUpload className="mr-2"/>Upload File</h2>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold" onClick={() => fileInputRef.current.click()}>Choose File to Upload</button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <div className="text-xs text-gray-500 mt-2">Uploading to: <span className="font-medium text-gray-700">{path || "Root"}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <Breadcrumbs path={path} onNavigate={navigateTo} />
          {loading && <div className="flex justify-center items-center py-8"><FiLoader className="animate-spin text-4xl text-emerald-500" /></div>}
          
          {!loading && !items.length && <div className="text-center text-gray-500 py-8">This folder is empty.</div>}
          
          {!loading && items.length > 0 && (
            <ul>
              {items.map((it) => (
                <li key={it.name} className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-slate-50">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl text-gray-500">{it.isFolder ? <FiFolder className="text-emerald-500" /> : <FiFile className="text-blue-500" />}</div>
                    <div>
                      <div className="font-medium text-gray-800">{it.name}</div>
                      <div className="text-xs text-gray-500">{it.isFolder ? "Folder" : `${(it.size / 1024).toFixed(1)} KB`} • {new Date(it.mtime).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {it.isFolder ? (
                      <button className="px-3 py-1 text-sm bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200" onClick={() => openFolder(it.name)}>Open</button>
                    ) : (
                      <button className="px-3 py-1 text-sm bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200" onClick={() => download(it.name)}><FiDownload /></button>
                    )}
                    <button className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600" onClick={() => deleteItem(it.name)}><FiTrash2/></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}