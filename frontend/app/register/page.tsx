"use client"

import { useState, useEffect } from "react"

export default function RegisterPage() {
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirm_pass, setComfirm_pass] = useState("")
    const [message, setMessage] = useState("")

    useEffect (() => {
    document.title = "Register"
        }, [])

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!email || !username || !password || !confirm_pass) {
            setMessage("Please fill in all Fields")
            return
        }

        if (password != confirm_pass) {
            setMessage("password should match with confirm Password")
            return
        }
        try {
            const response = await fetch ("/api/register", {
                    method: "POST",
                    headers : {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        username,
                        password,
                    }),
                })


                const data = await response.json()
            

                if (response.ok) {
                    setMessage("Register successful")
                } else {
                    setMessage(data.detail || "Register failed")
                } 

        } catch (error){
          setMessage("Server error")   
        }
    }
    return (
        <main>
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
                <div>
                    <label>Email: </label>
                    <input type="email" value={email} 
                    onChange={(e) => setEmail(e.target.value)}>
                    </input>
                </div>

                <div>
                    <label>Username: </label>
                    <input type="text" value={username}
                    onChange={(e) => setUsername(e.target.value)}>
                    </input>
                </div>

                <div>
                    <label>Password:</label>
                    <input type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}>
                    </input>
                </div>

                <div>
                    <label>Comfirm Password:</label>
                    <input type="password" value={confirm_pass}
                    onChange={(e) => setComfirm_pass(e.target.value)}>
                    </input>
                </div>
                <button type="submit">Register</button>
            </form>

            <p>{message}</p>
        </main>
    )
}