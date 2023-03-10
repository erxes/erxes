import {
  SortHandler,
  Table,
  __,
  HeaderDescription,
  BarItems,
  Button,
  ModalTrigger
} from '@erxes/ui/src';
import React from 'react';
import { DefaultWrapper } from '../../common/utils';
import { subMenu } from '../../common/constants';
import Row from './Row';
import { SideBar } from './SideBar';
import Form from './Form';
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
            <th>{__('Risk Indicators')}</th>
            <th>{__('Branches')}</th>
            <th>{__('Departments')}</th>
            <th>{__('Opearations')}</th>
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
        title="Risk Assessments"
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
