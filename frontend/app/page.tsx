"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [username, setUsername] = useState("Guest")
  const router = useRouter()
  useEffect(() => {
    document.title = "Home"

    async function fetchUser() {
      try {
        const response = await fetch("http://localhost:8000/user", {
          credentials: "include",
        })

        if (!response.ok) {
          router.push("/login")
          return
        }

        const user = await response.json()

        {/* if user.username existed, username -> [user.username] */}
        if (user?.username){
          setUsername(user.username)
        }
      } catch (error) {
        console.log("User not logged in")
        router.push("/login")
      }
    }

    fetchUser()
  }, [router])


  async function handleLogout() {
      try{
        await fetch("http://localhost:8000/logout", {
          method: "POST",
          credentials: "include",
        })
      } catch(error){
        console.log("Logout failed")
      }
      router.push("/login")
      
    }

  return (
    <main>
      <h1>
        Home
      </h1>
      <p> Hello, {username} </p>
      <button onClick={handleLogout}>Log Out</button>
    </main>
  );
}
