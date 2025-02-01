import React, { createContext, useState } from 'react';

export const SongContext = createContext();

export const SongProvider = ({ children }) => {
  const [songs, setSongs] = useState([]);
  const [dateGetValue, setDateGetValue] = useState(null);

  const data = {
    songs,
    dateGetValue,
    setSongs: (data) => {
      setDateGetValue(new Date());
      setSongs(data);
    },
    removeSong: (songId) => {
      setSongs((prevSongs) => prevSongs.filter((song) => song.songId !== songId));
    },
    deleteAllSongs: () => {
      setSongs([]);
    },
    updateSong: (updatedSong) => {
      setSongs((prevSongs) =>
        prevSongs.map((song) => (song.songId === updatedSong.songId ? updatedSong : song))
      );
    },
  };

  return <SongContext.Provider value={data}>{children}</SongContext.Provider>;
};



