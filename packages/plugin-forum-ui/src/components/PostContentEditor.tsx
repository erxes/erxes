import React, { useState, useRef } from 'react';
import CKEditor from 'ckeditor4-react';
import { publicUrl } from '@erxes/ui/src/utils/core';

CKEditor.editorUrl = publicUrl('/ckeditor/ckeditor.js');

const PostContentEditor: React.FC<{
  editorRef?: React.MutableRefObject<any>;
}> = ({ editorRef }) => {
  return (
    <div>
      <CKEditor
        ref={editorRef}
        data="<p>This is a CKEditor 4 WYSIWYG editor instance created by ️⚛️ React.</p>"
      />
      ,
    </div>
  );
};

export default PostContentEditor;
