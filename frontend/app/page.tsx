"use client"

import { useEffect, useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("Guest")
  useEffect(() => {
    document.title = "Home"
    async function fetchUser() {
      try {
        const response = await fetch("/api/user")

        if (!response.ok) return

        const user = await response.json()

        {/* if user.username existed, username -> [user.username] */}
        if (user?.username){
          setUsername(user.username)
        }
      } catch (error) {
        console.log("User not logged in")
      }
    }

    fetchUser()
  }, [])
  return (
    <main>
      <h1>
        Home
      </h1>
      <p> Hello, {username} </p>
    </main>
  );
}
