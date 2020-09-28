import { getEnv } from 'apolloClient';
import CKEditor from 'ckeditor4-react';
import { colors } from 'modules/common/styles';
import React from 'react';
import { IEditorProps } from '../types';

const { REACT_APP_API_URL } = getEnv();

export const getMentionedUserIds = (content: string) => {
  const re = new RegExp('<a[^>]* mentioned-user-id="([^"]*)"', 'g');

  const mentionedUserIds: string[] = (content.match(re) || []).map(m =>
    m.replace(re, '$1')
  );

  return mentionedUserIds.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
};

class EditorCK extends React.Component<IEditorProps, { content: string }> {
  constructor(props: IEditorProps) {
    super(props);

    this.state = {
      content: props.content
    };

    CKEditor.editorUrl = '/ckeditor/ckeditor.js';
    this.onChange = this.onChange.bind(this);
    this.onEnter = this.onEnter.bind(this);
  }

  componentDidMount() {
    const name = this.props.name;

    if (name) {
      const content = localStorage.getItem(name);

      if (content && content !== this.props.content) {
        this.setState({ content });

        this.props.onChange({
          editor: {
            getData: () => content
          }
        });
      }
    }
  }

  componentWillUnmount() {
    const name = this.props.name;

    if (name) {
      localStorage.removeItem(name);
    }
  }

  shouldComponentUpdate(nextProps: IEditorProps) {
    const { content, name } = nextProps;

    if (
      (!content || content === '') &&
      this.state.content &&
      !(name && localStorage.getItem(name))
    ) {
      // clear previous content
      this.setState({ content: '' });

      return false;
    }

    return true;
  }

  onChange(event: any) {
    const name = this.props.name;
    this.props.onChange(event);

    if (name) {
      const content = event.editor.getData();

      this.setState({ content });
      localStorage.setItem(name, content);
    }
  }

  onEnter(event: any) {
    const { name, onCtrlEnter } = this.props;

    if (name) {
      localStorage.removeItem(name);
      this.setState({ content: '' });
    }

    if (onCtrlEnter) {
      onCtrlEnter(event);
    }
  }

  render() {
    const {
      height,
      insertItems,
      removeButtons,
      removePlugins,
      toolbar,
      toolbarCanCollapse,
      mentionUsers = [],
      autoFocus,
      autoGrow,
      autoGrowMinHeight = 180,
      autoGrowMaxHeight,
      toolbarLocation = 'top'
    } = this.props;

    const mentionDataFeed = (opts, callback) => {
      if (mentionUsers.length <= 1) {
        return;
      }

      const matchProperty = 'fullName';
      const query = opts.query.toLowerCase();

      const data = mentionUsers.filter(
        item => item[matchProperty].toLowerCase().indexOf(query) >= 0
      );

      callback(data);
    };

    return (
      <CKEditor
        data={this.state.content}
        onChange={this.onChange}
        config={{
          height,
          startupFocus: autoFocus,
          uiColor: colors.bgLight,
          dialog_backgroundCoverColor: '#30435C',
          allowedContent: true,
          toolbarLocation,
          extraPlugins: `codemirror,strinsert,onCtrlEnter${
            autoGrow ? ',autogrow' : ''
          }`,
          autoGrow_minHeight: autoGrowMinHeight,
          autoGrow_maxHeight: autoGrowMaxHeight,
          autoGrow_onStartup: true,
          strinsert: insertItems,
          autoGrowOnStartup: true,
          toolbar: toolbar || [
            {
              name: 'document',
              groups: ['mode', 'document', 'doctools'],
              items: ['Source', 'NewPage']
            },
            { name: 'colors', items: ['TextColor', 'BGColor'] },
            {
              name: 'basicstyles',
              items: [
                'Bold',
                'Italic',
                'Underline',
                'Strike',
                '-',
                'Image',
                'Table',
                'EmojiPanel'
              ]
            },
            {
              name: 'paragraph',
              groups: ['list', 'indent', 'blocks', 'align', 'bidi'],
              items: [
                'NumberedList',
                'BulletedList',
                'Blockquote',
                'JustifyLeft',
                'JustifyCenter',
                'JustifyRight',
                'JustifyBlock'
              ]
            },
            { name: 'links', items: ['Link', 'Unlink'] },
            { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
            { name: 'others', items: [insertItems && 'strinsert'] },
            { name: 'clear', items: ['RemoveFormat'] },
            { name: 'tools', items: ['Maximize'] }
          ],
          mentions: [
            {
              feed: mentionDataFeed,
              itemTemplate:
                '<li data-id="{id}">' +
                '<img class="editor-avatar" src="{avatar}"' +
                '<strong>{fullName}</strong>' +
                '</li>',
              outputTemplate:
                '<a mentioned-user-id="{id}">@{fullName}</a><span>&nbsp;</span>',
              minChars: 0
            }
          ],
          removeButtons,
          removePlugins,
          codemirror: {
            enableCodeFormatting: false,
            enableCodeFolding: false,
            showSearchButton: false,
            showCommentButton: false,
            showUncommentButton: false,
            showFormatButton: false
          },
          onCtrlEnter: this.onEnter,
          toolbarCanCollapse,
          filebrowserImageUploadUrl: `${REACT_APP_API_URL}/upload-file`
        }}
      />
    );
  }
}

export default EditorCK;
