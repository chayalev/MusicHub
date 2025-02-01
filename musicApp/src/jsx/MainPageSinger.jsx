import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/MainPageSinger.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faEdit } from '@fortawesome/free-solid-svg-icons';
import { URL } from '../config';
import { SelectedSongContext } from '../context/selectedSongContext';
import { SelectedPlaylistContext } from '../context/selectedPlaylistContext';

const MainPageSinger = () => {
  const navigate = useNavigate();
  const { singerId } = useParams();
  const [topSong, setTopSong] = useState(null);
  const [mostLikedSong, setMostLikedSong] = useState(null);
  const [mostPlayedSong, setMostPlayedSong] = useState(null);
  const [singerDetails, setSingerDetails] = useState(null);
  const { setSelectedSong } = useContext(SelectedSongContext)
  const { setSelectedPlaylist } = useContext(SelectedPlaylistContext)
  useEffect(() => {
    fetchAllSongsData();
    fetchSingerDetails();
  }, [singerId]);

  const fetchAllSongsData = async () => {
    try {
      const response = await axios.get(`${URL}/songs/top/all/${singerId}`);
      const { topSong, mostLikedSong, mostPlayedSong } = response.data;
      setTopSong(topSong);
      setMostLikedSong(mostLikedSong);
      setMostPlayedSong(mostPlayedSong);
    } catch (error) {
      console.error('Error fetching songs data:', error);
    }
  };

  const fetchSingerDetails = async () => {
    try {
      const response = await axios.get(`${URL}/singers/${singerId}`);
      setSingerDetails(response.data);
    } catch (error) {
      console.error('Error fetching singer details:', error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    setSelectedSong(null);
    setSelectedPlaylist(null);
    navigate('/');
    alert('התנתקת בהצלחה');
  };

  const handleEditDetails = () => {
    navigate('edit', { replace: false });
  };

  const handleAddSong = () => {
    navigate('song', { replace: false });
  };

  const handleViewSongs = () => {
    navigate('songs', { replace: false });
  };

  return (
    <div className="singer_home">
      <div className="profile_container">
        <img
          src={singerDetails ? `${URL}${singerDetails.pictureUrl}` : `${URL}/default.png`}
          alt="פרופיל"
          className="profile_image"
        />
        <div className="profile_actions">
          <button className="icon_button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> יציאה
          </button>
          <button className="icon_button" onClick={handleEditDetails}>
            <FontAwesomeIcon icon={faEdit} /> עריכת פרטים
          </button>
        </div>
      </div>
      <h1>ברוך הבא,{singerDetails ? singerDetails.singerName : "זמר"}!</h1>
      <div className="button_group" style={{ display: 'flex', flexDirection: 'row' , margin:'5%' }}>
        <button className="btn" onClick={handleAddSong}>הוסף שיר</button>
        <button className="btn" onClick={handleViewSongs}>הצג את השירים שלי</button>
      </div>
      <h1>השירים הכי..:)</h1>
      <div className="tops_group" >
      <div style={{ display: 'column', flexDirection: 'row' ,margin:'5px'  }}>
        <h2>המושמע בשבוע האחרון</h2>
        {topSong ? (
          <div className="song_info">
            <img src={`${URL}${topSong.pictureUrl}`} alt={topSong.songName} className="song_image" />
            <div>
              <h3>{topSong.songName}</h3>
              <p>לייקים: {topSong.likes}</p>
            </div>
          </div>
        ) : (
          <p>אין שירים זמינים.</p>
        )}
        </div>
        <div style={{ display: 'column', flexDirection: 'row' ,margin:'5px'  }}>
        <h2> האהוב</h2>
        <div className="song_info">
          {mostLikedSong ? (
            <>
              <img src={`${URL}${mostLikedSong.pictureUrl}`} alt={mostLikedSong.songName} className="song_image" />
              <div>
                <h3>{mostLikedSong.songName}</h3>
                <p>לייקים: {mostLikedSong.likes}</p>
              </div>
            </>
          ) : (
            <p>אין שיר אהוב זמין.</p>
          )}
        </div>
        </div>
        <div style={{ display: 'column', flexDirection: 'row' ,marginRight:'10%',margin:'5px' }}>
        <h2>המושמע</h2>
        <div className="song_info">
          {mostPlayedSong ? (
            <>
              <img src={`${URL}${mostPlayedSong.pictureUrl}`} alt={mostPlayedSong.songName} className="song_image" />
              <div>
                <h3>{mostPlayedSong.songName}</h3>
                <p>השמעות: {mostPlayedSong.plays}</p>
              </div>
            </>
          ) : (
            <p>אין שיר מושמע זמין.</p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default MainPageSinger;
