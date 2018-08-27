import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ImageWithPreview } from 'modules/common/components';
import { TwitterVideoEmbed } from './';

const Gif = styled.a`
  display: block;
  max-width: 460px;
  position: relative;
  margin-bottom: 15px;
  overflow: hidden;

  video {
    width: 100%;
    border-radius: 4px;
    float: left;
  }
`;

const GifIcon = styled.span`
  background: url(images/icons/gif.svg) center no-repeat;
  background-color: rgba(0, 0, 0, 0.6);
  background-size: contain;
  border-radius: 4px;
  padding: 5px;
  width: 30px;
  height: 20px;
  position: absolute;
  left: 10px;
  bottom: 10px;
`;

const propTypes = {
  data: PropTypes.object.isRequired
};

class TweetMedia extends Component {
  renderMedia() {
    const { data } = this.props;
    const entities =
      data.extended_entities ||
      (data.extended_tweet &&
        (data.extended_tweet.extended_entities ||
          data.extended_tweet.entities)) ||
      data.entities;
    const hasMedia = entities.media && entities.media.length;
    const media = hasMedia && entities.media[0];

    if (hasMedia && media.type === 'photo') {
      return (
        <ImageWithPreview
          alt={entities.media[0].url}
          src={entities.media[0].media_url}
        />
      );
    }

    if (hasMedia && media.type === 'animated_gif') {
      const gif =
        media.video_info &&
        media.video_info.variants &&
        media.video_info.variants[0];
      const url = gif.url;
      const type = gif.content_type;

      return (
        <Gif href={media.expanded_url} target="_blank">
          <video
            playsInline
            autoPlay
            loop
            muted
            poster={media.media_url}
            src={url}
            type={type}
          />

          <GifIcon />
        </Gif>
      );
    }

    if (hasMedia && media.type === 'video') {
      return <TwitterVideoEmbed id={data.id_str} />;
    }

    return null;
  }

  render() {
    return this.renderMedia();
  }
}

TweetMedia.propTypes = propTypes;

export default TweetMedia;
