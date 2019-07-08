import Button from 'modules/common/components/Button';
import { getMentionedUserIds } from 'modules/common/components/EditorCK';
import EditorCK from 'modules/common/containers/EditorCK';
import { colors } from 'modules/common/styles';
import React from 'react';
import styled from 'styled-components';

export const EditorActions = styled.div`
  padding: 0 15px 40px 20px;
  position: absolute;
  color: ${colors.colorCoreGray};
  bottom: 0;
  right: 0;
`;

const EditorWrapper = styled.div`
  position: relative;
`;

type Prop = {
  create: (content: string, mentionedUserIds, callback: () => void) => void;
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
          onClick={this.onSend}
          btnStyle="success"
          size="small"
          icon="send"
        >
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
          removeButtons="Source,NewPage,Preview,Indent,Outdent,CreateDiv,Anchor,Styles,Font,Maximize,Strike,Table"
          toolbarCanCollapse={true}
        />

        {this.renderFooter()}
      </EditorWrapper>
    );
  }
}

export default Form;
