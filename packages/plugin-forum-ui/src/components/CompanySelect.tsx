import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import { Modal } from 'react-bootstrap';

const QUERY = gql`
  query Companies($page: Int, $perPage: Int, $searchValue: String) {
    companies(page: $page, perPage: $perPage, searchValue: $searchValue) {
      _id
      primaryEmail
      primaryName
      primaryPhone
    }
  }
`;

const CompanySelect: React.FC<{
  show?: boolean;
  onChoose: (user: any) => any;
  onCancel: () => any;
}> = ({ show, onChoose, onCancel }) => {
  const [inputValue, setInputValue] = useState('');
  const [checkedUserId, setCheckedUserId] = useState<any>(null);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);

  const { data, loading, error, refetch } = useQuery(QUERY, {
    fetchPolicy: 'network-only',
    variables: {
      searchValue: '',
      page,
      perPage
    }
  });

  const search = e => {
    e.preventDefault();
    refetch({
      searchValue: inputValue,
      page,
      perPage
    });
  };

  const companies = data?.companies || [];

  return (
    <Modal size={'xl'} show={show} enforceFocus centered>
      <Modal.Body>
        {error && <pre>Error: {error.message}</pre>}
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

        {!companies?.length && <div>Nothing to select</div>}

        {companies && (
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
              {companies.map(c => (
                <tr key={c._id}>
                  <td>
                    <input
                      id={`radio${c._id}`}
                      type="radio"
                      name="companyId"
                      value={c._id}
                      checked={checkedUserId === c._id}
                      onChange={e => {
                        const checked = e.target.checked;
                        if (checked) {
                          setCheckedUserId(c._id);
                        }
                      }}
                    />
                  </td>
                  <td>
                    <label htmlFor={`radio${c._id}`}>{c.primaryEmail}</label>
                  </td>
                  <td>{c.primaryName}</td>
                  <td>{c.primaryPhone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          type="button"
          onClick={() => {
            setCheckedUserId(null);
            setInputValue('');
            onCancel();
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={async () => {
            await onChoose(checkedUserId);
            setCheckedUserId(null);
            setInputValue('');
          }}
          disabled={!checkedUserId}
        >
          Choose
        </button>
      </Modal.Body>
    </Modal>
  );
};

export default CompanySelect;
