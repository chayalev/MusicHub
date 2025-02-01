import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../css/AddPlaylist.css';
import { URL } from '../config';
import  { useContext } from 'react';
import { SongContext } from '../context/songsContext.jsx';


function AddPlaylist({  onClose, playlistToEdit }) {
    const [playlistName, setPlaylistName] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    // const { songs, setSongs, dateGetValue } = useContext(SongContext);
    const { songs, setSongs ,dateGetValue} = useContext(SongContext);
    const [selectedSongs, setSelectedSongs] = useState([]);//השירים שנבחרו כעת
    const [songsBeforeUpdate, setSongsBeforeUpdate] = useState([]);//השירים לפני העריכה

    useEffect(() => {
        if (!songs.length || !dateGetValue || dateGetValue < new Date().setHours(new Date().getHours() - 1)) {
            fetchSongs();
          }
        // מילוי שדות אם עורכים פלייליסט קיים
        if (playlistToEdit) {
            setPlaylistName(playlistToEdit.playlistName);
            setIsPublic(playlistToEdit.isPublic);
            fetchPlaylistSongs(playlistToEdit.playlistId);
        }
    }, [playlistToEdit]);

     // טעינת כל השירים הקיימים
     const fetchSongs = async () => {
        try {
            const response = await axios.get(`${URL}/songs`);
            setSongs(response.data);
        } catch (error) {
            console.error('Error fetching songs:', error);
        }
    };


    //אם הוא במצב עריכה מציג 
    const fetchPlaylistSongs = async (playlistId) => {
        try {
            //טעינת השירים של הפליליסט
            const response = await axios.get(`${URL}/playlistSongs/${playlistId}`);
            let playlistSongs = [];

            // בדיקה אם הנתונים הם מערך של שירים או אובייקט של שיר
            if (Array.isArray(response.data)) {
                playlistSongs = response.data;
            } else if (response.data.playlistSongs) {
                // אם יש אובייקט של שירים במערך
                playlistSongs = response.data.playlistSongs;
            } else {
                // אם הנתונים הם אובייקט בודד של שיר
                playlistSongs = [response.data];
            }

            const selectedSongIds = playlistSongs.map(song => song.songId);
            setSelectedSongs(selectedSongIds);
            setSongsBeforeUpdate(selectedSongIds);

        } 
        catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('לא נמצאו שירים עבור הפלייליסט הנבחר');
            } else {
                console.error('שגיאה בקריאת השירים של הפלייליסט:', error);
            }
        }
    };


    const getCurrentUserId = () => {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        return currentUser ? currentUser.userId : null;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        //במצב של עריכה
        if (playlistToEdit) {
            try {
                const updatedPlaylist = {
                    playlistId: playlistToEdit.playlistId,
                    playlistName: playlistName,
                    isPublic: isPublic,
                };
    
                //עידכון פרטי הפליליסט
                await axios.put(`${URL}/playlists/${playlistToEdit.playlistId}`, updatedPlaylist);
    
                //בדיקה אילו שירים צריך להשאיר ואילו להוריד
                const songsToAdd = selectedSongs.filter(songId => !songsBeforeUpdate.includes(songId));
                const songsToRemove = songsBeforeUpdate.filter(songId => !selectedSongs.includes(songId));
    
            //הוספת השירים שלא נבחרו לפני
                const addPromises = songsToAdd.map((songId) => {
                    return axios.post(`${URL}/playlistSongs`, { songId, playlistId: playlistToEdit.playlistId });
                });
    
                //הסרת השירים שלא רצויים
                const removePromises = songsToRemove.map((songId) => {
                    return axios.delete(`${URL}/playlistSongs/${playlistToEdit.playlistId}/${songId}`);
                });
    
                // Wait for all add and remove operations to complete
                await Promise.all([...addPromises, ...removePromises]);
    
    
                // Display Swal alert after all operations complete
                Swal.fire({
                    icon: 'success',
                    title: 'הפלייליסט עודכן בהצלחה!',
                    text: 'הפרטים של הפלייליסט עודכנו בהצלחה 😊',
                }).then(() => {
                    console.log('Swal alert closed');
                    onClose();
                });
    
            } catch (error) {
                console.error('Error updating playlist:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'שגיאה בעדכון הפלייליסט',
                    text: 'נסה שוב מאוחר יותר',
                });
            }
        } 
        //במצב של הוספה
        else {
            //יצירת פליליסט מה]רטים שהוזנו
            try {
                const newPlaylist = {
                    playlistName: playlistName,
                    isPublic: isPublic,
                    userId: getCurrentUserId(),
                };
    
                const source = 'client'; // זיהוי הקריאה מהלקוח
    
                const response = await axios.post(`${URL}/playlists`, { ...newPlaylist, source });
                const createdPlaylist = response.data;
    
                const addPromises = selectedSongs.map((songId) => {
                    return axios.post(`${URL}/playlistSongs`, { playlistId: createdPlaylist.playlistId, songId });
                });
    
                // Wait for all add operations to complete
                await Promise.all(addPromises);
    
    
                // Display Swal alert after all operations complete
                Swal.fire({
                    icon: 'success',
                    title: 'הפלייליסט נוסף בהצלחה!',
                    text: 'הפלייליסט שלך נוסף בהצלחה 😊',
                }).then(() => {
                    console.log('Swal alert closed');
                    onClose();
                });
    
            } catch (error) {
                console.error('Error adding playlist:', error);
                if (error.response && error.response.data && error.response.data.message === 'שם הפלייליסט "השירים שאהבתי" לא ניתן לשימוש') {
                    Swal.fire({
                        icon: 'error',
                        title: 'שגיאה בהוספת הפלייליסט',
                        text: error.response.data.message,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'שגיאה בהוספת הפלייליסט',
                        text: 'נסה שוב מאוחר יותר',
                    });
                }
            }
        }
    };
    

    //השירים הבחורים
    const handleCheckboxChange = (songId) => {
        setSelectedSongs((prevSelected) =>
            prevSelected.includes(songId)
                ? prevSelected.filter((id) => id !== songId)
                : [...prevSelected, songId]
        );
    };

    return (
        <div className="add-playlist-container">
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="playlistName">שם הפלייליסט</label>
                    <input
                        type="text"
                        id="playlistName"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>סטטוס הפלייליסט</label>
                    <div className="radio-buttons">
                        <label>
                            <input
                                type="radio"
                                value="public"
                                checked={isPublic}
                                onChange={() => setIsPublic(true)}
                            />
                            ציבורי
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="private"
                                checked={!isPublic}
                                onChange={() => setIsPublic(false)}
                            />
                            פרטי
                        </label>
                    </div>
                </div>
                <div className="songs-list">
                    <h3>בחר שירים</h3>
                    <div className="scrollable-container">
                        <div className="scrollable-content">
                            {songs.map((song) => {
                                const pictureUrl = song.pictureUrl ? `${URL}${song.pictureUrl}` : 'default-image-url';
                                return (
                                    <div key={song.songId} className="song-item">
                                        <label>
                                            <div className="songs-details">
                                                <div className="song-info">
                                                    <span className="song-name">{song.songName}</span>
                                                    <span className="song-artist">{song.artist}</span>
                                                </div>
                                                <img src={pictureUrl} alt={song.songName} className="song-image" />
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={selectedSongs.includes(song.songId)}
                                                onChange={() => handleCheckboxChange(song.songId)}
                                            />
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="button-group">
                    <button type="submit" className="btn">
                        {playlistToEdit ? 'שמור שינויים' : 'הוסף פלייליסט'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddPlaylist;

