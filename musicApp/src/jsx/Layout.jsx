
import React, {  useContext, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import logo from '../img/logo.jpg';
import '../css/Layout.css'; // Ensure the CSS is applied

///איקון בראש כרטיסיה
import { URL } from '../config';
import { SelectedPlaylistContext } from '../context/selectedPlaylistContext';
import { SelectedSongContext } from '../context/selectedSongContext';


const Layout = () => {
  const { setSelectedSong } = useContext(SelectedSongContext)
  const { setSelectedPlaylist } = useContext(SelectedPlaylistContext)

  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('currentUser')));

  const userId = user ? user.userId : 'guest'; // Use 'guest' or any placeholder to avoid errors if user is not logged in

  const handleProfileClick = () => {
    Swal.fire({
      title: 'פרטי משתמש',
      html: `
        <div class="user-details">
          <p><strong>שם משתמש:</strong> ${user.userName}</p>
          <p><strong>אימייל:</strong> ${user.email}</p>
          <button id="edit-profile">ערוך פרטי משתמש</button>
          <button id="logout">התנתקות</button>
        </div>
      `,
      showCancelButton: false,
      showConfirmButton: false,
      didOpen: () => {
        const editButton = Swal.getPopup().querySelector('#edit-profile');
        const logoutButton = Swal.getPopup().querySelector('#logout');

        editButton.addEventListener('click', handleEditProfile);
        logoutButton.addEventListener('click', handleLogout);
      },
    });
  };

  const handleEditProfile = () => {
    Swal.fire({
      title: 'ערוך פרטי משתמש',
      html: `
        <input type="text" id="edit-username" class="swal2-input" placeholder="שם משתמש" value="${user.userName}">
        <input type="email" id="edit-email" class="swal2-input" placeholder="אימייל" value="${user.email}">
      `,
      showCancelButton: true,
      confirmButtonText: 'שמור',
      cancelButtonText: 'ביטול',
      preConfirm: () => {
        const userName = Swal.getPopup().querySelector('#edit-username').value;
        const email = Swal.getPopup().querySelector('#edit-email').value;
        if (!userName || !email) {
          Swal.showValidationMessage('יש למלא את כל השדות');
        }
        return { userName, email };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { userName, email } = result.value;
        axios.put(`${URL}/users/${userId}`, { userName, email }) // Update the URL as per your backend endpoint
          .then(() => {
            sessionStorage.setItem('currentUser', JSON.stringify({ ...user, userName, email }));
            setUser({ ...user, userName, email });
            Swal.fire('הפרטים נשמרו בהצלחה', '', 'success');
          })
          .catch((error) => {
            console.error('Error updating profile:', error);
            Swal.fire('שגיאה בעדכון הפרטים', 'אנא נסה שוב מאוחר יותר', 'error');
          });
      }
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    setSelectedPlaylist(null);
    setSelectedSong(null);
    navigate('/');
    Swal.fire('התנתקת בהצלחה', '', 'success');
  };

  return (
    <div className="layout-container">
      <nav className="navbar">
        <ul className="navbar-list">
          <li className="navbar-item logo-item">
              <img src={logo} alt="Site Logo" className="site-logo" />
          </li>
          <li className="navbar-item">
            <NavLink to={`/user/${userId}/homePage`} className="navbar-link">דף הבית</NavLink>
          </li>
          <li className="navbar-item">
            <NavLink to={`/user/${userId}/songs`} className="navbar-link">שירים</NavLink>
          </li>
          <li className="navbar-item">
            <NavLink to={`/user/${userId}/singers`} className="navbar-link">זמרים</NavLink>
          </li>
         
          <li className="navbar-item">
            <NavLink to={`/user/${userId}/playlists`} className="navbar-link">פלייליסטים</NavLink>
          </li>
        
          <li className="navbar-item profile-icon">
            <div onClick={handleProfileClick}>
              <img src="https://www.w3schools.com/w3images/avatar2.png" alt="Profile" className="profile-image" />
              <p>{user.userName}</p>
            </div>
          </li>
        </ul>
      </nav>
      <div className="main-layout-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;

