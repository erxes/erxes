import React, { Component } from 'react';
import PropTypes from 'prop-types';
import script from 'scriptjs';

script('https://platform.twitter.com/widgets.js', 'twitter-embed');

const propTypes = {
  id: PropTypes.string.isRequired
};

class TwitterVideoEmbed extends Component {
  componentDidMount() {
    script.ready('twitter-embed', () => {
      if (!window.twttr) {
        console.error('Failure to load window.twttr, aborting load.');
        return;
      }

      window.twttr.widgets.createVideo(this.props.id, this.embedContainer);
    });
  }

  render() {
    // style for embed margin 8px
    const containerStyle = { marginLeft: '-8px', marginRight: '-8px' };

    return (
      <div
        style={containerStyle}
        ref={c => {
          this.embedContainer = c;
        }}
      />
    );
  }
}

TwitterVideoEmbed.propTypes = propTypes;

export default TwitterVideoEmbed;
