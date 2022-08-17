import React, { useState, useRef } from 'react';
import { EditorState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import 'draft-js-static-toolbar-plugin/lib/plugin.css';
import PostContentEditor from './PostContentEditor';

const PostForm: React.FC<{ post?: any }> = ({ post }) => {
  const [title, setTitle] = useState(post?.title || '');
  const [thumbnail, setThumbnail] = useState(post?.thumbnail || '');
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const preSubmit = () => {};

  return (
    <div>
      <form onSubmit={preSubmit}>
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

        <PostContentEditor />

        <button>Submit</button>
      </form>
    </div>
  );
};

export default PostForm;
