import React from 'react'
import { Show, SignInButton, UserButton } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import LoginBtn from './LoginBtn'

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="main-header">
      <div className="header-inner">
        {/* Left Side: Logo */}
        <div className="header-logo" onClick={() => navigate('/')}>
          Project<span className="text-highlight">Hub</span>
        </div>


        <button className="create-nav-btn" onClick={() => navigate('/about')}>
          About Me
        </button>


        {/* Right Side: Navigation & Auth */}
        <nav className="header-nav">
          {/*<button className="nav-link" onClick={() => navigate('/')}>Explore</button>*/}

          <Show when="signed-out">
            <SignInButton mode="modal">
              {/* Keeping your exact logic wrapping the custom button */}
              <div className="auth-wrapper">
                <LoginBtn />
              </div>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <div className="user-section">

              <button className="create-nav-btn" onClick={() => navigate('/usershowcase')}>
                My Projects
              </button>

              <button className="create-nav-btn" onClick={() => navigate('/create')}>
                Upload Project
              </button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </Show>
        </nav>
      </div>
    </header>
  )
}

export default Header