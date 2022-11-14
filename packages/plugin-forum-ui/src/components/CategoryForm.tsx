import React, { useState } from 'react';
import CategoryParentSelect from '../containers/CategoryParentSelect';

type Props = {
  category?: {
    _id: string;
    name: string;
    code?: string | null;
    parentId?: string | null;
    thumbnail?: string | null;
    postsReqCrmApproval?: boolean | null;
    userLevelReqPostRead?: string | null;
    userLevelReqPostWrite?: string | null;
    userLevelReqCommentWrite?: string | null;
  };
  onSubmit?: (val: any) => any;
  noParent?: boolean;
};

/*
  userLevelReqPostRead: ReadCpUserLevels;
  userLevelReqPostWrite: WriteCpUserLevels;

  // userLevelReqCommentRead: ReadCpUserLevels;
  userLevelReqCommentWrite: WriteCpUserLevels;

  postsReqCrmApproval: boolean;*/

const READ_CP_USER_LEVELS = {
  GUEST: 0,
  REGISTERED: 1,
  SUBSCRIBED: 2,
  NO_ONE: 999
} as const;

const WRITE_CP_USER_LEVELS = {
  REGISTERED: 1,
  SUBSCRIBED: 2,
  NO_ONE: 999
} as const;

const dictToOptions = (dict: object) => {
  return (
    <>
      {Object.entries(dict).map(entry => (
        <option key={entry[1]} value={entry[1]}>
          {entry[0]}
        </option>
      ))}
    </>
  );
};

const CategoryForm: React.FC<Props> = ({
  category,
  noParent = false,
  onSubmit
}) => {
  const [name, setName] = useState(category?.name || '');
  const [code, setCode] = useState(category?.code || '');
  const [parentId, setParentId] = useState(category?.parentId || '');
  const [thumbnail, setThumbnail] = useState(category?.thumbnail || '');

  const [userLevelReqPostRead, setUserLevelReqPostRead] = useState(
    category?.userLevelReqPostRead || 'GUEST'
  );
  const [userLevelReqPostWrite, setUserLevelReqPostWrite] = useState(
    category?.userLevelReqPostWrite || 'REGISTERED'
  );
  const [userLevelReqCommentWrite, setUserLevelReqCommentWrite] = useState(
    category?.userLevelReqCommentWrite || 'REGISTERED'
  );
  const [postsReqCrmApproval, setPostsReqCrmApproval] = useState(
    category?.postsReqCrmApproval || false
  );

  const _onSubmit = e => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        name,
        code: code || null,
        parentId: parentId || null,
        thumbnail: thumbnail || null,
        userLevelReqPostRead,
        userLevelReqPostWrite,
        userLevelReqCommentWrite,
        postsReqCrmApproval
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
          <CategoryParentSelect
            value={parentId}
            parentFor={category?._id}
            onChange={setParentId}
          />
        </label>
      )}

      <label>
        Thumbnail url:
        <input
          type="text"
          value={thumbnail}
          onChange={e => setThumbnail(e.target.value)}
        />
      </label>

      <label>
        Posts in this category require admin approval
        <input
          type="checkbox"
          checked={postsReqCrmApproval}
          onChange={e => {
            setPostsReqCrmApproval(e.target.checked);
          }}
        />
      </label>

      <hr />
      <h3>User level based permissions</h3>

      <div style={{ display: 'flex' }}>
        <div style={{ border: '1px solid black', padding: 20 }}>
          <h4>Post</h4>

          <table>
            <tbody>
              <tr>
                <td>Read:</td>
                <td>
                  <select
                    name="userLevelReqPostRead"
                    value={userLevelReqPostRead}
                    onChange={e => setUserLevelReqPostRead(e.target.value)}
                  >
                    {Object.keys(READ_CP_USER_LEVELS).map(enumVal => (
                      <option key={enumVal} value={enumVal}>
                        {enumVal}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td>Write:</td>
                <td>
                  <select
                    name="userLevelReqPostWrite"
                    value={userLevelReqPostWrite}
                    onChange={e => setUserLevelReqPostWrite(e.target.value)}
                  >
                    {Object.keys(WRITE_CP_USER_LEVELS).map(enumVal => (
                      <option key={enumVal} value={enumVal}>
                        {enumVal}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ border: '1px solid black', marginLeft: 20, padding: 20 }}>
          <h4>Comment</h4>

          <table>
            <tbody>
              <tr>
                <td>Read:</td>
                <td>Guest</td>
              </tr>
              <tr>
                <td>Write:</td>
                <td>
                  <select
                    name="userLevelReqCommentWrite"
                    value={userLevelReqCommentWrite}
                    onChange={e => setUserLevelReqCommentWrite(e.target.value)}
                  >
                    {Object.keys(WRITE_CP_USER_LEVELS).map(enumVal => (
                      <option key={enumVal} value={enumVal}>
                        {enumVal}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <input type="submit" value="Submit" />
    </form>
  );
};

export default CategoryForm;
