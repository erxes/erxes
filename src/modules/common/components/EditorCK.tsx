import { getEnv } from 'apolloClient';
import CKEditor from 'ckeditor4-react';
import { colors } from 'modules/common/styles';
import React from 'react';
import { IEditorProps } from '../types';

const { REACT_APP_API_URL } = getEnv();

export const getMentionedUserIds = (content: string) => {
  const re = new RegExp('mentioned-user-id="(?<name>.+?)"', 'g');
  const mentionedUserIds: string[] = (content.match(re) || []).map(m =>
    m.replace(re, '$1')
  );

  return mentionedUserIds.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
};

class EditorCK extends React.Component<IEditorProps> {
  constructor(props: IEditorProps) {
    super(props);

    CKEditor.editorUrl = '/ckeditor/ckeditor.js';
  }
  render() {
    const {
      onCtrlEnter,
      content,
      onChange,
      height,
      insertItems,
      removeButtons,
      removePlugins,
      toolbar,
      toolbarCanCollapse,
      mentionUsers = [],
      autoFocus
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
        data={content}
        onChange={onChange}
        config={{
          height,
          startupFocus: autoFocus,
          uiColor: colors.bgLight,
          dialog_backgroundCoverColor: '#30435C',
          allowedContent: true,
          extraPlugins: 'codemirror,strinsert,onCtrlEnter',
          strinsert: insertItems,
          autoGrowOnStartup: true,
          toolbar: toolbar || [
            {
              name: 'document',
              groups: ['mode', 'document', 'doctools'],
              items: ['Source', 'NewPage', 'Preview']
            },
            {
              name: 'insert',
              items: [
                'Image',
                'Table',
                'HorizontalRule',
                'EmojiPanel',
                'SpecialChar'
              ]
            },
            {
              name: 'paragraph',
              groups: ['list', 'indent', 'blocks', 'align', 'bidi'],
              items: [
                'NumberedList',
                'BulletedList',
                'Outdent',
                'Indent',
                'Blockquote',
                'CreateDiv',
                'JustifyLeft',
                'JustifyCenter',
                'JustifyRight',
                'JustifyBlock'
              ]
            },
            {
              name: 'basicstyles',
              groups: ['basicstyles', 'cleanup'],
              items: ['Bold', 'Italic', 'Underline', 'Strike', 'RemoveFormat']
            },
            { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
            { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
            { name: 'others', items: [insertItems ? 'strinsert' : '-'] },
            { name: 'colors', items: ['TextColor', 'BGColor'] },
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
          onCtrlEnter,
          toolbarCanCollapse,
          filebrowserImageUploadUrl: `${REACT_APP_API_URL}/upload-file`
        }}
      />
    );
  }
}

export default EditorCK;
