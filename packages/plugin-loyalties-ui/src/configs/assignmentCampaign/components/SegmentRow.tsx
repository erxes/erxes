import React from 'react';
import { Indicator } from '../../../styles';

type Props = {
  segment: any;
  history: any;
};

class Row extends React.Component<Props> {
  render() {
    const onClick = e => {
      e.stopPropagation();
    };

    const { name, color } = this.props.segment;
    return (
      <tr>
        <td>
          <Indicator color={color} />
        </td>
        <td>{name}</td>
        <td></td>
      </tr>
    );
  }
}
export default Row;
