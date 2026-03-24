"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function UploadPage(){
    const [message, setMessage] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [username, setUsername] = useState("")
    const [loading, setLoading] = useState(false)
    
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

        return (
            <main>
                <h1>Upload File</h1>
                <p>Hello, {username}</p>
                <input type="file"
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
            </main>
        )
}