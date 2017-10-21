import React from 'react';
import { Row as CommonRow } from '../../common/components';
import Form from './Form';

class Row extends CommonRow {
  renderForm(props) {
    return <Form {...props} />;
  }

  render() {
    const { object } = this.props;

    return (
      <tr>
        <td>
          <div className="iframe-preview">
            <iframe title="content-iframe" srcDoc={object.content} />
          </div>
        </td>
        <td>{object.name}</td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default Row;
