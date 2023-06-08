import React from 'react';
import { HeaderDescription, Table, __ } from '@erxes/ui/src/';
import { DefaultWrapper } from '../../common/utils';
import SideBar from './Sidebar';
import Row from './Row';

type Props = {
  list: any[];
  totalCount: number;
  history: any;
  queryParams: any;
};

type State = {
  searchValue?: string;
};

class rcfaTable extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  renderRow(item: any, key: number) {
    const updatedProps = {
      item,
      key
    };
    return <Row {...updatedProps} key={key} />;
  }

  renderContent() {
    const { list } = this.props;

    return (
      <div>
        <Table>
          <thead>
            <tr>
              <th>{__('Source Type')}</th>
              <th>{__('Source Name')}</th>
              <th>{__('Status')}</th>
              <th>{__('Created at')}</th>
              <th>{__('Closed at')}</th>
              <th>{__('Detail')}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item, index) => this.renderRow(item, index))}
          </tbody>
        </Table>
      </div>
    );
  }

  render() {
    const { history, queryParams } = this.props;

    const leftActionBar = (
      <HeaderDescription
        title="RCFA List"
        icon="/images/actions/8.svg"
        description=""
      />
    );

    const updatedProps = {
      title: 'RCFA list',
      leftActionBar,
      totalCount: this.props.totalCount,
      sidebar: <SideBar history={history} queryParams={queryParams} />,
      content: this.renderContent()
    };

    return <DefaultWrapper {...updatedProps} />;
  }
}

export default rcfaTable;
