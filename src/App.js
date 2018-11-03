import React, { Component } from 'react';
import './App.css';
import * as _ from 'lodash';
import Video from './Video';
import firebase from 'firebase';

class App extends Component {

  state = {
    ytUrl: '',
    videos: [],
    playlistId: localStorage.getItem('playlistId') || '',
    showPlaylist: localStorage.getItem('playlistId')  ? true : false,
    error: false
  }

  componentDidMount() {
    if (this.state.playlistId) {
      this.watchDb();
    }
  }

  updateUrl = (evt) => {
    this.setState({
      ytUrl: evt.target.value
    });
  }

  extractYtIdFromUrl = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[7].length === 11) ? match[7] : false;
  };

  addVideo = () => {
    const videos = _.cloneDeep(this.state.videos);
    const videoId = this.extractYtIdFromUrl(this.state.ytUrl);
    console.log('videoId: ', videoId);
    if (videoId) {
      videos.unshift(videoId);
    
      firebase.database().ref('playlists/' + this.state.playlistId).set({
        videos
      });

      this.setState({
        ytUrl: '',
        error: false
      });
    } else {
      this.setState({
        error: true
      });
    }
  }

  updatePlaylistId = (evt) => {
    this.setState({
      playlistId: evt.target.value
    });
  }

  goToPlaylist = () => {
    this.setState({
      showPlaylist: true
    });
    localStorage.setItem('playlistId', this.state.playlistId);
    this.watchDb();
  }

  watchDb = () => {
    const db = firebase.database().ref('playlists/' + this.state.playlistId);

    db.on('value', (snapshot) => {
      console.log('dbUpdated', snapshot.val());
      this.setState({
        videos: snapshot && snapshot.val() && snapshot.val().videos || []
      })
    });
  }

  switchPlaylist = () => {
    this.setState({
      playlistId: '',
      ytUrl: '',
      showPlaylist: false
    });
  }

  render() {
    if (!this.state.showPlaylist) {
      return(
        <div>
          <input 
            value={this.state.playlistId} 
            onChange={this.updatePlaylistId}
            placeholder="Enter a playlist ID"  />
          <button onClick={this.goToPlaylist}> JOIN</button>
        </div>
      );
    }

    return (
      <div className="App">
        <input 
          value={this.state.ytUrl} 
          onChange={this.updateUrl} 
          placeholder="Enter full Youtube url" />
        <button onClick={this.addVideo}>
          ADD
        </button>
        <button onClick={this.switchPlaylist}>Switch Playlist</button>
        <div>
          {this.state.error ? <div>Invalid Id</div> : undefined}
        </div>
        
        {this.state.videos.map((videoId) => <Video id={videoId} key={videoId} />)}
      </div>
    );
  }
}

export default App;
