import React, { Component } from 'react';
import './App.css';
import * as _ from 'lodash';
import Video from './Video';
import firebase from 'firebase';
import ysearch from 'youtube-search';
import Youtube from './Youtube';

class App extends Component {

  state = {
    ytUrl: '',
    ytquery: '',
    showColumnClassName: '',
    playlistId: localStorage.getItem('playlistId') || '',
    showPlaylist: localStorage.getItem('playlistId')  ? true : false,
    videos: [],
    ytQueryResults: [],
    error: false,
    showSearchColumn: true,
    unwatchedVideos: 0
  }
  
  pageTitle = '▶ Playlist';

  componentDidMount() {
    if (this.state.playlistId) {
      this.watchDb(true);
    }
    window.onfocus = () => {
      document.title = this.pageTitle;

      this.setState({
        unwatchedVideos: 0
      });
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

  addVideo = (id) => {
    const videos = _.cloneDeep(this.state.videos);
    const videoId = this.extractYtIdFromUrl(this.state.ytUrl) || id;
    
    if (videoId) {
      videos.push(videoId);
    
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
    this.watchDb(true);
  }

  watchDb = (firstUpdate) => {
    const db = firebase.database().ref('playlists/' + this.state.playlistId);
    
    db.on('value', (snapshot) => {
      const videos = snapshot && snapshot.val() && snapshot.val().videos || [];
      const unwatchedVideos = firstUpdate ? 0 : ++this.state.unwatchedVideos;
      
      this.setState({
        videos,
        unwatchedVideos
      }, () => {
        document.title = firstUpdate ? this.pageTitle : `(${unwatchedVideos}) ${this.pageTitle}`
        firstUpdate = false;
      });
    });
  }

  switchPlaylist = () => {
    this.setState({
      playlistId: '',
      ytUrl: '',
      ytquery: '',
      showPlaylist: false,
      ytQueryResults: [],
      unwatchedVideos: 0
    });

    localStorage.removeItem('playlistId');
  }

  updateQuery = (evt) => {
    this.setState({
      ytquery: evt.target.value
    })
  }

  clearSearchYt = () => {
    this.setState({
      ytQueryResults: []
    });
  }

  searchYt = () => {
    var opts = {
      maxResults: 10,
      key: process.env.REACT_APP_YT_APY_KEY
    };
     
    ysearch(this.state.ytquery, opts, (err, ytQueryResults) => {
      if(err) return console.log(err);

      this.setState({
        ytQueryResults
      });
    });
  }

  hideSearchColumn = () => {
    this.setState({
      showColumnClassName: this.state.showColumnClassName ? '' : 'hide'
    })
  }

  render() {
    if (!this.state.showPlaylist) {
      return(
        <div className="App pure-form top">
          <input 
            value={this.state.playlistId} 
            onChange={this.updatePlaylistId}
            placeholder="Enter a playlist ID"  />
          <button 
            className="pure-button pure-button-primary"
            onClick={this.goToPlaylist}>
            JOIN
          </button>
        </div>
      );
    }

    return (
      <div className="App pure-form">
        <div className="playlist side">
          <div className="top">
            <input 
              value={this.state.ytUrl} 
              onChange={this.updateUrl} 
              placeholder="Enter full Youtube url" />
            <button 
              onClick={this.addVideo} 
              className="pure-button pure-button-primary">
              ADD
            </button>
            <button 
              className="pure-button pure-button-primary"
              onClick={this.switchPlaylist}>
              Switch Playlist
            </button>
            <button 
              className="pure-button pure-button-primary"
              onClick={this.hideSearchColumn} >
              Show Youtube Search
            </button>
            <div>
              {this.state.error ? <div>Invalid Id</div> : undefined}
            </div>
          </div>
          
          {this.state.videos.map((videoId) => <Video id={videoId} key={videoId} />)}
        </div>
        
        <div className={`ytSearch side ${this.state.showColumnClassName}`}>
          <div className="top">
            <input 
              value={this.state.ytquery} 
              onChange={this.updateQuery} />
            <button 
              className="pure-button pure-button-primary"
              onClick={this.searchYt}>
              Search Youtube
            </button>
            <button 
              className="pure-button pure-button-primary"
              onClick={this.clearSearchYt}>
              Clear
            </button>
          </div>

          <Youtube 
            results={this.state.ytQueryResults} 
            addToPlaylist={(videoId) => this.addVideo(videoId)} />
        </div>
      </div>
    );
  }
}

export default App;
