import * as React from 'react';
import styled from 'styled-components';
import { Row as CommonRow } from '../../common/components';
import Form from './Form';

const IframePreview = styled.div`
  width: 140px;
  height: 100px;
  overflow: hidden;
  border: 1px solid #ddd;
  border-radius: 4px;

  iframe {
    transform: scale(0.2);
    transform-origin: 0 0;
    pointer-events: none;
    width: 510%;
    height: 500%;
    border: 0;
  }
`;

class Row extends CommonRow {
  renderForm(props) {
    return <Form {...props} />;
  }

  render() {
    const { object } = this.props;

    return (
      <tr>
        <td>
          <IframePreview>
            <iframe title="content-iframe" srcDoc={object.content} />
          </IframePreview>
        </td>
        <td>{object.name}</td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default Row;
