import React, { createContext, useState } from 'react';

export const SelectedPlaylistContext = createContext();

export const  SelectedPlaylistProvider = ({ children }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const data = {
    selectedPlaylist,
    setSelectedPlaylist: (data) => {
        setSelectedPlaylist(data);
    },
  };

  return <SelectedPlaylistContext.Provider value={data}>{children}</SelectedPlaylistContext.Provider>;
};