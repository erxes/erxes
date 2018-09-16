import * as React from 'react';
import styled from 'styled-components';
import { RowActions } from '../../common/components';
import { ICommonRowActionProps } from '../../common/types';
import { IEmailTemplate } from '../types';
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

class Row extends React.Component<{ object: IEmailTemplate } & ICommonRowActionProps> {
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

        <RowActions
          {...this.props}
          renderForm={(props) =>
            <Form {...props} />
          }
        />
      </tr>
    );
  }
}

export default Row;
