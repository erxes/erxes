import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';
import { Modal } from 'react-bootstrap';

type Props = {
  show?: boolean;
  excludeIds?: string[];
  onChoose: (ids: string[]) => any;
};

const QUERY = gql`
  query ForumCategories($not__id: [ID!]) {
    forumCategories(not__id: $not__id) {
      _id
      name
    }
  }
`;

const ChooseCategory: React.FC<Props> = ({ excludeIds, onChoose, show }) => {
  const { data, loading, error } = useQuery(QUERY, {
    fetchPolicy: 'network-only',
    variables: {
      not__id: excludeIds
    }
  });

  console.log(excludeIds);

  const [checkedIds, setCheckedIds] = useState({});

  const onChooseClick = () => {
    const ids = Object.keys(checkedIds);
    onChoose(ids || []);
  };

  if (loading) return null;
  if (error) {
    alert(JSON.stringify(error, null, 2));
    return null;
  }

  const forumCategories = data.forumCategories || [];

  return (
    <Modal size={'sm'} show={show} enforceFocus centered>
      <Modal.Body>
        {!forumCategories?.length && <div>Nothing to select</div>}

        {forumCategories.map(c => (
          <div key={c._id}>
            <input
              id={c._id}
              type="checkbox"
              name="categoryId"
              value={c._id}
              checked={!!checkedIds[c._id]}
              onChange={e => {
                const checked = e.target.checked;
                setCheckedIds(prev => ({
                  ...prev,
                  [c._id]: checked
                }));
              }}
            />{' '}
            <label htmlFor={c._id}>{c.name}</label>
          </div>
        ))}

        <button type="button" onClick={() => onChoose([])}>
          Cancel
        </button>
        <button type="button" onClick={onChooseClick}>
          Choose
        </button>
      </Modal.Body>
    </Modal>
  );
};

export default ChooseCategory;
