import React from 'react';

type Props = {
  category: any;
  history: any;
};

class Row extends React.Component<Props> {
  render() {
    const { category } = this.props;

    const onTrClick = () => {};

    const { name, code } = category;

    return (
      <tr onClick={onTrClick}>
        <td>{code}</td>
        <td>{name}</td>
      </tr>
    );
  }
}

export default Row;
