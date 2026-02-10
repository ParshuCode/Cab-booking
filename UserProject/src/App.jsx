window.global = window;
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation/Navigation';
import Home from './components/Home/Home';
import Login from './components/UserAuth/Login';
import UserProfile from './components/UserAuth/UserProfile';
import Register from './components/UserAuth/Register';
import CabBooking from './components/CabBooking/CabBooking';
import CabRegister from './components/CabDriver/CabRegister';
import CabLogin from './components/CabDriver/CabLogin';
import CabDriverDashboard from './components/CabDriver/CabDriverDashboard';
import MyBookings from './components/MyBookings/MyBookings';
import Payment from './components/Payment/Payment';
import MapPage from './pages/MapPage';
import './App.css';
import UserRidePage from './components/CabBooking/UserRidePage';

function App() {
  const [user, setUser] = useState(null);
  const [cab, setCab] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  

  useEffect(() => {
    // Check if user is logged in on app load
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
    setSelectedBooking(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedBooking(null);
  };

  const handlePaymentComplete = (payment) => {
    // Handle payment completion
    console.log('Payment completed:', payment);
    setCurrentPage('bookings');
  };

  const handleCabLogout = () => {
  setCab(null);
  setCurrentPage('cab-login'); // Or go to home, as you prefer
};

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home user={user} onPageChange={handlePageChange} />;
      case 'login':
        return <Login onLogin={handleLogin} onSwitchToRegister={() => setCurrentPage('register')} />;
      case 'register':
        return <Register onRegister={handleRegister} onSwitchToLogin={() => setCurrentPage('login')} />;
      // case 'book':
      //   return <CabBooking user={user} />;
      case 'book':
        return <MapPage
            user={user}
            setPickupLocation={setPickupLocation}
            setDropLocation={setDropLocation}
            setCurrentPage={setCurrentPage} // so MapPage can move you to user-ride
          />;
      case 'profile':
        return <UserProfile user={user} />;
        
      case 'user-ride':
        return <UserRidePage
            user={user}
            pickupLocation={pickupLocation}
            dropLocation={dropLocation}
          />;
      case 'bookings':
        return <MyBookings user={user} />;
      case 'payment':
        return <Payment booking={selectedBooking} onPaymentComplete={handlePaymentComplete} />;
      case 'cab-register':
        return <CabRegister onRegister={(cabData) => { setCab(cabData); setCurrentPage('cab-dashboard'); }} />;
      case 'cab-login':
        return <CabLogin onLogin={(cabData) => { setCab(cabData); setCurrentPage('cab-dashboard'); }} />;
      case 'cab-dashboard':
        return <CabDriverDashboard cab={cab} onLogout={handleCabLogout} />;
      default:
        return <Home user={user} onPageChange={handlePageChange} />;
    }
  };

  return (
    <div className="App">
      <Navigation 
        user={user} 
        onLogout={handleLogout} 
        onCabLogout={handleCabLogout}
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
      />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;


// import React, { useState, useEffect } from 'react';
// import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
// import Navigation from './components/Navigation/Navigation';
// import Home from './components/Home/Home';
// import Login from './components/UserAuth/Login';
// import UserProfile from './components/UserAuth/UserProfile';
// import Register from './components/UserAuth/Register';
// import MyBookings from './components/MyBookings/MyBookings';
// import Payment from './components/Payment/Payment';
// import MapPage from './pages/MapPage';
// import UserRidePage from './components/CabBooking/UserRidePage';
// import CabRegister from './components/CabDriver/CabRegister';
// import CabLogin from './components/CabDriver/CabLogin';
// import CabDriverDashboard from './components/CabDriver/CabDriverDashboard';
// import './App.css';

// function App() {
//   const [user, setUser] = useState(null);
//   const [cab, setCab] = useState(null);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [pickupLocation, setPickupLocation] = useState(null);
//   const [dropLocation, setDropLocation] = useState(null);

//   useEffect(() => {
//     const savedUser = localStorage.getItem('user');
//     if (savedUser) {
//       try {
//         setUser(JSON.parse(savedUser));
//       } catch {
//         localStorage.removeItem('user');
//       }
//     }
//   }, []);

//   const handleLogin = (userData) => {
//     setUser(userData);
//     localStorage.setItem('user', JSON.stringify(userData));
//   };

//   const handleRegister = (userData) => {
//     setUser(userData);
//     localStorage.setItem('user', JSON.stringify(userData));
//   };

//   const handleLogout = () => {
//     setUser(null);
//     localStorage.removeItem('user');
//     setSelectedBooking(null);
//   };

//   const handleCabLogout = () => {
//     setCab(null);
//   };

//   const handlePaymentComplete = (payment) => {
//     console.log('Payment completed:', payment);
//     // Consider redirecting after payment if needed
//   };

//   return (
//     <BrowserRouter>
//       <Navigation
//         user={user}
//         cab={cab}
//         onLogout={handleLogout}
//         onCabLogout={handleCabLogout}
//       />
//       <main className="main-content">
//         <Routes>
//           <Route path="/" element={<Home user={user} />} />
//           <Route path="/login" element={<Login onLogin={handleLogin} />} />
//           <Route path="/register" element={<Register onRegister={handleRegister} />} />
//           <Route path="/profile" element={<UserProfile user={user} />} />
//           <Route
//             path="/book"
//             element={
//               <MapPage
//                 user={user}
//                 setPickupLocation={setPickupLocation}
//                 setDropLocation={setDropLocation}
//               />
//             }
//           />
//           <Route
//             path="/user-ride"
//             element={
//               <UserRidePage user={user} pickupLocation={pickupLocation} dropLocation={dropLocation} />
//             }
//           />
//           <Route path="/bookings" element={<MyBookings user={user} />} />
//           <Route
//             path="/payment"
//             element={
//               <Payment
//                 booking={selectedBooking}
//                 onPaymentComplete={handlePaymentComplete}
//               />
//             }
//           />
//           <Route
//             path="/cab-register"
//             element={
//               <CabRegister
//                 onRegister={(cabData) => setCab(cabData)}
//               />
//             }
//           />
//           <Route
//             path="/cab-login"
//             element={
//               <CabLogin
//                 onLogin={(cabData) => setCab(cabData)}
//               />
//             }
//           />
//           <Route
//             path="/cab-dashboard"
//             element={
//               <CabDriverDashboard cab={cab} onLogout={handleCabLogout} />
//             }
//           />
//           {/* Optionally: */}
//           {/* <Route path="*" element={<NotFound />} /> */}
//         </Routes>
//       </main>
//     </BrowserRouter>
//   );
// }

// export default App;