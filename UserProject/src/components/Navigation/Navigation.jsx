
import React, { useState } from 'react';
import './Navigation.css';

const Navigation = ({
  userRole,             // 'passenger' or 'driver'
  user,
  cab,
  onLogout,
  onCabLogout,
  currentPage,
  onPageChange,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    onLogout();
  };
  const handleCabLogout = () => {
    if (onCabLogout) onCabLogout();
  };
  const handlePageChange = (page) => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Only show navigation if role is selected
  if (!userRole) return null;

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>🚗 CabBook</h1>
        </div>
        <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="nav-links">

            {/* === PASSENGER NAVIGATION === */}
            {userRole === 'passenger' && (
              <>
                <button
                  className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
                  onClick={() => handlePageChange('home')}
                >
                  Home
                </button>
                <button
                  className={`nav-link ${currentPage === 'book' ? 'active' : ''}`}
                  onClick={() => handlePageChange(user ? 'book' : 'login')}
                >
                  Book Cab
                </button>
                {user && (
                  <button
                    className={`nav-link ${currentPage === 'bookings' ? 'active' : ''}`}
                    onClick={() => handlePageChange('bookings')}
                  >
                    My Bookings
                  </button>
                )}
                {user && (
                  <button
                    className={`nav-link ${currentPage === 'profile' ? 'active' : ''}`}
                    onClick={() => handlePageChange('profile')}
                  >
                    Profile
                  </button>
                )}
              </>
            )}

            {/* === DRIVER NAVIGATION === */}
            {userRole === 'driver' && (
              <>
                <button
                  className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
                  onClick={() => handlePageChange('home')}
                >
                  Home
                </button>
                {!cab && (
                  <>
                    <button
                      className={`nav-link ${currentPage === 'cab-login' ? 'active' : ''}`}
                      onClick={() => handlePageChange('cab-login')}
                    >
                      Driver Login
                    </button>
                    <button
                      className={`nav-link ${currentPage === 'cab-register' ? 'active' : ''}`}
                      onClick={() => handlePageChange('cab-register')}
                    >
                      Register as Driver
                    </button>
                  </>
                )}
                {cab && (
                  <button
                    className={`nav-link ${currentPage === 'cab-dashboard' ? 'active' : ''}`}
                    onClick={() => handlePageChange('cab-dashboard')}
                  >
                    Driver Dashboard
                  </button>
                )}
              </>
            )}

          </div>
          <div className="nav-auth">
            {/* === PASSENGER AUTH === */}
            {userRole === 'passenger' && (
              user ? (
                <div className="user-info">
                  <span className="user-name">
                    Welcome, {user.firstName} {user.lastName}
                  </span>
                  <button className="btn-logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <button
                    className={`nav-link ${currentPage === 'login' ? 'active' : ''}`}
                    onClick={() => handlePageChange('login')}
                  >
                    Sign In
                  </button>
                  <button
                    className={`nav-link ${currentPage === 'register' ? 'active' : ''}`}
                    onClick={() => handlePageChange('register')}
                  >
                    Sign Up
                  </button>
                </div>
              )
            )}

            {/* === DRIVER AUTH === */}
            {userRole === 'driver' && (
              cab ? (
                <div className="user-info">
                  <span className="user-name">
                    Driver: {cab.driverName} ({cab.cabNumber})
                  </span>
                  <button className="btn-logout" onClick={handleCabLogout}>
                    Logout
                  </button>
                </div>
              ) : null
            )}
          </div>
        </div>
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

// import React, { useState } from 'react';
// import { Link, useLocation } from "react-router-dom";
// import './Navigation.css';

// const Navigation = ({
//   user,
//   cab,
//   onLogout,
//   onCabLogout,
// }) => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const location = useLocation();

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };

//   return (
//     <nav className="navigation">
//       <div className="nav-container">
//         <div className="nav-brand">
//           <h1>🚗 CabBook</h1>
//         </div>
//         <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
//           <div className="nav-links">
//             <Link to="/" className={`nav-link${location.pathname === '/' ? ' active' : ''}`}>Home</Link>
//             <Link to="/book" className={`nav-link${location.pathname === '/book' ? ' active' : ''}`}>Book Cab</Link>
//             {user && (
//               <Link to="/bookings" className={`nav-link${location.pathname === '/bookings' ? ' active' : ''}`}>My Bookings</Link>
//             )}
//             {user && (
//               <Link to="/profile" className={`nav-link${location.pathname === '/profile' ? ' active' : ''}`}>Profile</Link>
//             )}
//             {!cab && (
//               <>
//                 <Link to="/cab-login" className={`nav-link${location.pathname === '/cab-login' ? ' active' : ''}`}>Driver Login</Link>
//                 <Link to="/cab-register" className={`nav-link${location.pathname === '/cab-register' ? ' active' : ''}`}>Register as Driver</Link>
//               </>
//             )}
//             {cab && (
//               <Link to="/cab-dashboard" className={`nav-link${location.pathname === '/cab-dashboard' ? ' active' : ''}`}>Driver Dashboard</Link>
//             )}
//           </div>
//           <div className="nav-auth">
//             {user ? (
//               <div className="user-info">
//                 <span className="user-name">
//                   Welcome, {user.firstName} {user.lastName}
//                 </span>
//                 <button className="btn-logout" onClick={onLogout}>Logout</button>
//               </div>
//             ) : cab ? (
//               <div className="user-info">
//                 <span className="user-name">
//                   Driver: {cab.driverName} ({cab.cabNumber})
//                 </span>
//                 <button className="btn-logout" onClick={onCabLogout}>Logout</button>
//               </div>
//             ) : (
//               <div className="auth-buttons">
//                 <Link to="/login" className={`nav-link${location.pathname === '/login' ? ' active' : ''}`}>Login</Link>
//                 <Link to="/register" className={`nav-link${location.pathname === '/register' ? ' active' : ''}`}>Register</Link>
//               </div>
//             )}
//           </div>
//         </div>
//         <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
//           <span></span>
//           <span></span>
//           <span></span>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navigation;