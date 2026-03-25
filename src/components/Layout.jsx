import { Outlet } from 'react-router-dom'
import AdBanner from './AdBanner'
import Footer from './Footer'
import Header from './Header'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#12121f]">
      <Header />
      <main className="flex-1">
        <Outlet />
        <AdBanner slot="footer-banner" />
      </main>
      <Footer />
    </div>
  )
}