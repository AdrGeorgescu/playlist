import React, { Component } from 'react';

class Video extends Component {
  render() {
    return (
      <div className="video">
        <iframe 
            width="600" 
            height="315"
            src={`https://www.youtube.com/embed/${this.props.id}`}>
        </iframe>
      </div>
    );
  }
}

export default Video;
