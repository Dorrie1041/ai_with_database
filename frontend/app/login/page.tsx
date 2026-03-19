"use client"

import { useEffect, useState } from "react"

export default function LoginPage (){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")

    useEffect(() => {
        document.title = "Login"
    }, [])

    async function handleLogin(e:React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!email || !password) {
            setMessage("Please fill in all Fields")
            return
        }
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setMessage("Login successful ")

                {/* track info after login   */}
                localStorage.setItem("username", data.username)
            } else {
                setMessage(data.detail || "Login failed")
            }
        } catch (error) {
            setMessage("Server error")
        } 
    }

    return (
        <main>
            <h1>Login</h1>

            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label> 
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}>
                    </input>
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}>
                    </input>
                </div>
                
                <button type="submit">Login</button>
            </form>
            <p>{message}</p>

        </main>
    )
}