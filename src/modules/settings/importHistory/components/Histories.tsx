import { DataWithLoader, Table } from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Sidebar from '../../properties/components/Sidebar';
import HistoryRow from './Row';
import { IHistories } from './types';

type Props = {
  queryParams: any,
  currentType: string,
  histories: IHistories[],
  removeHistory: () => void,
  loading: boolean
};

class Histories extends Component {
  static contextTypes =  {
    __: PropTypes.func
  }

  constructor(props) {
    super(props);

    this.renderHistories = this.renderHistories.bind(this);
  }

  renderHistories() {
    const { histories, removeHistory } = this.props;
    const { __ } = this.context;

    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Success')}</th>
            <th>{__('Failed')}</th>
            <th>{__('Total')}</th>
            <th>{__('Imported Date')}</th>
            <th>{__('Imported User')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {histories.map(history => {
            return (
              <HistoryRow
                key={history._id}
                history={history}
                removeHistory={removeHistory}
              />
            );
          })}
        </tbody>
      </Table>
    );
  }

  render() {
    const { __ } = this.context;
    const { currentType, histories, loading } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Import histories'), link: '/settings/importHistories' },
      { title: __(currentType) }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={
          <Sidebar title="Import histories" currentType={currentType} />
        }
        content={
          <DataWithLoader
            data={this.renderHistories()}
            loading={loading}
            count={histories.length}
            emptyText="There aren't any imports"
            emptyImage="/images/robots/robot-01.svg"
          />
        }
      />
    );
  }
}

Histories.propTypes = propTypes;
Histories.contextTypes = contextTypes;

export default Histories;
