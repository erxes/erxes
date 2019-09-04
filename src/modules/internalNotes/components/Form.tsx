import Button from 'modules/common/components/Button';
import { ImportLoader } from 'modules/common/components/ButtonMutate';
import { getMentionedUserIds } from 'modules/common/components/EditorCK';
import EditorCK from 'modules/common/containers/EditorCK';
import React from 'react';
import styled from 'styled-components';

export const EditorActions = styled.div`
  padding: 10px 15px 40px 20px;
  text-align: right;
`;

const EditorWrapper = styled.div`
  position: relative;

  > .cke_chrome {
    border-bottom: 0;
  }

  .cke_bottom {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
  }
`;

type Prop = {
  create: (content: string, mentionedUserIds, callback: () => void) => void;
  isActionLoading: boolean;
};

type State = {
  content: string;
};

class Form extends React.PureComponent<Prop, State> {
  constructor(props) {
    super(props);

    this.state = {
      content: ''
    };
  }

  clearContent = () => {
    this.setState({ content: '' });
  };

  onSend = () => {
    const { content } = this.state;

    const mentionedUserIds = getMentionedUserIds(content);

    this.props.create(content, mentionedUserIds, () => {
      this.clearContent();
    });
  };

  renderFooter() {
    const { isActionLoading } = this.props;

    if (!this.state.content) {
      return null;
    }

    return (
      <EditorActions>
        <Button
          onClick={this.clearContent}
          btnStyle="warning"
          size="small"
          icon="eraser-1"
        >
          Discard
        </Button>

        <Button
          disabled={isActionLoading}
          onClick={this.onSend}
          btnStyle="success"
          size="small"
          icon={isActionLoading ? undefined : 'send'}
        >
          {isActionLoading && <ImportLoader />}
          Save
        </Button>
      </EditorActions>
    );
  }

  onEditorChange = e => {
    this.setState({
      content: e.editor.getData()
    });
  };

  render() {
    return (
      <EditorWrapper>
        <EditorCK
          showMentions={true}
          content={this.state.content}
          onChange={this.onEditorChange}
          height={150}
          toolbar={[
            { name: 'insert', items: ['Image', 'EmojiPanel'] },
            { name: 'paragraph', items: ['NumberedList', 'BulletedList'] },
            { name: 'basicstyles', items: ['Bold', 'Italic'] },
            { name: 'links', items: ['Link', 'Unlink'] }
          ]}
          toolbarCanCollapse={true}
        />

        {this.renderFooter()}
      </EditorWrapper>
    );
  }
}

export default Form;
