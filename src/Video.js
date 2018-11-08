import React, {Component} from 'react';
import YouTube from 'react-youtube';

class Video extends Component {

  _onReady(event) {
    event.target.pauseVideo();
  }

  render() {
    const opts = {
      height: '390',
      width: '640',
      playerVars: {
        autoplay: 0
      }
    };
    return (
      <div className="video">
        <YouTube
          videoId={this.props.id}
          opts={opts}
          onReady={this._onReady}
        />
      </div>
    );
  }
}

export default Video;
