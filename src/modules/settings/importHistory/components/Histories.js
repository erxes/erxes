import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Table, DataWithLoader } from 'modules/common/components';
import Sidebar from '../../properties/components/Sidebar';
import HistoryRow from './Row';

const propTypes = {
  queryParams: PropTypes.object,
  currentType: PropTypes.string,
  histories: PropTypes.array,
  removeHistory: PropTypes.func,
  loading: PropTypes.bool
};

const contextTypes = {
  __: PropTypes.func
};

class Histories extends Component {
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
