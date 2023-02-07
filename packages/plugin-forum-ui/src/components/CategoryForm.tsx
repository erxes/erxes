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
    postReadRequiresPermissionGroup?: boolean | null;
    postWriteRequiresPermissionGroup?: boolean | null;
    commentWriteRequiresPermissionGroup?: boolean | null;
    order?: number | null;
    description?: string | null;
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
  const [order, setOrder] = useState(category?.order || 0);
  const [description, setDescription] = useState(category?.description || '');

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

  const [
    postReadRequiresPermissionGroup,
    setPostReadRequiresPermissionGroup
  ] = useState(category?.postReadRequiresPermissionGroup || false);
  const [
    postWriteRequiresPermissionGroup,
    setPostWriteRequiresPermissionGroup
  ] = useState(category?.postWriteRequiresPermissionGroup || false);
  const [
    commentWriteRequiresPermissionGroup,
    setCommentWriteRequiresPermissionGroup
  ] = useState(category?.commentWriteRequiresPermissionGroup || false);

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
        postsReqCrmApproval,
        postReadRequiresPermissionGroup,
        postWriteRequiresPermissionGroup,
        commentWriteRequiresPermissionGroup,
        order,
        description
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
      <br />
      <label>
        Code:{' '}
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
        />
      </label>
      <br />
      {!noParent && (
        <>
          <label>
            Parent category:
            <CategoryParentSelect
              value={parentId}
              parentFor={category?._id}
              onChange={setParentId}
            />
          </label>
          <br />
        </>
      )}

      <label>
        Thumbnail url:
        <input
          type="text"
          value={thumbnail}
          onChange={e => setThumbnail(e.target.value)}
        />
      </label>
      <br />
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

      <br />

      <label htmlFor="forumCategoryDescription">Description:</label>
      <textarea
        id="forumCategoryDescription"
        cols={100}
        rows={5}
        value={description}
        onChange={e => {
          setDescription(e.target.value);
        }}
      />

      <br />

      <label>
        Order:
        <input
          type="number"
          value={order}
          onChange={e => {
            setOrder(Number(e.target.value));
          }}
        />
      </label>

      <br />
      <hr />
      <h3>User level based permissions</h3>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
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
                    onChange={e => {
                      const val = e.target.value;
                      if (val === 'GUEST') {
                        setPostReadRequiresPermissionGroup(false);
                      }
                      setUserLevelReqPostRead(val);
                    }}
                  >
                    {Object.keys(READ_CP_USER_LEVELS).map(enumVal => (
                      <option key={enumVal} value={enumVal}>
                        {enumVal}
                      </option>
                    ))}
                  </select>
                  <label style={{ marginLeft: 5 }}>
                    Also requires permission group{' '}
                    <input
                      disabled={userLevelReqPostRead === 'GUEST'}
                      type="checkbox"
                      checked={postReadRequiresPermissionGroup}
                      onChange={e => {
                        setPostReadRequiresPermissionGroup(e.target.checked);
                      }}
                    />
                  </label>
                </td>
              </tr>
              <tr>
                <td>Write:</td>
                <td>
                  <select
                    name="userLevelReqPostWrite"
                    value={userLevelReqPostWrite}
                    onChange={e => {
                      const val = e.target.value;

                      if (val === 'GUEST') {
                        setPostWriteRequiresPermissionGroup(false);
                      }

                      setUserLevelReqPostWrite(val);
                    }}
                  >
                    {Object.keys(WRITE_CP_USER_LEVELS).map(enumVal => (
                      <option key={enumVal} value={enumVal}>
                        {enumVal}
                      </option>
                    ))}
                  </select>

                  <label style={{ marginLeft: 5 }}>
                    Also requires permission group{' '}
                    <input
                      disabled={userLevelReqPostWrite === 'GUEST'}
                      type="checkbox"
                      checked={postWriteRequiresPermissionGroup}
                      onChange={e => {
                        setPostWriteRequiresPermissionGroup(e.target.checked);
                      }}
                    />
                  </label>
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
                    onChange={e => {
                      const val = e.target.value;
                      if (val === 'GUEST') {
                        setCommentWriteRequiresPermissionGroup(false);
                      }
                      setUserLevelReqCommentWrite(val);
                    }}
                  >
                    {Object.keys(WRITE_CP_USER_LEVELS).map(enumVal => (
                      <option key={enumVal} value={enumVal}>
                        {enumVal}
                      </option>
                    ))}
                  </select>
                  <label style={{ marginLeft: 5 }}>
                    Also requires permission group{' '}
                    <input
                      disabled={userLevelReqCommentWrite === 'GUEST'}
                      type="checkbox"
                      checked={commentWriteRequiresPermissionGroup}
                      onChange={e => {
                        setCommentWriteRequiresPermissionGroup(
                          e.target.checked
                        );
                      }}
                    />
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ color: '#004691', marginLeft: 20, padding: 20 }}>
          If "Also requires permission group" is <b>checked</b>, <b>both 2</b>{' '}
          conditions are required for a user to be able to perform the action.
          <br />
          If "Also requires permission group" is <b>unchecked</b>, only{' '}
          <b>one</b> of 2 conditions is required for a user to be able to
          perform the action.
          <div style={{ border: '1px solid #004691', margin: 10, padding: 10 }}>
            <h5>Conditions:</h5>
            <ol>
              <li>User level is high enough</li>
              <li>User is in a permission group that permits the action </li>
            </ol>
          </div>
        </div>
      </div>

      <input type="submit" value="Submit" />
    </form>
  );
};

export default CategoryForm;
