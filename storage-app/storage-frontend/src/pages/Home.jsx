import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FiFolder,
  FiFile,
  FiDownload,
  FiTrash2,
  FiUpload,
  FiPlus,
  FiLoader,
  FiChevronRight,
  FiHome,
  FiLogOut,
  FiFileText, 
  FiFolderPlus, 
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_BASE || "http://localhost:5000";


function Breadcrumbs({ path, onNavigate }) {
  const parts = path ? path.split("/") : [];
  return (
    <nav className="flex items-center text-sm font-medium text-gray-500 mb-4">
      <button
        className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors duration-200"
        onClick={() => onNavigate("")}
      >
        <FiHome className="mr-2" />
        Root
      </button>
      {parts.map((part, i) => {
        const subPath = parts.slice(0, i + 1).join("/");
        return (
          <span key={i} className="flex items-center">
            <FiChevronRight className="mx-2 text-gray-400" />
            <button
              className="text-emerald-600 hover:text-emerald-800 transition-colors duration-200"
              onClick={() => onNavigate(subPath)}
            >
              {part}
            </button>
          </span>
        );
      })}
    </nav>
  );
}


export default function Home({ onLogout }) {
  const [items, setItems] = useState([]);
  const [path, setPath] = useState("");
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

 
  const fetchList = async (currentPath = path) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/list`, { params: { path: currentPath } });
      const sortedItems = response.data.sort((a, b) => {
        if (a.isFolder === b.isFolder) {
          return a.name.localeCompare(b.name);
        }
        return a.isFolder ? -1 : 1;
      });
      setItems(sortedItems);
    } catch (err) {
      alert(err?.response?.data?.message || "An error occurred while fetching files.");
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async () => {
    if (!folderName.trim()) {
      alert("Please enter a folder name.");
      return;
    }
    try {
      await axios.post(`${API_URL}/create-folder`, { folderName }, { params: { path } });
      setFolderName("");
      await fetchList();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create folder.");
    }
  };

  const uploadFile = async (fileToUpload) => {
    const formData = new FormData();
    formData.append("file", fileToUpload);
    try {
      await axios.post(`${API_URL}/upload`, formData, { params: { path } });
      await fetchList();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to upload file.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const deleteItem = async (itemName) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) return;
    const itemPath = path ? `${path}/${itemName}` : itemName;
    try {
      await axios.delete(`${API_URL}/delete`, { params: { path: itemPath } });
      await fetchList();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete item.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      uploadFile(selectedFile);
    }
  };

  const navigateTo = (newPath) => {
    setPath(newPath);
    fetchList(newPath);
  };

  const openFolder = (folderName) => {
    const newPath = path ? `${path}/${folderName}` : folderName;
    navigateTo(newPath);
  };
  
  const downloadFile = (fileName) => {
    const filePath = path ? `${path}/${fileName}` : fileName;
    window.open(`${API_URL}/download?path=${encodeURIComponent(filePath)}`, "_blank");
  };


  useEffect(() => {
    fetchList("");
  }, []);

  return (
    <div className="bg-slate-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">
            EMRChains Storage
          </h1>
          <button
            onClick={onLogout}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 active:scale-95 transition-all duration-200 shadow-md"
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-5 bg-white rounded-xl shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-3 flex items-center text-lg">
              <FiFolderPlus className="mr-3 text-emerald-500" />
              Create a New Folder
            </h2>
            <div className="flex">
              <input
                className="flex-1 border-gray-300 border px-4 py-2 rounded-l-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="File Name"
                onKeyUp={(e) => e.key === 'Enter' && createFolder()}
              />
              <button
                className="px-5 py-2 bg-emerald-600 text-white rounded-r-lg hover:bg-emerald-700 font-semibold active:scale-95 transition-all duration-200"
                onClick={createFolder}
              >
                Create
              </button>
            </div>
          </div>

          <div className="p-5 bg-white rounded-xl shadow-sm flex flex-col justify-center">
             <h2 className="font-semibold text-gray-700 mb-3 flex items-center text-lg">
              <FiUpload className="mr-3 text-blue-500" />
              Upload a File
            </h2>
            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold active:scale-95 transition-all duration-200 flex items-center justify-center"
              onClick={() => fileInputRef.current.click()}
            >
              Choose File...
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Current folder: <span className="font-medium text-gray-700">{path || "Root"}</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <Breadcrumbs path={path} onNavigate={navigateTo} />
          
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <FiLoader className="animate-spin text-5xl text-emerald-500" />
            </div>
          ) : !items.length ? (
            <div className="text-center text-gray-500 py-16">
              <FiFolder size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">This folder is empty</h3>
              <p className="text-sm">Upload a file or create a new folder to get started.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li
                  key={item.name}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 px-2 rounded-lg hover:bg-slate-50 transition-colors duration-150"
                >
                  <div 
                    className="flex items-center space-x-4 flex-grow cursor-pointer" 
                    onClick={() => item.isFolder && openFolder(item.name)}
                  >
                    <div className="text-2xl">
                      {item.isFolder ? <FiFolder className="text-emerald-500" /> : <FiFileText className="text-blue-500" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.isFolder ? "Folder" : `${(item.size / 1024).toFixed(1)} KB`} • Modified: {new Date(item.mtime).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0 self-end sm:self-center">
                    {item.isFolder ? (
                      <button
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                        onClick={() => openFolder(item.name)}
                      >
                        Open
                      </button>
                    ) : (
                      <button
                        className="p-2 text-gray-600 rounded-full hover:bg-gray-200 hover:text-gray-900 transition"
                        onClick={() => downloadFile(item.name)}
                        title="Download"
                      >
                        <FiDownload />
                      </button>
                    )}
                    <button
                      className="p-2 text-red-500 rounded-full hover:bg-red-100 hover:text-red-700 transition"
                      onClick={() => deleteItem(item.name)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
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