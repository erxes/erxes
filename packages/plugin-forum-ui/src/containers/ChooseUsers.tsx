import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import { Modal } from 'react-bootstrap';

type Props = {
  show?: boolean;
  excludeIds?: string[];
  onChoose: (ids: string[]) => any;
};

const QUERY = gql`
  query ClientPortalUsers($ids: [String], $searchValue: String) {
    clientPortalUsers(ids: $ids, excludeIds: true, searchValue: $searchValue) {
      _id
      email
      username
      type
    }
  }
`;

const ChooseUsers: React.FC<Props> = ({ excludeIds, onChoose, show }) => {
  const [inputValue, setInputValue] = useState('');
  const [checkedIds, setCheckedIds] = useState({});

  const { data, loading, error, refetch } = useQuery(QUERY, {
    fetchPolicy: 'network-only',
    variables: {
      ids: excludeIds,
      searchValue: ''
    }
  });

  const search = e => {
    e.preventDefault();
    refetch({
      ids: excludeIds,
      searchValue: inputValue
    });
  };

  const onChooseClick = () => {
    const ids = Object.keys(checkedIds);
    setCheckedIds({});
    onChoose(ids || []);
  };

  if (loading) return null;
  if (error) {
    alert(JSON.stringify(error, null, 2));
    return null;
  }

  const clientPortalUsers = data.clientPortalUsers || [];

  return (
    <Modal size={'xl'} show={show} enforceFocus centered>
      <Modal.Body>
        <form onSubmit={search}>
          <input
            type="text"
            placeholder="Search..."
            value={inputValue}
            onChange={e => {
              setInputValue(e.target.value);
            }}
          />
          <button type="submit">Search</button>
        </form>

        {!clientPortalUsers?.length && <div>Nothing to select</div>}

        {clientPortalUsers && (
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Email</th>
                <th>Username</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {clientPortalUsers.map(c => (
                <tr key={c._id}>
                  <td>
                    <input
                      id={`check${c._id}`}
                      type="checkbox"
                      name="cpUserId"
                      value={c._id}
                      checked={!!checkedIds[c._id]}
                      onChange={e => {
                        const checked = e.target.checked;
                        setCheckedIds(prev => ({
                          ...prev,
                          [c._id]: checked
                        }));
                      }}
                    />
                  </td>
                  <td>
                    <label htmlFor={`check${c._id}`}>{c.email}</label>
                  </td>
                  <td>{c.username}</td>
                  <td>{c.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          type="button"
          onClick={() => {
            setCheckedIds({});
            onChoose([]);
          }}
        >
          Cancel
        </button>
        <button type="button" onClick={onChooseClick}>
          Choose
        </button>
      </Modal.Body>
    </Modal>
  );
};

export default ChooseUsers;
