import React from 'react';
import { IGrantRequest } from '../../common/section/type';
import { DefaultWrapper } from '../../common/section/utils';
import { FormControl, Table, __ } from '@erxes/ui/src';
import Row from './Row';

type Props = {
  list: IGrantRequest[];
  totalCount: number;
};

type State = {
  searchValue?: string;
};

class List extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderList() {
    const { list } = this.props;

    return (
      <Table>
        <thead>
          <tr>
            <th>
              <FormControl componentClass="checkbox" />
            </th>
            <th>{__('Status')}</th>
          </tr>
        </thead>
        <tbody>
          {list.map(item => (
            <Row request={item} />
          ))}
        </tbody>
      </Table>
    );
  }

  render() {
    const updatedProps = {
      title: 'List Request',
      content: this.renderList(),
      totalCount: this.props.totalCount
    };

    return <DefaultWrapper {...updatedProps} />;
  }
}

export default List;
