import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import { Alert } from 'modules/common/utils';

const Footer = styled.div`
  text-align: right;
`;

const TweetInfo = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Char = styled.b`
  color: ${props => props.count < 0 && colors.colorCoreRed};
`;

const propTypes = {
  replyTweet: PropTypes.func.isRequired,
  parentMessage: PropTypes.object.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class TweetReply extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tweet: '',
      characterCount: this.getCharacterCount(
        this.getScreenName(props.parentMessage)
      )
    };

    this.replyTweet = this.replyTweet.bind(this);
    this.onTweetContentChange = this.onTweetContentChange.bind(this);
  }

  getCharacterCount(character) {
    const maxChar = 280;

    return maxChar - character.length;
  }

  onTweetContentChange(e) {
    const tweetContent = e.target.value;
    this.setState({
      tweet: tweetContent,
      characterCount: this.getCharacterCount(tweetContent)
    });
  }

  getScreenName(parentMessage, raw) {
    const twitterData =
      parentMessage.customer && parentMessage.customer.twitterData;
    const screenName =
      twitterData && (twitterData.screen_name || twitterData.screenName);

    if (raw) {
      return screenName;
    }

    return `@${screenName} `;
  }

  replyTweet(e) {
    e.preventDefault();

    const { parentMessage, replyTweet } = this.props;
    const twitterData = parentMessage.twitterData || {};
    const screenName = this.getScreenName(parentMessage, true);
    const tweetContent = this.state.tweet.replace(`@${screenName} `, '');

    const tweet = {
      conversationId: parentMessage.conversationId,
      content: tweetContent,
      tweetReplyToId: twitterData.id_str,
      tweetReplyToScreenName: screenName
    };

    replyTweet(tweet, error => {
      if (error) {
        return Alert.error(error.message);
      }
      this.context.closeModal();
    });
  }

  render() {
    const { parentMessage } = this.props;

    return (
      <form onSubmit={this.replyTweet}>
        <FormGroup>
          <TweetInfo>
            <ControlLabel>Twitter</ControlLabel>
            <Char count={this.state.characterCount}>
              {this.state.characterCount}
            </Char>
          </TweetInfo>

          <FormControl
            autoFocus
            componentClass="textarea"
            onChange={this.onTweetContentChange}
            defaultValue={this.getScreenName(parentMessage)}
            required
          />
        </FormGroup>

        <Footer>
          <Button
            btnStyle="simple"
            onClick={() => {
              this.context.closeModal();
            }}
            icon="close"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checkmark">
            Tweet
          </Button>
        </Footer>
      </form>
    );
  }
}

TweetReply.propTypes = propTypes;
TweetReply.contextTypes = contextTypes;

export default TweetReply;
