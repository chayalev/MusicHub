import React, { useEffect, useState, useRef, useContext } from 'react';
import { FaThumbsUp, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import Comments from './Comments.jsx';
import '../css/SongPlay.css';
import { URL } from '../config.js';
import { SelectedSongContext } from '../context/selectedSongContext.jsx';
import { SelectedPlaylistContext } from '../context/selectedPlaylistContext.jsx';

const SongPlay = () => {
  const { selectedSong,setSelectedSong } = useContext(SelectedSongContext)
  const { setSelectedPlaylist } = useContext(SelectedPlaylistContext)
  const [likes, setLikes] = useState(selectedSong ? selectedSong.likes : 0);
  const [isLiked, setIsLiked] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (selectedSong) {
      setSelectedPlaylist(null);//אם היה פליליסט שנבחר
      setLikes(selectedSong.likes);
      setIsLiked(false);

      if (audioRef?.current) {
        audioRef.current?.play();
      }
    }
  }, [selectedSong]);

  const handleLike = () => {
    if (!isLiked && selectedSong) {
      axios.put(`${URL}/songs/${selectedSong.songId}/addLike`)
        .then(() => {
          setLikes(prevLikes => prevLikes + 1);
          setIsLiked(true);
        })
        .catch(error => {
          console.error('Error liking song:', error);
        });
    }
  };

  const handleClose = () => {
    setSelectedSong(null);
  };
  
  if (!selectedSong) {
    return null;
  }

  const pictureUrl = selectedSong.pictureUrl ? `${URL}${selectedSong.pictureUrl}` : 'default-image-url';
  const songLink = selectedSong.songLink ? `${URL}${selectedSong.songLink}` : '';

  return (
    <div className="song_details">
      <button className="close-button" onClick={handleClose}><FaTimes /></button>
      <img src={pictureUrl} alt={selectedSong.songName} />
      <div className="song-header">
        <h2>{selectedSong.songName}</h2>
        <div className={`likes-container ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          <span className="likes-count">{likes}</span>
          <FaThumbsUp className="thumbs-icon" />
        </div>
      </div>
      <div className="song-info">
        <p>זמר: {selectedSong.singerName}</p>
        <p>סוג: {selectedSong.typeName}</p>
        <p className="upload-date">תאריך העלאה: {new Date(selectedSong.uploadDate).toLocaleDateString()}</p>
      </div>
      <audio key={selectedSong.songId} className="audio-player" controls autoPlay ref={audioRef}>
        <source src={songLink} type="audio/mpeg" />
        הדפדפן שלך אינו תומך בנגן האודיו.
      </audio>
      <div className="comments-section">
        <Comments songId={selectedSong.songId} />
      </div>
    </div>
  );
};

export default SongPlay;

