"use client"

import { useState, useEffect } from "react"
import {useRouter} from "next/navigation"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import "../globals.css"

export default function RegisterPage() {
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirm_pass, setComfirm_pass] = useState("")
    const [message, setMessage] = useState("")
    const router = useRouter()
    const [showPassword, setshowPassword] = useState(false)

    useEffect (() => {
    document.title = "Register"
        }, [])

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (!email || !username || !password || !confirm_pass) {
            setMessage("Please fill in all Fields")
            return
        }

        if (!email.includes("@")){
            setMessage("Please enter a valid email address")
            return
        }

        if (password !== confirm_pass) {
            setMessage("password should match with confirm Password")
            return
        }
        try {
            const response = await fetch ("http://127.0.0.1:8000/register", {
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
                    router.push("/login")
                } else {
                    setMessage(data.detail || "Register failed")
                } 

        } catch (error){
          setMessage("Server error")   
        }
    }
    return (
        <main className="register-main">
            <div className="register-card">
            <h1 className="register-title">Register</h1>
            <form onSubmit={handleRegister} className="register-form">
                <div className="register-field">
                    <label className="register-label">Email: </label>
                    <input className="register-input" type="email" value={email} 
                    onChange={(e) => setEmail(e.target.value)}>
                    </input>
                </div>

                <div className="register-field">
                    <label className="register-label">Username: </label>
                    <input className="register-input" type="text" value={username}
                    onChange={(e) => setUsername(e.target.value)}>
                    </input>
                </div>

                <div className="register-field">
                    <label className="register-label">Password:</label>
                    <div className="password-wrapper">
                    <input className="register-input" 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}>
                    </input>
                    <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setshowPassword((prev) => !prev)}
                    >
                        {showPassword ? <FaEyeSlash/>:< FaEye/>}
                    </button>
                    </div>
                </div>

                <div className="register-field">
                    <label className="register-label">Comfirm Password:</label>
                    <div className="password-wrapper">
                    <input className="register-input" 
                    type={showPassword ? "text" : "password"} 
                    value={confirm_pass}
                    onChange={(e) => setComfirm_pass(e.target.value)}>
                    </input>
                    <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setshowPassword((prev) => !prev)}
                    >
                        {showPassword ? <FaEyeSlash/> : <FaEye/>}
                    </button>
                    </div>
                </div>
                <button className="register-button" type="submit" formNoValidate>Register</button>
            </form>

            <p className="register-message">{message}</p>
        </div>
        </main>
    )
}