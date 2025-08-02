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
          <h1 className="navbar-title">Martian</h1>
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