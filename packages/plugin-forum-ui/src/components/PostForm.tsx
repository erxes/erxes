import React, { useState, useRef } from 'react';
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

const PostForm: React.FC<{ post?: any; onSubmit?: (any) => any }> = ({
  post,
  onSubmit
}) => {
  const tagsQuery = useQuery(QUERY_TAGS);

  const [title, setTitle] = useState(post?.title || '');
  const [thumbnail, setThumbnail] = useState(post?.thumbnail || '');
  const [categoryId, setCategoryId] = useState(post?.categoryId || '');
  const [description, setDescription] = useState(post?.description || '');

  const initialCheckedTagIds = {};
  post?.tagIds?.forEach(id => {
    initialCheckedTagIds[id] = true;
  });

  const [checkedTagIds, setCheckedTagIds] = useState(initialCheckedTagIds);

  const editorRef = useRef<any>(null);
  const preSubmit = e => {
    e.preventDefault();
    const content = editorRef.current?.editor?.getData();
    if (onSubmit) {
      onSubmit({
        title,
        thumbnail,
        content,
        categoryId,
        description,
        tagIds: Object.entries(checkedTagIds)
          .filter(([_, checked]) => checked)
          .map(([id]) => id)
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

        <button>Submit</button>
      </form>
    </div>
  );
};

export default PostForm;
