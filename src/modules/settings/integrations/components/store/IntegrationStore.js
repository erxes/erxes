import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import Sidebar from '../../Sidebar';
import { integrations } from './constants';
import { CategoryRow } from '.';
import { IntegrationWrapper } from './styles';

const propTypes = {
  queryParams: PropTypes.object,
  totalCount: PropTypes.object
};

class IntegrationStore extends Component {
  renderContent() {
    const { totalCount } = this.props;

    return (
      <IntegrationWrapper>
        {integrations.map(obj => (
          <CategoryRow
            key={obj.name}
            title={obj.title}
            queryParams={this.props.queryParams}
            integrations={obj.rows}
            totalCount={totalCount}
          />
        ))}
      </IntegrationWrapper>
    );
  }
  render() {
    const { __ } = this.context;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Integrations') }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
      />
    );
  }
}

IntegrationStore.propTypes = propTypes;
IntegrationStore.contextTypes = {
  __: PropTypes.func
};

export default IntegrationStore;
