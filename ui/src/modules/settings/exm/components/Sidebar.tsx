import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  list: any;
};

function Sidebar(props: Props) {
  return (
    <ul style={{ marginRight: '20px' }}>
      {props.list.map((l, index: number) => (
        <li key={index}>
          <Link to={`/settings/exm?_id=${l._id}`}>{l.name}</Link>
        </li>
      ))}
    </ul>
  );
}

export default Sidebar;
