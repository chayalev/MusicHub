
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FaHeart, FaRegHeart, FaEdit, FaCommentDots, FaTrashAlt } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/Songs.css';
import { SongContext } from '../context/songsContext.jsx';
import { URL } from '../config.js';
import { SelectedSongContext } from '../context/selectedSongContext.jsx';
import { TypeContext } from '../context/typeContext.jsx';

const Songs = () => {
  const { songs, setSongs, dateGetValue, removeSong } = useContext(SongContext);
  const { setSelectedSong } = useContext(SelectedSongContext);
  const { types, setTypes } = useContext(TypeContext);
  const [singers, setSingers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSinger, setSelectedSinger] = useState('');
  const [likedSongs, setLikedSongs] = useState(new Set());
  const location = useLocation();
  const navigate = useNavigate();
  const role = window.location.pathname.split('/')[1];
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  const currentUserId = currentUser.userId; // Retrieve the userId from session storage


  useEffect(() => {
    if (role === 'singer') {
      setSelectedSinger(currentUser.singerId);
    }
    if (!songs.length || !dateGetValue || dateGetValue < new Date().setHours(new Date().getHours() - 1)) {
      fetchSongs();
    }
    if (!types.length) fetchTypes();
    //אצל משתמש-טוען את הפליליסט האהוב
    if (currentUserId) {
      //קבלת פליליסט השירים שאהבתי
      axios.get(`${URL}/playlists/user/${currentUserId}`)
        .then(response => {
          const likedSongsPlaylist = response.data.find(pl => pl.playlistName === 'השירים שאהבתי');
          if (!likedSongsPlaylist) {
            console.error('Playlist "השירים שאהבתי" not found');
            return;
          }
          // Fetch songs in liked songs playlist and update likedSongs state
          axios.get(`${URL}/playlistSongs/${likedSongsPlaylist.playlistId}`)
            .then(response => {
              const likedSongsIds = response.data.map(song => song.songId);
              setLikedSongs(new Set(likedSongsIds));
            })
            .catch(error => {
              console.error('Error fetching liked songs:', error);
            });
        })
        .catch(error => {
          console.error('Error fetching playlists:', error);
        });
      fetchSingers();
    }
  }, [currentUserId]);

  const fetchSongs = () => {
    axios.get(`${URL}/songs`)
      .then(response => {
        setSongs(response.data);
      })
      .catch(error => {
        console.error('Error fetching songs:', error);
      });
  };

  const fetchTypes = () => {
    axios.get(`${URL}/types`)
      .then(response => {
        setTypes(response.data);
      })
      .catch(error => {
        console.error('Error fetching types:', error);
      });
  };

  const fetchSingers = () => {
    axios.get(`${URL}/singers`)
      .then(response => {
        setSingers(response.data);
      })
      .catch(error => {
        console.error('Error fetching singers:', error);
      });
  };

  const handleLikeSong = async (songId) => {
    const newLikedSongs = new Set(likedSongs);
    let state;
    if (newLikedSongs.has(songId)) {
      newLikedSongs.delete(songId);
      state = 'remove';
    } else {
      newLikedSongs.add(songId);
      state = 'add';
    }
    axios.get(`${URL}/playlists/user/${currentUserId}`)
      .then(response => {
        const playlist = response.data.find(pl => pl.playlistName === 'השירים שאהבתי');
        if (!playlist) {
          console.error('Playlist "השירים שאהבתי" not found');
          return;
        }
        const playlistId = playlist.playlistId;
        if (state === 'add') {
          console.log("add, ", songId, playlistId);
          axios.post(`${URL}/playlistSongs`, { playlistId, songId })
            .then(() => {
              console.log(response.data);
              setLikedSongs(newLikedSongs);
            })
            .catch(error => {
              console.error('Error adding song to playlist:', error.response ? error.response.data.message : error.message);
            });
        } else {
          axios.delete(`${URL}/playlistSongs/${playlistId}/${songId}`)
            .then(() => {
              setLikedSongs(newLikedSongs);
            })
            .catch(error => {
              console.error('Error removing song from playlist:', error.response ? error.response.data.message : error.message);
            });
        }
      })
      .catch(error => {
        console.error('Error fetching playlists:', error.response ? error.response.data.message : error.message);
      });
  };

  const handleSongClick = (song) => {
    setSelectedSong(song);
    if (role !== 'singer') {
      const playDate = new Date().toISOString();
      axios.post(`${URL}/songplays`, { userId: currentUserId, songId: song.songId, playDate })
        .then(response => {
          console.log('Song play recorded:', response.data);
        })
        .catch(error => {
          console.error('Error recording song play:', error);
        });
    }
  };

  const handleEditClick = (songId) => {
    navigate(`${songId}/edit`);
  };

  const handleDeleteClick = (songId) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את השיר הזה?")) {
      axios.delete(`${URL}/songs/${songId}`)
        .then(() => {
          setSelectedSong(null);
          removeSong(songId);
        })
        .catch(error => {
          console.error('Error deleting song:', error);
        });
    }
  };

  const filteredSongs = songs.filter(song => {
    const matchesSearchTerm = song.songName.includes(searchTerm);
    const matchesType = selectedType === '' || song.typeId === parseInt(selectedType);
    const matchesSinger = selectedSinger === '' || song.singerId === parseInt(selectedSinger);
    return matchesSearchTerm && matchesType && matchesSinger;
  });

  return (
    <div className="songs-container">
      <h1>שירים</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="חפש לפי שם שיר"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
        >
          <option value="">כל הסוגים</option>
          {types.map(type => (
            <option key={type.typeId} value={type.typeId}>{type.typeName}</option>
          ))}
        </select>
        {role !== 'singer' && (
          <select
            value={selectedSinger}
            onChange={e => setSelectedSinger(e.target.value)}
          >
            <option value="">כל הזמרים</option>
            {singers.map(singer => (
              <option key={singer.singerId} value={singer.singerId}>{singer.singerName}</option>
            ))}
          </select>
        )}
      </div>
      <div className="songs-list">
        {filteredSongs.length > 0 ? (
          filteredSongs.map((song) => {
            const pictureUrl = song.pictureUrl ? `${URL}${song.pictureUrl}` : 'default-image-url';
            return (
              <div
                key={song.songId}
                className="song-card"
                onClick={() => handleSongClick(song)}
              >
                {role !== 'singer' && (
                  <div className="like-icon" onClick={(e) => { e.stopPropagation(); handleLikeSong(song.songId); }}>
                    {likedSongs.has(song.songId) ? <FaHeart color="red" /> : <FaRegHeart />}
                  </div>
                )}
                <img src={pictureUrl} alt={song.songName} />
                <h2>{song.songName}</h2>
                {role === 'singer' && (
                  <div className="song-actions">
                    <button onClick={(e) => { e.stopPropagation(); handleEditClick(song.songId); }}>
                      <FaEdit />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(song.songId); }}>
                      <FaTrashAlt />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleSongClick(song); }}>
                      <FaCommentDots />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>אין שירים תואמים לחיפוש שלך 🙃</p>
        )}
      </div>
    </div>
  );
};

export default Songs;
