
import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import AddPlaylist from './AddPlaylist.jsx'; // Adjust the path as necessary
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../css/MyPlaylist.css';
import { URL } from '../config.js';
import { SelectedSongContext } from '../context/selectedSongContext.jsx';
import { SelectedPlaylistContext } from '../context/selectedPlaylistContext.jsx';
import { SongProvider } from '../context/songsContext.jsx';
const MySwal = withReactContent(Swal);

const MyPlaylist = () => {
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [playlistToDisplay, setPlaylistToDisplay] = useState(null); // State to hold the selected playlist for display
  const [isPlaying, setIsPlaying] = useState(false);
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  const { setSelectedSong } = useContext(SelectedSongContext)
  const {selectedPlaylist, setSelectedPlaylist } = useContext(SelectedPlaylistContext)

  useEffect(() => {
    fetchPlaylists();//שלי
    fetchPublicPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      if (currentUser && currentUser.userId) {
        const response = await axios.get(`${URL}/playlists/user/${currentUser.userId}`);
        setPlaylists(response.data);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const fetchPublicPlaylists = async () => {
    try {
      const response = await axios.get(`${URL}/playlists?userID=${currentUser.userId}`);
      setPublicPlaylists(response.data);
    } catch (error) {
      console.error('Error fetching public playlists:', error);
    }
  };

  const handleAddPlaylistClick = () => {
    setShowAddPlaylist(true);
    MySwal.fire({
      title: 'הוסף פלייליסט חדש',
      html: <SongProvider><AddPlaylist URL={URL} onClose={handlePlaylistAdded} /></SongProvider>,
      showConfirmButton: false,
      width: '60%',
      customClass: {
        popup: 'add-playlist-popup',
      },
    });
  };

  const handleEditPlaylistClick = (playlist) => {
    setSelectedPlaylist(null);
     MySwal.fire({
       title: 'עריכת פלייליסט',
       html:  <SongProvider><AddPlaylist URL={URL} onClose={handlePlaylistEdited} playlistToEdit={playlist} /></SongProvider>,
       showConfirmButton: false,
       width: '60%',
       customClass: {
         popup: 'add-playlist-popup',
       },
     });
   };
 

  const handlePlaylistAdded = () => {
    setSelectedPlaylist(null);
    setShowAddPlaylist(false);
    fetchPlaylists();
  };
  const handlePlaylistEdited = () => {
    setSelectedPlaylist(null);
    fetchPlaylists();
  };


  
//הפעלת פלייליסט
  const handleDisplayPlaylistClick = async (playlist) => {
    if (isPlaying && playlistToDisplay && playlist.playlistId === playlistToDisplay.playlistId) {
      // Stop playing if the same playlist is clicked again
      setIsPlaying(false);
      setPlaylistToDisplay(null);
      setSelectedPlaylist(null);
    } 
    else {
      try {
        const response = await axios.get(`${URL}/playlistSongs/${playlist.playlistId}`);
        const songs = response.data;
        setPlaylistToDisplay({ ...playlist, songs });
        setSelectedSong(null);
        setSelectedPlaylist({...playlist, songs });
        setIsPlaying(true);
      } catch (error) {
        console.error('Error fetching playlist songs:', error);
      }
    }
  };

  const handleDeletePlaylistClick = async (playlistId) => {
    try {
      await axios.delete(`${URL}/playlists/${playlistId}`);
      setPlaylists((prevPlaylists) => prevPlaylists.filter((playlist) => playlist.playlistId !== playlistId));
      setSelectedPlaylist(null);
      alert('הפלייליסט נמחק בהצלחה!');
    } catch (error) {
      console.error('Error deleting playlist:', error);
      alert('שגיאה במחיקת הפלייליסט, נסה שוב מאוחר יותר');
    }
  };

  return (
    <div className="my-playlist-container">
      <h1>הפלייליסטים שלי</h1>
      <div className="playlist-list">
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <div
              key={playlist.playlistId}
              className={`playlist-item ${playlist.isPublic ? 'public' : 'private'} ${playlist.playlistName.trim() === 'השירים שאהבתי' ? 'favorite-playlist' : ''}`}
            >
              <h3>{playlist.playlistName}</h3>
              <p>{playlist.isPublic ? 'ציבורי' : 'פרטי'}</p>
              <button onClick={() => handleDisplayPlaylistClick(playlist)} className="tool-btn">
                    <FontAwesomeIcon icon={isPlaying && playlistToDisplay && playlist.playlistId === playlistToDisplay.playlistId ? faStop : faPlay} />
                  </button>
              {playlist.playlistName.trim() !== 'השירים שאהבתי' && (
                <>
                 <button onClick={() => handleEditPlaylistClick(playlist)} className="tool-btn">
                <FontAwesomeIcon icon={faEdit} />
              </button>
                 
                  <button onClick={() => handleDeletePlaylistClick(playlist.playlistId)} className="tool-btn">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </>
              )}
            </div>
          ))
        ) : (
          <p>אין פלייליסטים להצגה</p>
        )}
      </div>
      <div className="public-playlist-container">
        <h2>הפלייליסטים הציבוריים</h2>
        <div className="playlist-list">
          {publicPlaylists.length > 0 ? (
            publicPlaylists.map((playlist) => (
              <div
                key={playlist.playlistId}
                className="playlist-item public"
              >
                <h3>{playlist.playlistName}</h3>
                <p>יוצר : {playlist.creatorName}</p>
                <p>likes : {playlist.likes}</p>
                <button onClick={() => handleDisplayPlaylistClick(playlist)} className="display-btn">
                  <FontAwesomeIcon icon={isPlaying && playlistToDisplay && playlist.playlistId === playlistToDisplay.playlistId ? faStop : faPlay} />
                </button>
              </div>
            ))
          ) : (
            <p>אין פלייליסטים ציבוריים להצגה</p>
          )}
        </div>
      </div>
      <button onClick={handleAddPlaylistClick} className="btn">
        הוסף פלייליסט חדש
      </button>

    </div>
  );
}

export default MyPlaylist;
