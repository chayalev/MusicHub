
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import '../css/LoginComponent.css';
import { URL } from '../config';

const LoginComponent = ({ loginType, setShowLoginPopup, navigate }) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (loginType === 'user' && (!userName || !email || !isValidEmail(email))) {
      Swal.fire('התחברות נכשלה', 'אנא הזן שם משתמש ודוא"ל תקינים.', 'error');
      return;
    } else if (loginType === 'singer' && (!userName || !password)) {
      Swal.fire('התחברות נכשלה', 'אנא הזן שם משתמש וסיסמה תקינים.', 'error');
      return;
    }

    try {
      let response;
      let loginUrl;

      if (loginType === 'user') {
        response = await axios.post(`${URL}/users/userLogin`, { userName, email });
        loginUrl = `/user/${response.data.userId}/homePage`;
      } else if (loginType === 'singer') {
        response = await axios.post(`${URL}/singers/singerLogin`, { userName, password });
        loginUrl = `/singer/${response.data.singerId}`;
      }

      const userDetails = response.data;

      sessionStorage.setItem('currentUser', JSON.stringify(userDetails));

      setShowLoginPopup(false);
      Swal.fire('התחברות הצליחה!', 'ברוך שובך!', 'success').then(() => {
        navigate(loginUrl);
      });

    } catch (error) {
      if (error.response && error.response.status === 404) {
        Swal.fire('התחברות נכשלה', 'נקודת הקצה לא נמצאה', 'error');
      } 
      else if (error.response && error.response.status === 401) {
        Swal.fire({
          title: 'התחברות נכשלה',
          text: 'פרטי התחברות שגויים',
          icon: 'error',
          showCancelButton: true,
          confirmButtonText: 'הרשם',
          cancelButtonText: 'נסה שוב'
        }).then((result) => {
          if (result.isConfirmed) {
            if (loginType === 'user') {
              setShowLoginPopup(false);
              showUserRegistrationPopup();
            } else if (loginType === 'singer') {
              setShowLoginPopup(false);
              navigate('/newSinger');
            }
          }
        });
      } else {
        console.error('Error logging in:', error);
        Swal.fire('התחברות נכשלה', 'אירעה שגיאה. נסה שוב מאוחר יותר.', 'error');
      }
    }
  };

  const showUserRegistrationPopup = () => {
    Swal.fire({
      title: 'הרשמה כמשתמש',
      html: `
        <input type="text" id="registerUsername" class="swal2-input" placeholder="שם משתמש">
        <input type="email" id="registerEmail" class="swal2-input" placeholder="דוא"ל">
      `,
      showCancelButton: true,
      confirmButtonText: 'הרשם',
      preConfirm: async () => {
        const userName = Swal.getPopup().querySelector('#registerUsername').value;
        const email = Swal.getPopup().querySelector('#registerEmail').value;
        if (!userName || !email || !isValidEmail(email)) {
          Swal.showValidationMessage('אנא הזן שם משתמש ודוא"ל תקינים');
        }
        return { userName, email };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(`${URL}/users`, result.value);
          const userDetails = response.data;
          sessionStorage.setItem('currentUser', JSON.stringify(userDetails));
          Swal.fire('הרשמה הצליחה!', 'כעת באפשרותך להתחבר.', 'success').then(() => {
            const loginUrl = `/user/${response.data.userId}/homePage`;
            navigate(loginUrl);
          });
        } catch (error) {
          console.error('Error registering:', error);
          Swal.fire('הרשמה נכשלה', 'אירעה שגיאה. נסה שוב מאוחר יותר.', 'error');
        }
      }
    });
  };

  return (
    <div className="popup-background">
      <div className="popup-content">
        <span className="close-btn" onClick={() => setShowLoginPopup(false)}>&times;</span>
        <h2>התחברות</h2>
        <form onSubmit={handleLoginSubmit}>
          <div className="input-group">
            <label htmlFor="loginUsername">שם</label>
            <input
              type="text"
              id="loginUsername"
              className="input-field"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>
          {loginType === 'user' && (
            <div className="input-group">
              <label htmlFor="loginEmail">מייל</label>
              <input
                type="email"
                id="loginEmail"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          {loginType === 'singer' && (
            <div className="input-group">
              <label htmlFor="loginPassword">סיסמא</label>
              <input
                type="password"
                id="loginPassword"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}
          <button type="submit" className="btn">התחבר</button>
        </form>
        <button
          className="btn register-btn"
          onClick={() => {
            if (loginType === 'user') {
              setShowLoginPopup(false);
              showUserRegistrationPopup();
            } else if (loginType === 'singer') {
              setShowLoginPopup(false);
              navigate('/newSinger');
            }
          }}
        >
          הירשם
        </button>
      </div>
    </div>
  );
};

export default LoginComponent;
