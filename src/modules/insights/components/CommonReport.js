import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Filter, Sidebar } from './';
import { InsightTitle, InsightWrapper } from '../styles';

const propTypes = {
  brands: PropTypes.array.isRequired,
  trend: PropTypes.array.isRequired,
  queryParams: PropTypes.object,
  history: PropTypes.object
};

class CommonReport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 600
    };
  }

  calculateWidth() {
    const width = this.wrapper.clientWidth;
    this.setState({ width });
  }

  renderTitle(title, time) {
    const { __ } = this.context;
    return (
      <InsightTitle>
        {__(title)}
        {time ? <span>({time})</span> : null}
      </InsightTitle>
    );
  }

  renderCharts() {
    return null;
  }

  renderContent() {
    const { brands, history, queryParams } = this.props;

    return (
      <InsightWrapper>
        <Filter history={history} brands={brands} queryParams={queryParams} />
        {this.renderCharts()}
      </InsightWrapper>
    );
  }

  renderBreadCrumnb() {
    const { __ } = this.context;
    return [{ title: __('Insights'), link: '/insight' }];
  }

  render() {
    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={this.renderBreadCrumnb()} />}
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
      />
    );
  }
}

CommonReport.propTypes = propTypes;
CommonReport.contextTypes = {
  __: PropTypes.func
};

export default CommonReport;
