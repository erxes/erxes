import React, { useState } from 'react';
import CategorySelect from '../containers/CategorySelect';

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

const Form: React.FC<Props> = ({ category, noParent = false, onSubmit }) => {
  const [name, setName] = useState(category?.name || '');
  const [code, setCode] = useState(category?.code || '');
  const [parentId, setParentId] = useState(category?.parentId || '');
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
            except={category ? category?._id : undefined}
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

export default Form;
