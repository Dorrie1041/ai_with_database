"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function UploadPage(){
    type FileItem = {
        file_id: string
        original_filename: string
    }
    const [message, setMessage] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [username, setUsername] = useState("")
    const [loading, setLoading] = useState(false)
    const [files, setFiles] = useState<FileItem[]>([])
    const [files_message, setfiles_message] = useState("")
    
    const router = useRouter()

    useEffect(() => {
        document.title = "Upload"
        async function CheckUser() {
            try{
                const response = await fetch("http://localhost:8000/user",
                    {credentials: "include"})
                if (!response.ok){
                    router.push("\login")
                    return
                }
                const user = await response.json()
                if (user?.username){
                    setUsername(user.username)
                }
            } catch (error) {
                router.push("\login")
            } 
        }
        CheckUser()
        handleFiles()
    }, [router])

        async function handleUpload() {
            if (!file){
                setMessage("Please choose a file.")
                return
            }
            setLoading(true)
            setMessage("")

            try {
                const formData = new FormData()
                formData.append("file", file)

                const response = await fetch("http://localhost:8000/upload", {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                })

                const data = await response.json()

                if (response.ok){
                    setMessage(`Upload successful: ${data.original_filename}`)
                    setFile(null)
                    await handleFiles()
                } else {
                    setMessage(data.detail || "Upload failed. ")
                }
            } catch (error){
                setMessage("Server error. ")
            } finally{
                setLoading(false)
            }
        }

        async function handleLogout() {
            try {
                await fetch("http://localhost:8000/logout", {
                    method: "POST",
                    credentials: "include",
                })
            } catch (error) {
                console.log("Logout failed")
            }
            router.push("/login")
        }

        async function handleFiles() {
            try {
                const res = await fetch("http://localhost:8000/files", {
                    method: "GET",
                    credentials: "include",
                })

                if (!res.ok){
                    setfiles_message("Can not get files")
                    return
                }

                const data = await res.json()
                setFiles(data)
                setfiles_message("")
                
                
            } catch (error){
                console.log("Get files failed")
                setfiles_message("Server error")
            }
            
        }

        async function handleDownload(fileId: string){
            try {
                const res = await fetch(
                    `http://localhost:8000/files/${fileId}/download`,
                    {
                        credentials: "include",
                    }
                )

                const data = await res.json()

                if (res.ok){
                    window.open(data.download_url, "_blank")
                } else {
                    setfiles_message(data.detail || "Download failed")
                }
            } catch (error) {
                setfiles_message("Server error")
            }
        }

        async function handlePreview(fileId: string) {
            try {
                const response = await fetch(
                    `http://localhost:8000/files/${fileId}/preview`,
                    {
                        method: "GET",
                        credentials: "include"
                    })

                    const data = await response.json()

                    if (response.ok){
                        window.open(data.preview_url, "_blank")
                    } else {
                        setfiles_message(data.detail || "Preview failed")
                    }
            } catch (error){
                setfiles_message("Server error")
            }
        }

        async function handleDelete(fileId: string) {
            try {
                const response = await fetch(`http://localhost:8000/files/${fileId}`, {
                    method: "DELETE",
                    credentials: "include",
                })

                const data = await response.json()

                if (response.ok){
                    setfiles_message("File deleted successfully")
                    await handleFiles()
                } else {
                    setfiles_message(data.detail || "Detele failed")
                }
            } catch (error){
                setfiles_message("Server error")
            }   
        }

        return (
            <main>
                <h1>Upload File</h1>
                <p>Hello, {username}</p>
                <input type="file"
                       accept=".csv,.json" 
                       onChange={(e) => setFile(e.target.files?.[0] || null)}>
                </input>    

                <div>
                    <button onClick={handleUpload} disabled={loading}>
                        {loading ? "Uploading..." : "Upload"}
                    </button>

                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </div>
                {file && (
                    <p>Selected File: {file.name}</p>
                )}
                {message && (
                    <p>
                        {message}
                    </p>
                )}

                <h2>Your Files</h2>
                {files_message && <p>{files_message}</p>}
                {files.length === 0 ?(
                    <p>No files uploaded</p>
                ) : (
                    <ul>
                        {files.map((file) => (
                            <li key={file.file_id}>
                                {file.original_filename}
                                <button
                                    onClick={() => handlePreview(file.file_id)}
                                >
                                    Preview
                                </button>

                                <button
                                    onClick={() => handleDownload(file.file_id)}
                                >
                                    Download
                                </button>

                                <button
                                    onClick={() => handleDelete(file.file_id)}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        )
}