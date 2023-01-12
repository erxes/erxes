import React, { useState, useRef, useEffect } from 'react';
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
  const [isPollMultiChoice, setIsPollMultiChoice] = useState(
    post?.isPollMultiChoice || false
  );
  const [pollOptions, setPollOptions] = useState<any[]>([]);

  useEffect(() => {
    const initialOptions = post?.pollOptions || [];
    initialOptions.sort((a, b) => a.order - b.order);
    setPollOptions(initialOptions);
  }, []);

  const editorRef = useRef<any>(null);
  const preSubmit = e => {
    e.preventDefault();
    const content = editorRef.current?.editor?.getData();

    const optionsCleaned = pollOptions.map(({ _id, isNew, title, order }) => {
      const option: any = {
        title,
        order
      };
      if (!isNew) {
        option._id = _id;
      }
      return option;
    });
    if (onSubmit) {
      onSubmit({
        title,
        thumbnail,
        content,
        categoryId,
        description,
        pollOptions: optionsCleaned,
        isPollMultiChoice
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
          <h4>Poll:</h4>
          <label>
            Multiple choice{' '}
            <input
              type="checkbox"
              checked={isPollMultiChoice}
              onChange={e => setIsPollMultiChoice(e.target.checked)}
            />
          </label>
          <br />
          <h5>Options:</h5>
          <PollOptions
            options={pollOptions}
            onChange={(_id, title, order) => {
              setPollOptions(prev => {
                const next = prev.map(o => {
                  if (o._id === _id) {
                    return {
                      ...o,
                      title,
                      order
                    };
                  } else {
                    return o;
                  }
                });

                next.sort((a, b) => a.order - b.order);
                return next;
              });
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
              setPollOptions(prev =>
                [...prev, newPollOption].sort((a, b) => a.order - b.order)
              );
            }}
            onRemove={_id => {
              setPollOptions(prev => prev.filter(o => o._id !== _id));
            }}
          />
        </div>

        <button>Submit</button>
      </form>
    </div>
  );
};

export default PostForm;
