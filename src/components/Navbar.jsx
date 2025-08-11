import { NavLink, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const location = useLocation()

  const isGatewayActive = (isActive) => {
    return isActive || location.pathname === '/demo-viz' || location.pathname === '/demo-viz/'
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div class="navbar-logo">
            <NavLink
              to="/demo-viz/gateway">
              <img src="https://cdn.prod.website-files.com/67f3937090e003651f8bb994/67f3a72e058c2eb8b994bd02_Martian%20Primary%20Logo.svg" loading="eager" width="150" alt="logo" />
            </NavLink>
          </div>
        </div>

        <ul className="navbar-nav">
          <li className="nav-item">
            <NavLink
              to="/demo-viz/gateway"
              className={({ isActive }) =>
                `nav-link ${isGatewayActive(isActive) ? 'nav-link-active' : ''}`
              }
            >
              Gateway
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/demo-viz/router"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              Router
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar 