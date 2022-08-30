import React, { useState, useRef } from 'react';
import CKEditor from 'ckeditor4-react';
import { publicUrl } from '@erxes/ui/src/utils/core';

CKEditor.editorUrl = publicUrl('/ckeditor/ckeditor.js');

const PostContentEditor: React.FC<{
  editorRef?: React.MutableRefObject<any>;
  data?: string;
}> = ({ editorRef, data }) => {
  return (
    <div>
      <CKEditor ref={editorRef} data={data} />,
    </div>
  );
};

export default PostContentEditor;
