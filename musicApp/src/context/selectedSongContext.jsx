import React, { createContext, useState } from 'react';

export const SelectedSongContext = createContext();

export const  SelectedSongProvider = ({ children }) => {
  const [selectedSong, setSelectedSong] = useState(null);
//   const [dateGetValue, setDateGetValue] = useState(null);

  const data = {
    selectedSong,
    setSelectedSong: (data) => {
        setSelectedSong(data);
    },
  };

  return <SelectedSongContext.Provider value={data}>{children}</SelectedSongContext.Provider>;
};
