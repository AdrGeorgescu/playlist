import React, {Component} from 'react';
import YouTube from 'react-youtube';

class Video extends Component {

  _onReady = (event) => {
    event.target.pauseVideo();
  }

  _onStateChanged = (event) => {
    if (event.data === 0) {
      this.props.playNext();
    }
  }

  render() {
    const opts = {
      height: '390',
      width: '640',
      playerVars: {
        autoplay: 1
      }
    };
    return (
      <div className="video">
        <YouTube
          videoId={this.props.id}
          opts={opts}
          onReady={this._onReady}
          onStateChange={this._onStateChanged}
        />
      </div>
    );
  }
}

export default Video;
