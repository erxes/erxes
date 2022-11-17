import React, { useState, useRef } from 'react';
import PostContentEditor from './PostContentEditor';

const PageForm: React.FC<{ page?: any; onSubmit?: (any) => any }> = ({
  page,
  onSubmit
}) => {
  const [code, setCode] = useState(page?.code || '');
  const [title, setTitle] = useState(page?.title || '');
  const [thumbnail, setThumbnail] = useState(page?.thumbnail || '');
  const [listOrder, setListOrder] = useState(page?.listOrder || 0);
  const [description, setDescription] = useState(page?.description || '');

  const editorRef = useRef<any>(null);
  const preSubmit = e => {
    e.preventDefault();
    const content = editorRef.current?.editor?.getData();
    if (onSubmit) {
      onSubmit({
        code,
        title,
        thumbnail,
        content,
        listOrder,
        description
      });
    }
  };

  return (
    <div>
      <form onSubmit={preSubmit}>
        <input
          value={code}
          placeholder="Code of your page"
          type="text"
          name="code"
          onChange={e => setCode(e.target.value)}
        />

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

        <br />

        <label htmlFor="listOrder">List order:</label>

        <input
          type="number"
          name="listOrder"
          placeholder="0"
          onChange={e => setListOrder(Number(e.target.value))}
        />

        <br />

        <PostContentEditor editorRef={editorRef} data={page?.content} />

        <textarea
          value={description}
          name="description"
          placeholder="description"
          onChange={e => setDescription(e.target.value)}
          cols={200}
          rows={10}
        />

        <button>Submit</button>
      </form>
    </div>
  );
};

export default PageForm;
