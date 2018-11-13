import React, { Component } from 'react';
import './App.css';

class Youtube extends Component {
  render() {
    return (
      <div className="video">
        {this.props.results.map((video) => {
          console.log(video);
          return (
            <div
              key={video.id}
              className="ytSearchResult">
              <div className="ytContent">
                <div className="ytTitle">
                  <button
                    className="pure-button pure-button-primary"
                    onClick={() => this.props.addToPlaylist(video)}>
                    +
                  </button>
                  {video.title}
                </div>
                <div className="ytDesc">
                  {video.description}
                </div>
              </div>
              <img
                src={video.thumbnails.high.url}
                className="videoImage"
                alt={video.title}
                onClick={() => this.props.playDemo(video.id)} />
            </div>
          )
        })}
      </div>
    );
  }
}

export default Youtube;
