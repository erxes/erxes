import React, { useState, useRef } from 'react';
import PostContentEditor from './PostContentEditor';
import CategorySelect from '../containers/CategorySelect';
import PollOptions from './PollOptions';

const PostForm: React.FC<{ post?: any; onSubmit?: (any) => any }> = ({
  post,
  onSubmit
}) => {
  const [title, setTitle] = useState(post?.title || '');
  const [thumbnail, setThumbnail] = useState(post?.thumbnail || '');
  const [categoryId, setCategoryId] = useState(post?.categoryId || '');
  const [description, setDescription] = useState(post?.description || '');

  const initialPollOptionsById = {};
  post?.pollOptions?.forEach(option => {
    initialPollOptionsById[option._id] = option;
  });

  const [pollOptionsById, setPollOptionsById] = useState(
    initialPollOptionsById
  );

  const pollOptions: any[] = Object.values(pollOptionsById);
  pollOptions.sort((a: any, b: any) => a.order - b.order);

  const editorRef = useRef<any>(null);
  const preSubmit = e => {
    e.preventDefault();
    const content = editorRef.current?.editor?.getData();

    const optionsCleaned = pollOptions.map(option => {
      if (option.isNew) {
        const { _id, ...rest } = option;
        return rest;
      } else {
        return option;
      }
    });
    if (onSubmit) {
      onSubmit({
        title,
        thumbnail,
        content,
        categoryId,
        description,
        pollOptions: optionsCleaned
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

        <label htmlFor="forumFormDescription">Description: </label>
        <textarea
          id="forumFormDescription"
          value={description}
          onChange={e => setDescription(e.target.value)}
          cols={100}
          rows={10}
        />

        <br />

        <div style={{ margin: 20, padding: 20 }}>
          Poll options:
          <PollOptions
            options={pollOptions}
            onChange={(_id, title, order) => {
              setPollOptionsById(prev => ({
                ...prev,
                [_id]: {
                  _id,
                  title,
                  order
                }
              }));
            }}
            onAdd={() => {
              const newPollOption = {
                _id: Math.random()
                  .toString(36)
                  .slice(2),
                title: '',
                order: pollOptions[pollOptions.length - 1]?.order + 1 || 0,
                isNew: true
              };
              setPollOptionsById(prev => ({
                ...prev,
                [newPollOption._id]: newPollOption
              }));
            }}
            onRemove={_id => {
              setPollOptionsById((prev: any) => {
                const { [_id]: _, ...rest } = prev;
                return rest;
              });
            }}
          />
        </div>

        <button>Submit</button>
      </form>
    </div>
  );
};

export default PostForm;
