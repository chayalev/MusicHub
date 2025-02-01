
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/SongForm.css';
import { SongContext } from '../context/songsContext';
import { URL } from '../config';
import { TypeContext } from '../context/typeContext';

const SongForm = () => {
  const { updateSong, setSongs, songs } = useContext(SongContext)
  const { types, setTypes } = useContext(TypeContext)
  const { id, singerId } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState({
    songName: '',
    description: '',
    typeId: '',
    singerId: singerId || '',
    songLink: '',
    pictureUrl: '',
    likes: 0
  });
  const [file, setFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [songTypes, setSongTypes] = useState([]);
  const fileInputRef = useRef(null);
  const audioFileInputRef = useRef(null);

  useEffect(() => {
    if (!types.length) {
      console.log("types", types);
      fetchTypes();
    }
    if (id) {
      axios.get(`${URL}/songs/${id}`)
        .then(response => {
          setSong(response.data);
          setFile(response.data.pictureUrl ? { name: response.data.pictureUrl } : null);
          setAudioFile(response.data.songLink ? { name: response.data.songLink } : null);
          // עדכון השיר ב-songs אם הוא קיים
          setSongs((prevSongs) =>
            prevSongs.map((song) => (song.songId === id ? response.data : song))
          );
        })
        .catch(error => {
          console.error('Error fetching song:', error);
        });
    }
  }, [id]);





  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSong({
      ...song,
      [name]: value
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
    } else {
      alert('נא להעלות קובץ תמונה בלבד.');
      fileInputRef.current.value = ''; // איפוס שדה הקובץ
    }
  };

  const handleAudioFileChange = (e) => {
    const selectedAudioFile = e.target.files[0];
    if (selectedAudioFile && selectedAudioFile.type.startsWith('audio/')) {
      setAudioFile(selectedAudioFile);
    } else {
      alert('נא להעלות קובץ שמע בלבד.');
      audioFileInputRef.current.value = ''; // איפוס שדה הקובץ
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('songName', song.songName);
    formData.append('description', song.description);
    formData.append('typeId', song.typeId);
    formData.append('singerId', singerId);
    formData.append('likes', song.likes);

    if (file && file instanceof File) {
      formData.append('picture', file);
    } else if (song.pictureUrl && !file) {
      formData.append('picture', song.pictureUrl);
    }

    if (audioFile && audioFile instanceof File) {
      formData.append('songLink', audioFile);
    } else if (song.songLink && !audioFile) {
      formData.append('songLink', song.songLink);
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
console.log("song",song);

    if (id) {
      axios.put(`${URL}/songs/${id}`, formData, config)
        .then((response) => { 
          setSongs((prevSongs) => prevSongs.map((sng) =>
            sng.songId == id ? song : sng
          ));          
          navigate(`/singer/${singerId}`, { replace: true });
        })
        .catch((error) => {
          console.error('Error updating song:', error);
        });
    } else {
      axios.post(`${URL}/songs`, formData, config)
        .then((response) => {
          setSongs((prevSongs) => [...prevSongs, response.data]);
          navigate(`/singer/${singerId}`, { replace: true });
        })
        .catch((error) => {
          console.error('Error adding song:', error);
        });
    }
  };

  //   const handleSubmit = (e) => {
  //     e.preventDefault();

  //     const formData = new FormData();
  //     formData.append('songName', song.songName);
  //     formData.append('description', song.description);
  //     formData.append('typeId', song.typeId);
  //     formData.append('singerId', singerId);
  //     formData.append('likes', song.likes);
  // console.log("file",file);
  // console.log("song.pictureUrl",song.pictureUrl)

  //     if (file && file.name !== song.pictureUrl) {
  //       formData.append('picture', file);
  //     } else if (song.pictureUrl && !file) {
  //       formData.append('picture', song.pictureUrl);
  //     }

  //     if (audioFile && audioFile.name !== song.songLink) {
  //       formData.append('songLink', audioFile);
  //     } else if (song.songLink && !audioFile) {
  //       formData.append('songLink', song.songLink);
  //     }

  //     const config = {
  //       headers: {
  //         'Content-Type': 'multipart/form-data'
  //       }
  //     };

  //     if (id) {
  //       console.log("formData",formData);

  //       axios.put(`${URL}/songs/${id}`, formData, config)
  //         .then((x) => {
  //           console.log("x.data");
  //           console.log(x.data);

  //            updateSong(x.data)
  //            navigate(`/singer/${singerId}`, { replace: true });
  //         })
  //         .catch(error => {
  //           console.error('Error updating song:', error);
  //         });
  //     } else {
  //       axios.post(`${URL}/songs`, formData, config)
  //         .then((response) => {
  //           setSongs(prevSongs => [...prevSongs, response.data]);
  //           navigate(`/singer/${singerId}`, { replace: true });
  //         })
  //         .catch(error => {
  //           console.error('Error adding song:', error);
  //         });
  //     }
  //   };
  return (
    <div className="song-form-container">
      <h2>{id ? 'עריכת שיר' : 'הוספת שיר חדש'}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="songName">שם השיר:</label>
        <input
          type="text"
          id="songName"
          name="songName"
          value={song.songName || ''}
          placeholder="שם השיר"
          onChange={handleInputChange}
          required
        />
        <label htmlFor="description">תיאור:</label>
        <input
          type="text"
          id="description"
          name="description"
          value={song.description || ''}
          placeholder="תיאור"
          onChange={handleInputChange}
          required
        />
        <label htmlFor="typeId">סוג:</label>
        <select
          id="typeId"
          name="typeId"
          value={song.typeId}
          onChange={handleInputChange}
          required
        >
          <option value="">בחר סוג</option>
          {types.map(type => (
            <option key={type.typeId} value={type.typeId}>
              {type.typeName}
            </option>
          ))}
        </select>
        <div className="file-upload-container">
          <label htmlFor="songLink">בחר קובץ שמע</label>
          <input
            type="file"
            id="songLink"
            name="songLink"
            ref={audioFileInputRef}
            onChange={handleAudioFileChange}
            required={!id}
          />
          {audioFile && <div className="file-name">{audioFile.name}</div>}
        </div>
        <div className="file-upload-container">
          <label htmlFor="picture">בחר תמונת שיר</label>
          <input
            type="file"
            id="picture"
            name="picture"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          {file && <div className="file-name">{file.name}</div>}
        </div>
        <button type="submit">{id ? 'עדכן שיר' : 'הוסף שיר'}</button>
      </form>
      {song.pictureUrl ? (
        <img src={`${URL}${song.pictureUrl}`} alt="תמונת השיר" />
      ) : (
        <img src={`${URL}/uploads/default.png`} alt="תמונת ברירת מחדל לשיר" />
      )}
      {song.songLink && (
        <audio controls>
          <source src={`${URL}${song.songLink}`} type="audio/mpeg" />
          הדפדפן שלך לא תומך באלמנט שמע.
        </audio>
      )}
    </div>
  );
};

export default SongForm;
