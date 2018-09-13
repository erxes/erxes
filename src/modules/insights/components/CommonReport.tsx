import { Spinner } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import React, { Component } from 'react';
import { IBrand } from '../../settings/brands/types';
import {
  InsightRow,
  InsightTitle,
  InsightWrapper,
  LoaderWrapper
} from '../styles';
import { IChartParams, InsightParams, IQueryParams } from '../types';
import { Chart, Filter, PunchCard, Sidebar } from './';

type Props = {
  brands: IBrand[],
  trend: IChartParams[],
  queryParams: IQueryParams,
  history: any,
  teamMembers?: IChartParams[],
  time?: number,
  isLoading?: boolean
  punch?: any,
  summary?: any,
  loading?: any,
  insights?: InsightParams[]
};

class CommonReport extends Component<Props, { width: number }> {
  public wrapper;

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
