import React from 'react';
import { Button } from 'erxes-ui';
import { ITdbConfig } from '../types';

type Props = {
  config: ITdbConfig;
  remove: (id: string) => void;
  onEdit: (config: ITdbConfig) => void;
};

const Row = ({ config, remove, onEdit }: Props) => {
  const { _id, name, apiUrl, username, testMode } = config;

  return (
    <tr className="border-b">
      <td className="py-2">{name}</td>
      <td className="py-2">{apiUrl}</td>
      <td className="py-2">{username}</td>
      <td className="py-2">{testMode ? 'Test' : 'Production'}</td>
      <td className="py-2 text-right">
        <Button variant="ghost" size="sm" onClick={() => onEdit(config)}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => remove(_id)}>
          Delete
        </Button>
      </td>
    </tr>
  );
};

export default Row;