import { getEnv } from 'apolloClient';
import CKEditor from 'ckeditor4-react';
import { IUser } from 'modules/auth/types';
import { colors } from 'modules/common/styles';
import React from 'react';

CKEditor.editorUrl = '/ckeditor/ckeditor.js';

type Props = {
  content: string;
  onChange: (evt: any) => void;
  height?: number | string;
  insertItems?: any;
  removeButtons?: string;
  toolbarCanCollapse?: boolean;
  users?: IUser[];
};

const { REACT_APP_API_URL } = getEnv();

let usersMentions: any = [];

function EditorCK({
  content,
  onChange,
  height,
  insertItems,
  removeButtons,
  toolbarCanCollapse,
  users
}: Props) {
  usersMentions = [];

  if (users) {
    for (const user of users) {
      if (user.details && user.details.fullName) {
        usersMentions.push({
          id: user._id,
          avatar: user.details.avatar || '/images/avatar.svg',
          fullName: user.details.fullName
        });
      }
    }
  }

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
        mentions: [
          {
            feed: dataFeed,
            itemTemplate:
              '<li data-id="{id}">' +
              '<img class="editor-avatar" src="{avatar}"' +
              '<strong>{fullName}</strong>' +
              '</li>',
            outputTemplate: '<a id="{id}">@{fullName}</a><span>&nbsp;</span>',
            minChars: 0
          }
        ],
        removeButtons,
        codemirror: {
          enableCodeFormatting: false,
          enableCodeFolding: false,
          showSearchButton: false,
          showCommentButton: false,
          showUncommentButton: false,
          showFormatButton: false
        },
        toolbarCanCollapse,
        filebrowserImageUploadUrl: `${REACT_APP_API_URL}/upload-file`
      }}
    />
  );
}

export default EditorCK;

function dataFeed(opts, callback) {
  if (usersMentions.length > 1) {
    const matchProperty = 'fullName';
    let data = usersMentions.filter(item => {
      return item[matchProperty].indexOf(opts.query.toLowerCase()) === 0;
    });

    data = usersMentions.sort((a, b) => {
      return a[matchProperty].localeCompare(b[matchProperty], undefined, {
        sensitivity: 'accent'
      });
    });

    callback(data);
  }
}
