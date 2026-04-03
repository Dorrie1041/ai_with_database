"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import "../globals.css"

export default function LoginPage (){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [showPassword, setshowPassword] = useState(false)
    const router = useRouter()

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
            const response = await fetch("http://localhost:8000/login", {
                method: "POST",
                credentials: "include",
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
                router.push("/")
            } else {
                setMessage(data.detail || "Login failed")
            }
        } catch (error) {
            setMessage("Server error")
        } 
    }

    useEffect(() =>{
        async function checkLogin() {
            try {
                const res = await fetch("http://localhost:8000/user", {
                    credentials: "include",
                })
                
                if (res.ok) {
                    router.push("/")
                }
            } catch {}
        }
        checkLogin()
    }, [])

    return (
        <main className="login-main">
            <div className="login-card">
            <h1 className="login-title">Login</h1>

            <form onSubmit={handleLogin} className="login-form">
                <div className="login-field">
                    <label className="login-label">Email:</label> 
                    <input className="login-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)}>
                    </input>
                </div>
                <div className="login-field">
                    <label className="login-label">Password:</label>
                    <div className="password-wrapper">
                    <input className="login-input" 
                    type={showPassword ? "text" : "password"} 
                    value={password} onChange={(e) => setPassword(e.target.value)}>
                    </input>
                    <button type="button" className="toggle-password"
                    onClick={() => setshowPassword((prev) => !prev)}
                    >
                        {showPassword ? <FaEyeSlash/> : <FaEye/>}
                    </button>
                    </div>
                </div>

                
                <button type="submit" className="login-button" formNoValidate>Login</button>
            </form>
            <p className="login-message" >{message}</p>
        </div>
        </main>
    )
}