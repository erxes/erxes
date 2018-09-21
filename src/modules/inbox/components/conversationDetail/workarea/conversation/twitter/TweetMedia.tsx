import { ImageWithPreview } from "modules/common/components";
import React, { Component } from "react";
import styled from "styled-components";
import { ITwitterData } from "../../../../../types";
import { TwitterVideoEmbed } from "./";

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

type Props = {
  data: ITwitterData;
  scrollBottom: () => void;
};

class TweetMedia extends Component<Props, {}> {
  getEntities(data: ITwitterData) {
    if (data.extended_entities) {
      return data.extended_entities;
    }

    if (data.extended_tweet) {
      return (
        data.extended_tweet.extended_entities || data.extended_tweet.entities
      );
    }

    return data.entities;
  }

  renderMedia() {
    const { data, scrollBottom } = this.props;
    const entities = this.getEntities(data);
    const hasMedia = entities.media && entities.media.length;
    const media = hasMedia && entities.media[0];

    if (!hasMedia) {
      return null;
    }

    if (media.type === "photo") {
      return (
        <ImageWithPreview
          alt={entities.media[0].url}
          src={entities.media[0].media_url}
          onLoad={scrollBottom}
        />
      );
    }

    if (media.type === "animated_gif") {
      const gif =
        media.video_info &&
        media.video_info.variants &&
        media.video_info.variants[0];
      const url = gif.url;

      return (
        <Gif href={media.expanded_url} target="_blank">
          <video
            playsInline
            autoPlay
            loop
            muted
            poster={media.media_url}
            src={url}
          />

          <GifIcon />
        </Gif>
      );
    }

    if (media.type === "video") {
      return <TwitterVideoEmbed id={data.id_str} />;
    }

    return null;
  }

  render() {
    return this.renderMedia();
  }
}

export default TweetMedia;
