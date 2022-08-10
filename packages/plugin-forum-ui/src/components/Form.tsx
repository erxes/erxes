import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

type Props = {
  category?: {
    _id: string;
    name: string;
    code?: string | null;
    parentId?: string | null;
    thumbnail?: string | null;
  };
  onSubmit?: (val: any) => any;
  noParent?: boolean;
};

const allCategories = gql`
  query ForumCategoriesAll {
    forumCategories {
      _id
      code
      name
    }
  }
`;

const Form: React.FC<Props> = ({ category, noParent = false, onSubmit }) => {
  const [name, setName] = useState(category?.name || '');
  const [code, setCode] = useState(category?.code || '');
  const [parentId, setParentId] = useState(
    noParent ? '' : category?.parentId || ''
  );
  const [thumbnail, setThumbnail] = useState(category?.thumbnail || '');

  const _onSubmit = e => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        name,
        code: code || null,
        parentId: parentId || null,
        thumbnail: thumbnail || null
      });
    }
  };

  return (
    <form onSubmit={_onSubmit}>
      <label>
        Name:{' '}
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </label>

      <label>
        Code:{' '}
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
        />
      </label>

      {!noParent && (
        <label>
          Parent category:
          <CategorySelect
            value={parentId}
            except={category ? [category?._id] : undefined}
            onChange={setParentId}
          />
        </label>
      )}

      <label>
        Thumbnail url:{' '}
        <input
          type="text"
          value={thumbnail}
          onChange={e => setThumbnail(e.target.value)}
        />
      </label>

      <input type="submit" value="Submit" />
    </form>
  );
};

const CategorySelect: React.FC<{
  value: string;
  except?: string[];
  onChange: (any) => any;
}> = ({ value, except, onChange }) => {
  const { data, loading, error } = useQuery(allCategories);

  if (loading) return null;
  if (error) <pre>{JSON.stringify(data, null, 2)}</pre>;

  const possibleParents = !except?.length
    ? data.forumCategories
    : data.forumCategories.filter(c => !except.includes(c._id));

  return (
    <select value={value} onChange={e => onChange && onChange(e.target.value)}>
      <option value="">No parent (root category)</option>
      {possibleParents.map(p => (
        <option value={p._id}>{p.name}</option>
      ))}
    </select>
  );
};

export default Form;
