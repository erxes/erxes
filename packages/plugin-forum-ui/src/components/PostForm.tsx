import React, { useState, useRef } from 'react';
import PostContentEditor from './PostContentEditor';

const PostForm: React.FC<{ post?: any }> = ({ post }) => {
  const [title, setTitle] = useState(post?.title || '');
  const [thumbnail, setThumbnail] = useState(post?.thumbnail || '');
  const editorRef = useRef<any>(null);
  const preSubmit = e => {
    e.preventDefault();
    console.log(editorRef.current?.editor?.getData());
  };

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

        <PostContentEditor editorRef={editorRef} />

        <button>Submit</button>
      </form>
    </div>
  );
};

export default PostForm;
