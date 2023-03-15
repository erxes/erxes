import { HeaderDescription, SortHandler, Table, __ } from '@erxes/ui/src';
import React from 'react';
import { subMenu } from '../../common/constants';
import { DefaultWrapper } from '../../common/utils';
import Row from './Row';
import { SideBar } from './SideBar';
type Props = {
  list: any[];
  totalCount: number;
  queryParams: any;
  history: any;
};

class List extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderContent = () => {
    const { list } = this.props;

    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Card type')}</th>
            <th>{__('Card Name')}</th>
            <th>{__('Indicators')}</th>
            <th>{__('Branch')}</th>
            <th>{__('Department')}</th>
            <th>{__('Opearation')}</th>
            <th>{__('Status')}</th>
            <th>{__('Result Score')}</th>
            <th>
              <SortHandler sortField="createdAt" />
              {__('Created At')}
            </th>
            <th>
              <SortHandler sortField="closedAt" />
              {__('Closed At')}
            </th>
            <th>{__('Action')}</th>
          </tr>
        </thead>
        <tbody>
          {(list || []).map(item => (
            <Row item={item} key={item._id} />
          ))}
        </tbody>
      </Table>
    );
  };

  render() {
    const { totalCount, queryParams } = this.props;

    const leftActionBar = (
      <HeaderDescription
        title="Assessments"
        icon="/images/actions/13.svg"
        description=""
      />
    );

    const updatedProps = {
      title: 'Assessment',
      content: this.renderContent(),
      leftActionBar,
      subMenu,
      sidebar: (
        <SideBar history={this.props.history} queryParams={queryParams} />
      ),
      totalCount
    };
    return <DefaultWrapper {...updatedProps} />;
  }
}

export default List;
