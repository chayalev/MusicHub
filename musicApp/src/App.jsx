import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation, useNavigate } from 'react-router-dom';
import SongForm from './jsx/SongForm.jsx';
import SingerForm from './jsx/SingerForm.jsx';
import Songs from './jsx/Songs.jsx';
import Singers from './jsx/Singers.jsx';
import MainPage from './jsx/MainPage.jsx';
import SongPlay from './jsx/SongPlay.jsx';
import Layout from './jsx/Layout.jsx';
import MainPageSinger from './jsx/MainPageSinger.jsx';
import MyPlaylist from './jsx/MyPlaylist.jsx';
import HomePage from './jsx/HomePage.jsx';
import PlaylistPlay from './jsx/PlaylistPlay.jsx';
import './App.css';
import { SelectedSongContext } from './context/selectedSongContext.jsx';
import { SelectedPlaylistContext } from './context/selectedPlaylistContext.jsx';
import checkAuthorization from './jsx/CheckService.jsx';

const App = () => {

  const [typeSide, setTypeSide] = useState(null);
  const { selectedPlaylist } = useContext(SelectedPlaylistContext);
  const { selectedSong } = useContext(SelectedSongContext);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (selectedSong) {
      setTypeSide('Song')
    }

  }, [selectedSong])

  useEffect(() => {
    if (selectedPlaylist) {
      setTypeSide('PlayList')
    }
  }, [selectedPlaylist])

  useEffect(() => {
    // Fetch counts from server
    if (checkAuthorization(location.pathname)) {
      navigate('/'); // Redirect to a different page if unauthorized
      return;
    }
  }, []);
  return (
    <div className="app-container">
      {typeSide == 'Song' && <SongPlay />}
      {typeSide == 'PlayList' && <PlaylistPlay />}
      <div className="main-content">
        <Routes>
          <Route index element={<MainPage />} />
          <Route path="newSinger" element={<SingerForm />} />
          <Route path="/" element={<Layout />}>
            <Route path="user/:userId" element={<Outlet />}>
              <Route path="singers" element={<Singers />} />
              <Route path="songs" element={<Songs />} />
              <Route path="homePage" element={<HomePage />} />
              <Route path="playlists" element={<MyPlaylist />} />
            </Route>
          </Route>
          {/* נתיבים מקוננים של זמר */}
          <Route path="singer/:singerId" element={<Outlet />}>
            <Route index element={<MainPageSinger />} />
            <Route path="edit" element={<SingerForm />} />
            <Route path="song" element={<SongForm />} />
            <Route path="songs" element={<Songs />} />
            <Route path="songs/:id/edit" element={<SongForm />} />
          </Route>

        </Routes>
      </div>
    </div>
  );
};


export default App;