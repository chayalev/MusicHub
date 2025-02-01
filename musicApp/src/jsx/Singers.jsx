import React, { useState, useEffect } from 'react';
import { useNavigate ,useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/Singers.css';
import { URL } from '../config';

const Singers = () => {
  const [singers, setSingers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const allSingers = () => {
    axios.get(`${URL}/singers`)
      .then(response => {
        setSingers(response.data);
      })
      .catch(error => {
        console.error('Error fetching singers:', error);
      });
  };

  useEffect(() => {
    allSingers();
  }, []);
  
  return (
    <div className="singers-container">
      <h1>זמרים</h1>
      <div className="singers-list">
        {singers.map((singer) => {
          const pictureUrl = singer.pictureUrl ? `${URL}${singer.pictureUrl}` : 'default-image-url';
          return (
            <div key={singer.singerId} className="singer-card" >
              <img src={pictureUrl} alt={singer.singerName} />
              <h2>{singer.singerName}</h2>
              <div className="popup-description">
              <p>{singer.profile}</p>
                <p><strong>טלפון:</strong> {singer.singerPhone}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Singers;
