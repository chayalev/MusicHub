
// MainPage.jsx
import React, { useState,useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import LoginComponent from '../jsx/LoginComponent.jsx'; // ניתן לשנות את הנתיב לקומפוננטה

import '../css/MainPage.css';
import { SelectedSongContext } from '../context/selectedSongContext.jsx';
import { SelectedPlaylistContext } from '../context/selectedPlaylistContext.jsx';

const MainPage =() =>{
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginType, setLoginType] = useState('');
  const navigate = useNavigate();
  const { setSelectedSong } = useContext(SelectedSongContext)
  const { setSelectedPlaylist } = useContext(SelectedPlaylistContext)
  useEffect(() => {
    setSelectedSong(null);
    setSelectedPlaylist(null);
    sessionStorage.setItem('currentUser', null);
}, []);

  const handleLogin = (type) => {
    setLoginType(type);
    setShowLoginPopup(true);
  };

  return (
    <div className="mainPage-container">
      <div className="welcome-screen">
        <h1>ברוכים הבאים</h1>
        <div className="buttons-container">
          <button className="button" onClick={() => handleLogin('singer')}>עמוד זמרים</button>
          <button className="button" onClick={() => handleLogin('user')}>עמוד משתמשים</button>
        </div>
      </div>

      {showLoginPopup && (
        <LoginComponent
          loginType={loginType}
          setShowLoginPopup={setShowLoginPopup}
          navigate={navigate}
        />
      )}
    </div>
  );
}

export default MainPage;
