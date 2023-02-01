import React, { useState, useRef, useEffect } from 'react';
import PostContentEditor from './PostContentEditor';
import CategorySelect from '../containers/CategorySelect';
import { useQuery, useMutation } from 'react-apollo';
import gql from 'graphql-tag';

const QUERY_TAGS = gql`
  query Tags {
    tags(type: "forum:post") {
      _id
      colorCode
      name
    }
  }
`;
import PollOptions from './PollOptions';

const PostForm: React.FC<{ post?: any; onSubmit?: (any) => any }> = ({
  post,
  onSubmit
}) => {
  const tagsQuery = useQuery(QUERY_TAGS);

  const [title, setTitle] = useState(post?.title || '');
  const [thumbnail, setThumbnail] = useState(post?.thumbnail || '');
  const [categoryId, setCategoryId] = useState(post?.categoryId || '');
  const [description, setDescription] = useState(post?.description || '');
  const [isPollMultiChoice, setIsPollMultiChoice] = useState(
    post?.isPollMultiChoice || false
  );
  const [pollOptions, setPollOptions] = useState<any[]>([]);
  const [pollHasEndDate, setPollHasEndDate] = useState(!!post?.pollEndDate);
  const [pollEndDate, setPollEndDate] = useState(
    post?.pollEndDate
      ? new Date(post.pollEndDate).toISOString().slice(0, 19)
      : null
  );

  useEffect(() => {
    const initialOptions = post?.pollOptions || [];
    initialOptions.sort((a, b) => a.order - b.order);
    setPollOptions(initialOptions);
  }, []);

  const initialCheckedTagIds = {};
  post?.tagIds?.forEach(id => {
    initialCheckedTagIds[id] = true;
  });

  const [checkedTagIds, setCheckedTagIds] = useState(initialCheckedTagIds);

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
        tagIds: Object.entries(checkedTagIds)
          .filter(([_, checked]) => checked)
          .map(([id]) => id),
        pollOptions: optionsCleaned,
        isPollMultiChoice,
        pollEndDate: pollHasEndDate ? pollEndDate : null
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

        <div>
          <h5>Tags</h5>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {tagsQuery.data?.tags?.map(tag => (
              <div style={{ margin: 5 }} key={tag._id}>
                <input
                  checked={!!checkedTagIds[tag._id]}
                  onChange={e => {
                    const checked = e.target.checked;
                    setCheckedTagIds(prev => {
                      const next = { ...prev };
                      next[tag._id] = checked;
                      return next;
                    });
                  }}
                  type="checkbox"
                  id={`tcb-${tag._id}`}
                />{' '}
                <label
                  style={{ userSelect: 'none' }}
                  htmlFor={`tcb-${tag._id}`}
                >
                  {tag.name}
                </label>
              </div>
            ))}
          </div>
        </div>

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
          <label>
            Has end date:{' '}
            <input
              type="checkbox"
              checked={pollHasEndDate}
              onChange={e => {
                setPollHasEndDate(e.target.checked);
              }}
            />
          </label>
          {pollHasEndDate && (
            <>
              <br />
              <label>
                End date:{' '}
                <input
                  type="datetime-local"
                  value={pollEndDate || ''}
                  onChange={e => {
                    setPollEndDate(e.target.value);
                  }}
                />
              </label>
            </>
          )}
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
