import React, { useState, useRef } from 'react';
import EditorCK from '@erxes/ui/src/containers/EditorCK';
import CKEditor from 'ckeditor4-react';

const PostForm: React.FC<{ post?: any }> = ({ post }) => {
  const [title, setTitle] = useState(post?.title || '');
  const [thumbnail, setThumbnail] = useState(post?.thumbnail || '');
  const editorInstance = useRef(null);

  const asdf = (
    <p>This is a CKEditor 4 WYSIWYG editor instance created by ️⚛️ React.</p>
  );

  return (
    <div>
      <input
        value={title}
        placeholder="Title of your post"
        type="text"
        name="title"
        onChange={e => setTitle(e.target.value)}
      />
      <input
        value={thumbnail}
        placeholder="Thumbnail of your post"
        type="text"
        name="thumbnail"
        onChange={e => setThumbnail(e.target.value)}
      />

      <EditorCK
        content="<p>asdfasdf</p>"
        onChange={e => console.log(e.editor.getData())}
      />

      {/* <CKEditor data="<p>This is a CKEditor 4 WYSIWYG editor instance created by ️⚛️ React.</p>" onInit={(e) => (editorInstance.current = e.editor)} /> */}
    </div>
  );
};

export default PostForm;
