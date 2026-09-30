import { useMutation, useQuery } from '@apollo/client';
import { FormEvent, useState } from 'react';
import { CHANGEME_CHANGEMODULE_ITEM_ADD } from './graphql/mutations';
import { CHANGEME_CHANGEMODULE_ITEMS } from './graphql/queries';

type ChangemoduleItem = {
  _id: string;
  name: string;
  code: string;
  status?: string;
};

/**
 * Module Federation remote module — core-ui mounts this under
 * /changeme/changemodule inside its own ApolloProvider, so useQuery hits the
 * gateway and lands on the changeme subgraph.
 */
export const Main = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const { data, loading, error } = useQuery<{
    changemecChangemoduleItems: ChangemoduleItem[];
  }>(CHANGEME_CHANGEMODULE_ITEMS);

  const [addItem, { loading: saving }] = useMutation(
    CHANGEME_CHANGEMODULE_ITEM_ADD,
    {
      refetchQueries: [CHANGEME_CHANGEMODULE_ITEMS],
      onError: (e) => alert(e.message),
    },
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    addItem({ variables: { name, code } });
    setName('');
    setCode('');
  };

  return (
    <div className="changemodule-page">
      <h1>Changemodule items</h1>

      <form onSubmit={onSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code"
          required
        />
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Add'}
        </button>
      </form>

      {loading && <p>Loading…</p>}
      {error && <p role="alert">{error.message}</p>}

      {!loading && !data?.changemecChangemoduleItems?.length && (
        <p>No changemodule items yet.</p>
      )}

      {!!data?.changemecChangemoduleItems?.length && (
        <table className="changemodule-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.changemecChangemoduleItems.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.code}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Main;
