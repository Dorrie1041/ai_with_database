import Link from "next/link"
import "./globals.css"

export default function RootLayout({
  children,
 } : {
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body>
      {/* Navigation menu */}
      <nav className="layout-nav" > 
        <Link href="/" className="layout-nav-link">Home</Link>
        <Link href="/login" className="layout-nav-link"> Login </Link>
        <Link href="/register" className="layout-nav-link"> Register </Link> 
        <Link href="/dashboard" className="layout-nav-link"> Dashboard </Link> 
        <Link href="/upload" className="layout-nav-link"> Upload </Link> 
        <Link href="/ai_agent" className="layout-nav-link"> AI Agent </Link> 
      </nav>

      {/* Page Part */}  
      <main>
        {children}
      </main>

    </body>
    </html>
  )
}
