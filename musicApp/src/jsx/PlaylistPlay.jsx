

import React, { useEffect, useState, useRef, useContext } from 'react';
import axios from 'axios';
import '../css/PlaylistPlay.css';
import { URL } from '../config';
import { FaThumbsUp, FaTimes } from 'react-icons/fa';
import { SelectedPlaylistContext } from '../context/selectedPlaylistContext';

const PlaylistPlay = () => {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const { selectedPlaylist ,setSelectedPlaylist} = useContext(SelectedPlaylistContext)
  const [likes, setLikes] = useState(selectedPlaylist ? selectedPlaylist.likes : 0);
  const [isLiked, setIsLiked] = useState(false);
  const audioRef = useRef(null);
  

  useEffect(() => {
    if (selectedPlaylist) 
    {
      fetchSongs();

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };
    }
  
  }, [selectedPlaylist]);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      // Check if the current src is different from the intended src
      if (audioRef.current.src !== `${URL}${currentSong.songLink}`) {
        audioRef.current.pause();
        audioRef.current.src = `${URL}${currentSong.songLink}`;
        audioRef.current.play();
      } else {
        audioRef.current.play(); // Continue playing if src hasn't changed
      }
    }
  }, [currentSong]);
  

  //השירים של הפליליסט שנבחר
  const fetchSongs = async () => {
    try {
      const songDetails = await Promise.all(
        selectedPlaylist?.songs?.map(async (song, index) => {
          const response = await axios.get(`${URL}/songs/${song.songId}`);
          return response.data;
        })
      );
      setSongs(songDetails);
      if (songDetails.length > 0) {
        setCurrentSong(songDetails[0]);
        setCurrentSongIndex(0);
      }
      setLikes(selectedPlaylist.likes);
      setIsLiked(false); // reset like state when song changes
    } 
    catch (error) {
      console.error('Error fetching song details:', error);
    }
  };

  const handleSongClick = (song, index) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentSong(song);
    setCurrentSongIndex(index);
  };


  const handleAudioEnded = () => {
    const nextSongIndex = currentSongIndex + 1;
    if (nextSongIndex < songs.length) {
      setCurrentSong(songs[nextSongIndex]);
      setCurrentSongIndex(nextSongIndex);
    }
  };

  const handleLike = () => {
    if (!isLiked && selectedPlaylist) {
      axios.put(`${URL}/playlists/${selectedPlaylist.playlistId}/addLike`)
        .then(() => {
          setLikes(prevLikes => prevLikes + 1);  // עדכון מספר הלייקים
          setIsLiked(true);  // עדכון סטייט שהלייק נלחץ
        })
        .catch(error => {
          console.error('Error liking playlist:', error);
        });
    }
  };

  const handleClose = () => {
    setSelectedPlaylist(null);
  };

    

return (
  selectedPlaylist && (
    <div className="playlist-songs-container">
      <button className="close-button" onClick={handleClose}>
        <FaTimes />
      </button>
      <h2>{selectedPlaylist.playlistName}</h2>
      <h3>רשימת השירים בפלייליסט</h3>
      <div className={`likes-container ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
        <span className="likes-count">{likes}</span>
        <FaThumbsUp className="thumbs-icon" />
      </div>
      <ul className="song-list">
        {songs.length > 0 ? (
          songs.map((song, index) => {
            const pictureUrl = song.pictureUrl ? `${URL}${song.pictureUrl}` : 'default-image-url';
            const songClass = index === currentSongIndex ? 'song-item playing' : 'song-item';
            return (
              <li key={song.songId} className={songClass} onClick={() => handleSongClick(song, index)}>
                <div className="songs-details">
                  <img src={pictureUrl} alt={song.songName} className="song-image" />
                  <h3>{song.songName}</h3>
                  <p>זמר: {song.singerName}</p>
                  <p>תאריך העלאה: {new Date(song.uploadDate).toLocaleDateString()}</p>
                </div>
              </li>
            );
          })
        ) : (
          <p>אין שירים להצגה😕</p>
        )}
      </ul>
      {songs.length > 0 && currentSong && (
        <audio controls autoPlay ref={audioRef} onEnded={handleAudioEnded}>
          <source src={`${URL}${currentSong.songLink}`} type="audio/mpeg" />
          הדפדפן שלך אינו תומך בניגון אודיו.
        </audio>
      )}
    </div>
  )
);
};
export default PlaylistPlay;