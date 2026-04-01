"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import "../globals.css"

type Message = {
    id: number
    role: "user" | "assistant"
    content: string
}

type UploadedFile = {
    file_id: string
    original_filename: string
}

export default function AgentPage() {
    const router = useRouter()
    
    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    {/* Invisible <div ref={messagesEndRef}/> at the bottom of the chat 
        Auto-scrolling 
        */}

    const [username, setUsername] = useState("")
    const [files, setFiles] = useState<UploadedFile[]>([])
    const [selectedFileId, setSelectedFileId] = useState("")
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            role: "assistant",
            content:
                "Hello ! I'm your AI agent. Please choose one CSV or JSON file, then ask me what you want to analyze."
        }
    ])

    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [pageMessage, setPageMessage] = useState("")

    useEffect(() => {
        document.title = "AI Agent"

        async function initializePage() {
            try {
                const userResponse = await fetch("http://localhost:8000/user", {
                    credentials: "include",
                })

                if (!userResponse.ok){
                    router.push("/login")
                    return
                }

                const user = await userResponse.json()

                if (user?.username){
                    setUsername(user.username)
                }

                const filesResponse = await fetch("http://localhost:8000/files", {
                    credentials: "include",
                })

                if (filesResponse.ok){
                    const filesData = await filesResponse.json()
                    setFiles(filesData)
                } else {
                    setPageMessage("Could not load your files.")
                }
            } catch (error){
                router.push("/login")
            }
        }

        initializePage()
    }, [router])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"})
    }, [messages]) 
    {/* Runs every time messages changes 
        Scrolls the page/container to that element (make chat automatically stay at the newest message)
        */}


    async function handleLogout() {
        try{
            await fetch("http://localhost:8000/logout", {
                method: "POST",
                credentials: "include",
            })
        } catch (error){
            console.log("Logout failed")
        }
        
        router.push("/login")
    }

    async function handleSend(){

        {/* trim -> removes extra spaces at beginning */}
        const trimmedInput = input.trim()

        if (!selectedFileId){
            setPageMessage("Please choose a file first.")
            return
        }

        {/* Ignore empty message */}
        if (!trimmedInput){
            return
        }

        setPageMessage("")

        const userMessage: Message = {
            id: Date.now(),
            role: "user",
            content: trimmedInput,
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setLoading(true)

        {/* connect with ai_agent */}
        const res = await fetch("http://localhost:8000/agent/chat", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                file_id: selectedFileId,
                message: trimmedInput,
            }),
        })

        const data = await res.json()

        const assistantMessage: Message = {
            id: Date.now() + 1,
            role: "assistant",
            content: data.reply,
        }

        setMessages((prev) => [...prev, assistantMessage])
        setLoading(false)

    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>){
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <main className="agent-main">
            <div className="agent-div-1">
                <div>
                    <h1 style={{margin: 0}}>AI Agent</h1>
                    <p style={{margin: "8px 0 0 0"}}>Hello, {username}</p>
                </div>

                <button className="logout" onClick={handleLogout}>Logout</button>
            </div>

            <div className="agent-files-choose">
                <label htmlFor="file-select">Choose a file:</label>

                <select
                    id="file-select"
                    value={selectedFileId}
                    onChange={(e) => setSelectedFileId(e.target.value)}
                    style={{padding: "8px", minWidth: "260px"}}
                >
                    <option value="">-- Select a file --</option>
                    {files.map((file) => (
                        <option key={file.file_id} value={file.file_id}>
                            {file.original_filename}
                        </option>
                    ))}
                </select>
            </div>

            {pageMessage && (
                <p style={{ marginTop: 0, marginBottom: "12px" }}>{pageMessage}</p>
            )}

            <div className="agent-chat">
                {messages.map((messages) => {
                    const isUser = messages.role === "user"

                    return (
                        <div key={messages.id}
                             style={{
                                display: "flex",
                                justifyContent: isUser ? "flex-end" : "flex-start",
                                marginBottom: "12px",
                             }}   
                        >
                            <div 
                                style={{
                                    maxWidth: "70%",
                                    padding: "12px 16px",
                                    borderRadius: "16px",
                                    backgroundColor: isUser ? "#dbeafe" : "#e5e7eb",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                }}  
                            >
                                <strong style={{display: "block", marginBottom: "4px"}}>
                                    {isUser ? "You": "AI Agent"}
                                </strong>
                                {messages.content}
                            </div>    
                        </div>
                    )
                })}

                {loading && (
                    <div className="agent-loading">
                        <div className="agent-loading-2">
                            <strong style={{display: "block", marginBottom: "4px"}}>
                                AI Agent
                            </strong>
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="agent-input-div">
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask something about selected file..."
                    rows={3}
                    className="agent-input"
                />

                <button 
                    onClick={handleSend}
                    disabled={loading}
                    className="agent-send-button"
                >
                    Send
                </button>
            </div>

        </main>
    )
}