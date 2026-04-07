import Navbar from './Navbar'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}