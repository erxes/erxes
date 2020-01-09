import DataWithLoader from 'modules/common/components/DataWithLoader';
import Table from 'modules/common/components/table';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { IAutomation } from '../types';
import AutomationRow from './AutomationRow';

type Props = {
  automations: IAutomation[];
  loading: boolean;
};

// tslint:disable-next-line: no-unused-expression
class List extends React.Component<Props, {}> {
  renderObjects() {
    const { automations } = this.props;
    const rows: JSX.Element[] = [];

    if (!automations) {
      return rows;
    }

    for (const automation of automations) {
      rows.push(<AutomationRow key={automation._id} automation={automation} />);
    }

    return rows;
  }

  renderContent() {
    return (
      <Table whiteSpace="wrap" hover={true} bordered={true} condensed={true}>
        <thead>
          <tr>
            <th>{__('Date')}</th>
            <th>{__('Name')}</th>
            <th>{__('Description')}</th>
            <th>{__('Changes')}</th>
          </tr>
        </thead>
        <tbody>{this.renderObjects()}</tbody>
      </Table>
    );
  }

  render() {
    const { loading } = this.props;
    return (
      <Wrapper
        header={<Wrapper.Header title={__('Automations')} />}
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={loading}
            emptyText={__('no automations')}
            emptyImage="/images/actions/21.svg"
          />
        }
      />
    );
  }
}

export default List;
