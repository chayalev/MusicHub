import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/HomePage.css'; // CSS File
import { URL } from '../config.js';

const HomePage = () => {
  const [userCount, setUserCount] = useState(0);
  const [songCount, setSongCount] = useState(0);
  const [singerCount, setSingerCount] = useState(0);
  const [mostPlayedSong, setMostPlayedSong] = useState(null);
  const [mostPlayedSinger, setMostPlayedSinger] = useState(null);
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  useEffect(() => {
    fetchCounts();
    fetchMostPlayed();
  }, []);

  const fetchCounts = async () => {
    try {
      const userResponse = await axios.get(`${URL}/users/count`);
      const songResponse = await axios.get(`${URL}/songs/count/${currentUser.userId}`);
      const singerResponse = await axios.get(`${URL}/singers/count/${currentUser.userId}`);

      animateCount(userResponse.data.count, setUserCount);
      animateCount(songResponse.data.count, setSongCount);
      animateCount(singerResponse.data.count, setSingerCount);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const animateCount = (end, setState) => {
    let start = 0;
    const duration = 2000;
    const stepTime = Math.abs(Math.floor(duration / end));

    const timer = setInterval(() => {
      start += 1;
      setState(start);
      if (start === end) clearInterval(timer);
    }, stepTime);
  };

  const fetchMostPlayed = async () => {
    try {
      const response = await axios.get(`${URL}/songplays/most-played`);
      const { mostPlayedSong,mostPlayedSinger } = response.data;
      setMostPlayedSong(mostPlayedSong);
      setMostPlayedSinger(mostPlayedSinger);
    } catch (error) {
      console.error('Error fetching most played song and singer:', error);
    }
  };

  return (
    <div className="home-page">
      <div className="count-container">
        <div className="count-box">
          <h2>כמות המשתמשים</h2>
          <p>{userCount}</p>
        </div>
        <div className="count-box">
          <h2>כמות השירים</h2>
          <p>{songCount}</p>
        </div>
        <div className="count-box">
          <h2>כמות הזמרים</h2>
          <p>{singerCount}</p>
        </div>
      </div>
      <div className="most-played-container">
        <div className="most-played-box">
          <h2>השיר הכי אהוב</h2>
          <p>{mostPlayedSong?.songName}</p>
          <img src={`${URL}${mostPlayedSong?.pictureUrl}`} alt="Most Played Song" />
        </div>
        <div className="most-played-box">
          <h2>הזמר הכי פופולארי</h2>
          <p>{mostPlayedSinger?.singerName}</p>
          <img src={`${URL}${mostPlayedSinger?.pictureUrl}`} alt="Most Played Singer" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
