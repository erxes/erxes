import React, { useState, useRef } from 'react';
import PostContentEditor from './PostContentEditor';
import CategorySelect from '../containers/CategorySelect';

const PostForm: React.FC<{ post?: any; onSubmit?: (any) => any }> = ({
  post,
  onSubmit
}) => {
  const [title, setTitle] = useState(post?.title || '');
  const [thumbnail, setThumbnail] = useState(post?.thumbnail || '');
  const [categoryId, setCategoryId] = useState(post?.categoryId || '');

  const editorRef = useRef<any>(null);
  const preSubmit = e => {
    e.preventDefault();
    const content = editorRef.current?.editor?.getData();
    if (onSubmit) {
      onSubmit({
        title,
        thumbnail,
        content,
        categoryId: categoryId || null
      });
    }
  };

  return (
    <div>
      <form onSubmit={preSubmit}>
        <label>
          Category:
          <CategorySelect value={categoryId} onChange={setCategoryId} />
        </label>

        <input
          value={title}
          placeholder="Title of your post"
          type="text"
          name="title"
          onChange={e => setTitle(e.target.value)}
        />
        <input
          value={thumbnail}
          placeholder="Thumbnail url of your post"
          type="text"
          name="thumbnail"
          onChange={e => setThumbnail(e.target.value)}
        />

        <PostContentEditor editorRef={editorRef} data={post?.content} />

        <button>Submit</button>
      </form>
    </div>
  );
};

export default PostForm;
