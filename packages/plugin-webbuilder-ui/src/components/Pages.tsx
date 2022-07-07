import React from 'react';
import { Link } from 'react-router-dom';
import { IPage } from '../types';

type Props = {
  pages: IPage[];
};

class Pages extends React.Component<Props, {}> {
  render() {
    return (
      <div>
        <h1>Pages</h1>

        <Link to="/webbuilder/pages/create">Create new page</Link>

        {this.props.pages.map(p => (
          <p key={p._id}>
            <Link to={`/webbuilder/pages/edit/${p._id}`}>{p.name}</Link>
          </p>
        ))}
      </div>
    );
  }
}

export default Pages;
