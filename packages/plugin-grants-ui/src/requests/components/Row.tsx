import React from 'react';
import { IGrantRequest } from '../../common/section/type';
import { FormControl, Label } from '@erxes/ui/src';
type Props = {
  request: IGrantRequest;
};

class Row extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { request } = this.props;

    const onClick = e => {};

    const lblStyle = () => {
      switch (request.status) {
        case 'approved':
          return 'success';
        case 'declined':
          return 'danger';
        default:
          return 'default';
      }
    };

    return (
      <tr>
        <td onClick={onClick}>
          <FormControl componentClass="checkbox" />
        </td>
        <td>
          <Label lblStyle={lblStyle()}>{request.status}</Label>
        </td>
      </tr>
    );
  }
}

export default Row;
