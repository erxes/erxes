import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { colors } from 'modules/common/styles';
import * as React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { IAddMessage } from '../../../../../containers/conversationDetail/WorkArea';
import { IMessage } from '../../../../../types';

const Footer = styled.div`
  text-align: right;
`;

const TweetInfo = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Char = styledTS<{ count?: number }>(styled.b)`
  color: ${props => props.count && props.count < 0 && colors.colorCoreRed};
`;

type Props = {
  replyTweet?: (data: IAddMessage, callback: () => void) => void;
  tweet?: (
    data: {
      integrationId: string;
      text: string;
    },
    callback: () => void
  ) => void;
  retweet?: (
    data: {
      integrationId: string;
      id: string;
    },
    callback: () => void
  ) => void;
  parentMessage: IMessage;
  integrationId: string;
  type: string;
  closeModal: () => void;
};

type State = {
  tweet: string;
  characterCount: number;
};

class ModalAction extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      tweet: '',
      characterCount: this.getCharacterCount(this.getContent())
    };
  }

  getCharacterCount(character?: string) {
    const maxChar = 280;

    if (!character) {
      return maxChar;
    }

    return maxChar - character.length;
  }

  onTweetContentChange = (e: React.FormEvent<HTMLElement>) => {
    const tweetContent = (e.target as HTMLInputElement).value;
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

  getScreenName(parentMessage: IMessage, raw?: boolean) {
    const twitterData =
      parentMessage.customer && parentMessage.customer.twitterData;
    const screenName = twitterData && twitterData.screen_name;

    if (raw) {
      return screenName;
    }

    return `@${screenName} `;
  }

  doAction = (e: React.FormEvent) => {
    e.preventDefault();

    const {
      parentMessage,
      replyTweet,
      tweet,
      retweet,
      integrationId
    } = this.props;
    const twitterData = parentMessage.twitterData;

    if (!twitterData) {
      return null;
    }

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
        this.props.closeModal();
      });
    }

    if (tweet) {
      const tweetData = {
        integrationId,
        text: this.state.tweet
      };
      return tweet(tweetData, () => {
        this.props.closeModal();
      });
    }

    const retweetData = {
      integrationId,
      id
    };

    return (
      retweet &&
      retweet(retweetData, () => {
        this.props.closeModal();
      })
    );
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
            autoFocus={true}
            componentClass="textarea"
            disabled={type === 'retweet'}
            onChange={this.onTweetContentChange}
            defaultValue={this.getContent()}
            required={true}
          />
        </FormGroup>

        <Footer>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
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

export default ModalAction;
