import { getEnv } from 'apolloClient';
import CKEditor from 'ckeditor4-react';
import { colors } from 'modules/common/styles';
import React from 'react';

CKEditor.editorUrl = '/ckeditor/ckeditor.js';

type Props = {
  content: string;
  onChange: (evt: any) => void;
  height?: number | string;
  insertItems?: any;
};

const { REACT_APP_API_URL } = getEnv();

function EditorCK({ content, onChange, height, insertItems }: Props) {
  return (
    <CKEditor
      data={content}
      onChange={onChange}
      config={{
        height,
        uiColor: colors.bgLight,
        dialog_backgroundCoverColor: '#30435C',
        allowedContent: true,
        extraPlugins: 'codemirror,strinsert',
        strinsert: insertItems,
        autoGrowOnStartup: true,
        toolbar: [
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
        codemirror: {
          enableCodeFormatting: false,
          enableCodeFolding: false,
          showSearchButton: false,
          showCommentButton: false,
          showUncommentButton: false,
          showFormatButton: false
        },
        filebrowserImageUploadUrl: `${REACT_APP_API_URL}/upload-file`
      }}
    />
  );
}

export default EditorCK;
