
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/SingerForm.css';
import { URL } from '../config';

const SingerForm = () => {
  const { singerId } = useParams();
  const navigate = useNavigate();
  const [singer, setSinger] = useState({
    singerName: '',
    singerPhone: '',
    pictureUrl: '',
    profile: '',
    password: ''
  });
  const [file, setFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    //במצב עידכון
    if (singerId) {
      axios.get(`${URL}/singers/${singerId}`)
        .then(async response => {
          const singerData = response.data;
          const passwordResponse = await axios.get(`${URL}/singers/${singerId}/password`);
          setSinger({
            ...singerData,
            password: passwordResponse.data.password.password || ''
          });
          setFile(singerData.pictureUrl ? { name: singerData.pictureUrl } : null);
        })
        .catch(error => {
          console.error('Error fetching singer:', error);
        });
    }
  }, [singerId, URL]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSinger({
      ...singer,
      [name]: value
    });
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  //שינוי קובץ תמונה
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
    } else {
      alert('נא להעלות קובץ תמונה בלבד.');
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  const isValidIsraeliPhone = (phone) => {
    // Regular expression for an Israeli phone number: starts with 05 and followed by 8 digits
    const regex = /^05\d{8}$/;
    return regex.test(phone);
  };
  
  const validateForm = () => {
    let formErrors = {};
    if (!singer.singerName) formErrors.singerName = 'שם הזמר נדרש';
    if (!singer.singerPhone) {
      formErrors.singerPhone = 'טלפון נדרש';
    } else if (!isValidIsraeliPhone(singer.singerPhone)) {
      formErrors.singerPhone = 'טלפון לא חוקי, פורמט ישראלי נדרש (לדוגמה: 0501234567)';
    }
    if (!file && !singer.pictureUrl) formErrors.picture = 'תמונה נדרשת';
    if (!singer.profile) formErrors.profile = 'פרופיל נדרש';
    if (!singer.password) formErrors.password = 'סיסמה נדרשת';
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('singerName', singer.singerName);
    formData.append('singerPhone', singer.singerPhone);
    formData.append('profile', singer.profile);
    formData.append('password', singer.password);
    if (file && file.name !== singer.pictureUrl) {
      formData.append('pictureUrl', file);
    } else if ( singer.pictureUrl) {
      formData.append('pictureUrl', singer.pictureUrl);
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    const saveSingerToSession = (singerData) => {
      console.log("singerData",singerData);
      sessionStorage.setItem('currentUser', JSON.stringify(singerData));
    };

    if (singerId) {
      axios.put(`${URL}/singers/${singerId}`, formData, config)
        .then((response) => {
          saveSingerToSession(response.data);
          navigate(`/singer/${singerId}`);
        })
        .catch(error => {
          console.error('Error updating singer:', error);
        });
    } else {
      axios.post(`${URL}/singers`, formData, config)
        .then((response) => {
          console.log("response",response);
          saveSingerToSession(response.data);
          navigate(`/singer/${response.data.singerId}`);
        })
        .catch(error => {
          console.error('Error adding singer:', error);
        });
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
  };

  return (
    <div className="singer-form-container">
      <h2>{singerId ? 'עריכת זמר' : 'הוספת זמר חדש'}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="singerName">שם הזמר:</label>
        <input
          type="text"
          id="singerName"
          name="singerName"
          value={singer.singerName || ''}
          placeholder="שם הזמר"
          onChange={handleInputChange}
          required
        />
        {errors.singerName && <p className="error">{errors.singerName}</p>}
        
        <label htmlFor="singerPhone">טלפון:</label>
        <input
          type="text"
          id="singerPhone"
          name="singerPhone"
          value={singer.singerPhone || ''}
          placeholder="טלפון"
          onChange={handleInputChange}
          required
        />
        {errors.singerPhone && <p className="error">{errors.singerPhone}</p>}
        
        <div className="file-upload-container">
          <label htmlFor="picture">בחר תמונה</label>
          <input
            type="file"
            id="picture"
            name="picture"
            ref={fileInputRef}
            onChange={handleFileChange}
            required={!singerId}
          />
          {file && <div className="file-name">{file.name}</div>}
          {errors.picture && <p className="error">{errors.picture}</p>}
        </div>
        
        <label htmlFor="profile">פרופיל:</label>
        <input
          type="text"
          id="profile"
          name="profile"
          value={singer.profile || ''}
          placeholder="פרופיל"
          onChange={handleInputChange}
          required
        />
        {errors.profile && <p className="error">{errors.profile}</p>}
        
        <label htmlFor="password">סיסמה:</label>
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={singer.password || ''}
            placeholder="סיסמה"
            onChange={handleInputChange}
            required
          />
          <button
            type="button"
            className="show-password-button"
            onClick={toggleShowPassword}
          >
            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        </div>
        {errors.password && <p className="error">{errors.password}</p>}
        
        <button type="submit">{singerId ? 'עדכן זמר' : 'הוסף זמר'}</button>
      </form>
      {singer.pictureUrl && (
        <img src={`${URL}${singer.pictureUrl}`} alt="תמונת הזמר" />
      )}
    </div>
  );
};

export default SingerForm;



  // useEffect(() => {
  //   const pathParts = window.location.pathname.split('/');
  //   const lastPathPart = pathParts[pathParts.length - 1];
  //   if (lastPathPart === 'editSinger') {
  //     const idFromUrl = pathParts[pathParts.length - 2];
  //     setSinger(prevSinger => ({
  //       ...prevSinger,
  //       id: idFromUrl
  //     }));
  //   }
  // }, []);