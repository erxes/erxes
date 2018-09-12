import { Spinner } from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import React, { Component } from 'react';
import {
  InsightRow,
  InsightTitle,
  InsightWrapper,
  LoaderWrapper
} from '../styles';
import { Chart, Filter, PunchCard, Sidebar } from './';

interface IProps {
  brands: any,
  trend: any,
  queryParams: any,
  history: any
};

class CommonReport extends Component<IProps, { width: number }> {
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

  renderTitle(title: string, time?: string) {
    const { __ } = this.context;
    return (
      <InsightTitle>
        {__(title)}
        {time ? <span>({time})</span> : null}
      </InsightTitle>
    );
  }

  renderTrend(name, loading, trend, width) {
    return (
      <InsightRow
        innerRef={node => {
          this.wrapper = node;
        }}
      >
        {this.renderTitle(name)}
        <Chart loading={loading.main} height={360} data={trend} />
      </InsightRow>
    );
  }

  renderPunchCard(loading, punch, width) {
    let content = (
      <LoaderWrapper>
        <Spinner objective />
      </LoaderWrapper>
    );

    if (!loading.punch) {
      content = <PunchCard data={punch} width={width} />;
    }

    return (
      <InsightRow>
        {this.renderTitle('Punch card')}
        {content}
      </InsightRow>
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
    return null;
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

export default CommonReport;
