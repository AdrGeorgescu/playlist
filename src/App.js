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
    showPlaylist: !!localStorage.getItem('playlistId'),
    videos: [],
    ytQueryResults: [],
    error: false,
    showSearchColumn: true,
    unwatchedVideos: 0,
    currentlyPlaying: '',
    demoId: '',
    fullWidthFirstColumn: ''
  }
  
  pageTitle = '▶ Playlist';

  componentDidMount() {
    if (this.state.playlistId) {
      this.watchDb();
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

  addVideo = (video) => {
    if (!video && this.state.ytUrl) {
      const videoId = this.extractYtIdFromUrl(this.state.ytUrl);

      if (videoId) {
        const videInfoEndpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${process.env.REACT_APP_API_KEY}`;

        fetch(videInfoEndpoint)
          .then((response) => response.json())
          .then((video) => {
            const vid = video.items[0];
            const newVideo = {
              id: vid.id,
              title: vid.snippet.title
            };

            this.pushVideo(newVideo);
        });
      }

      return;
    }

    if (video) {
      this.pushVideo(video);
    } else {
      this.setState({
        error: true
      });
    }
  }

  pushVideo = (video) => {
    const videos = _.cloneDeep(this.state.videos);
    videos.push(video);

    firebase.database().ref('playlists/' + this.state.playlistId).set({
      videos
    });

    this.setState({
      ytUrl: '',
      error: false
    });
  }

  updatePlaylistId = (evt) => {
    this.setState({
      playlistId: evt.target.value
    });
  }

  goToPlaylist = (e) => {
    e.preventDefault();

    this.setState({
      showPlaylist: true
    });

    localStorage.setItem('playlistId', this.state.playlistId);
    this.watchDb();
  }

  watchDb = () => {
    const db = firebase.database().ref('playlists/' + this.state.playlistId);
    
    db.on('value', (snapshot) => {
      const videos = snapshot && snapshot.val() && snapshot.val().videos || [];
      const unwatchedVideos = document.hidden ? ++this.state.unwatchedVideos : 0 ;
      
      this.setState({
        videos,
        unwatchedVideos,
        currentlyPlaying: this.state.currentlyPlaying ? this.state.currentlyPlaying : videos.length && videos[0].id
      }, () => {
        document.title = document.hidden ? `(${unwatchedVideos}) ${this.pageTitle}` : this.pageTitle;
      });
    });
  }

  switchPlaylist = () => {
    this.setState({
      playlistId: '',
      ytUrl: '',
      ytquery: '',
      demoId: '',
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

  searchYt = (e) => {
    e.preventDefault();

    const opts = {
      maxResults: 10,
      key: process.env.REACT_APP_YT_APY_KEY
    };
     
    ysearch(this.state.ytquery, opts, (err, ytQueryResults) => {
      if (err) return console.log(err);

      this.setState({
        ytQueryResults
      });
    });
  }

  hideSearchColumn = () => {
    this.setState({
      showColumnClassName: this.state.showColumnClassName ? '' : 'hide',
      fullWidthFirstColumn: this.state.fullWidthFirstColumn ? '' : 'fullWidth'
    })
  }

  play = (id) => {
    this.setState({
      currentlyPlaying: id
    });
  }

  playNext = () => {
    const playingVideoIndex = this.state.videos.findIndex((vid) => vid.id === this.state.currentlyPlaying);

    if (playingVideoIndex + 1 < this.state.videos.length) {
      this.setState({
        currentlyPlaying: this.state.videos[playingVideoIndex + 1].id
      });
    }
  }

  render() {
    if (!this.state.showPlaylist) {
      return(
        <form onSubmit={this.goToPlaylist}>
          <div className="App pure-form top">
            <input
              value={this.state.playlistId}
              onChange={this.updatePlaylistId}
              placeholder="Enter a playlist ID"  />
            <button
              className="pure-button pure-button-primary">
              JOIN
            </button>
          </div>
        </form>
      );
    }

    return (
      <div className="App pure-form">
        <div className={`playlist side ${this.state.fullWidthFirstColumn}`}>
          <div className="top">
            <form onSubmit={(e) => { this.addVideo(); e.preventDefault();}}>
              <input
                value={this.state.ytUrl}
                onChange={this.updateUrl}
                className="addYtUrl"
                placeholder="Enter full Youtube url" />
              <button className="pure-button pure-button-primary">
                ADD
              </button>

              <button
                className="pure-button pure-button-primary"
                type="button"
                onClick={this.switchPlaylist}>
                Switch Playlist
              </button>
              <button
                className="pure-button pure-button-primary"
                type="button"
                onClick={this.hideSearchColumn} >
                Show Youtube Search
              </button>
              <div>
                {this.state.error ? <div>Invalid Id</div> : undefined}
              </div>
            </form>
          </div>
          
          {
            this.state.currentlyPlaying
              ? <Video id={this.state.currentlyPlaying} playNext={() => this.playNext()} />
              : false
          }

          <div className="videosList">
          {
            this.state.videos.map((video) =>
              <div
                className={"videoEntry " + (video.id === this.state.currentlyPlaying ? "playing" : "")}
                onClick={() => this.play(video.id)}>
                  {video.title}
              </div>)
          }
          </div>
        </div>
        
        <div className={`ytSearch side ${this.state.showColumnClassName}`}>
          <div className="top">
            <form onSubmit={this.searchYt}>
              <input
                value={this.state.ytquery}
                onChange={this.updateQuery} />
              <button
                className="pure-button pure-button-primary">
                Search Youtube
              </button>
              <button
                className="pure-button pure-button-primary"
                type="button"
                onClick={this.clearSearchYt}>
                Clear
              </button>
            </form>
          </div>

          { this.state.demoId ? <Video id={this.state.demoId} /> : false }

          <Youtube 
            results={this.state.ytQueryResults}
            addToPlaylist={(video) => this.addVideo(video)}
            playDemo={(id) => this.setState({ demoId: id})}/>
        </div>
      </div>
    );
  }
}

export default App;
