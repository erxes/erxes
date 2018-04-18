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
  replyTweet: PropTypes.func,
  tweet: PropTypes.func,
  retweet: PropTypes.func,
  parentMessage: PropTypes.object.isRequired,
  integrationId: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['reply', 'retweet', 'quote']).isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class ModalAction extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tweet: '',
      characterCount: this.getCharacterCount(this.getContent())
    };

    this.doAction = this.doAction.bind(this);
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

  getContent() {
    const { type, parentMessage } = this.props;

    if (type === 'reply') {
      return this.getScreenName(parentMessage);
    }

    if (type === 'quote') {
      return `RT ${this.getScreenName(parentMessage)}: ${
        parentMessage.content
      } `;
    }

    return parentMessage.content;
  }

  getScreenName(parentMessage, raw) {
    const twitterData = parentMessage.customer.twitterData;
    const screenName = twitterData && twitterData.screen_name;

    if (raw) {
      return screenName;
    }

    return `@${screenName} `;
  }

  doAction(e) {
    e.preventDefault();

    const {
      parentMessage,
      replyTweet,
      tweet,
      retweet,
      integrationId
    } = this.props;
    const twitterData = parentMessage.twitterData || {};
    const id = twitterData.id_str;

    if (replyTweet) {
      const screenName = this.getScreenName(parentMessage, true);
      const tweetContent = this.state.tweet.replace(`@${screenName} `, '');

      const replyData = {
        conversationId: parentMessage.conversationId,
        content: tweetContent,
        tweetReplyToId: id,
        tweetReplyToScreenName: screenName
      };

      return replyTweet(replyData, () => {
        this.context.closeModal();
      });
    }

    if (tweet) {
      const tweetData = {
        integrationId,
        text: this.state.tweet
      };
      return tweet(tweetData, () => {
        this.context.closeModal();
      });
    }

    const tweetData = {
      integrationId,
      id
    };

    return retweet(tweetData, () => {
      this.context.closeModal();
    });
  }

  render() {
    const { type } = this.props;

    return (
      <form onSubmit={this.doAction}>
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
            disabled={type === 'retweet'}
            onChange={this.onTweetContentChange}
            defaultValue={this.getContent()}
            required
          />
        </FormGroup>

        <Footer>
          <Button
            btnStyle="simple"
            onClick={() => {
              this.context.closeModal();
            }}
            icon="cancel-1"
          >
            Close
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Tweet
          </Button>
        </Footer>
      </form>
    );
  }
}

ModalAction.propTypes = propTypes;
ModalAction.contextTypes = contextTypes;

export default ModalAction;
