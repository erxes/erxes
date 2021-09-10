import * as compose from 'lodash.flowright';

import React, { Component } from 'react';
import {
  IOptions,
  IPipeline,
  StagesQueryResponse,
  IItemMap,
  IStageMap
} from '../types';
import gql from 'graphql-tag';
import EmptyState from 'modules/common/components/EmptyState';
import { IRouterProps } from 'modules/common/types';
import { withProps, __ } from 'modules/common/utils';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { queries } from '../graphql';
import styled from 'styled-components';
import ListStage from './ListStage';
import Spinner from 'modules/common/components/Spinner';
import { Dropdown } from 'react-bootstrap';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import Button from 'modules/common/components/Button';
import { GroupByContent } from '../styles/common';
import Icon from 'modules/common/components/Icon';

const Container = styled.div`
  min-height: 480px;
  overflow: auto;
  background-color: white;
`;

type Props = {
  pipeline: IPipeline;
  queryParams: any;
  options: IOptions;
  stageMap?: IStageMap;
  initialItemMap?: IItemMap;
};

class WithStages extends Component<WithStagesQueryProps> {
  componentWillReceiveProps(nextProps: Props) {
    const { stagesQuery, queryParams } = this.props;
    const { pipelineId } = queryParams;

    if (this.queryParamsChanged(queryParams, nextProps.queryParams)) {
      stagesQuery.refetch({ pipelineId });
    }
  }

  queryParamsChanged = (queryParams: any, nextQueryParams: any) => {
    if (nextQueryParams.itemId || (!queryParams.key && queryParams.itemId)) {
      return false;
    }

    if (queryParams !== nextQueryParams) {
      return true;
    }

    return false;
  };

  countStages(obj) {
    return Object.keys(obj).length;
  }

  renderGroupBy() {
    return (
      <GroupByContent>
        <Icon icon="list-2" />
        <span>{__('Group by:')}</span>
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-groupby">
            <Button>
              {__('Stages')} <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <li>
              <a
                href="#export"
                // onClick={exportData.bind(this, bulk)}
              >
                {__('Stages')}
              </a>
            </li>
            <li>
              <a
                href="#export"
                // onClick={exportData.bind(this, bulk)}
              >
                {__('Labels')}
              </a>
            </li>
            <li>
              <a
                href="#verifyEmail"
                // onClick={this.verifyCustomers.bind(this, 'email')}
              >
                {__('Priority')}
              </a>
            </li>
            <li>
              <a
                href="#verifyPhone"
                // onClick={this.verifyCustomers.bind(this, 'phone')}
              >
                {__('Assignee')}
              </a>
            </li>
            <li>
              <a
                href="#verifyPhone"
                // onClick={this.verifyCustomers.bind(this, 'phone')}
              >
                {__('Due Date')}
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </GroupByContent>
    );
  }

  render() {
    const { options, queryParams, stagesQuery } = this.props;

    const stages = stagesQuery.stages || [];

    if (stages.length === 0) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="No stage in this pipeline"
          size="small"
          light={true}
        />
      );
    }

    return (
      <Container>
        {this.renderGroupBy()}
        {stages.map((stage, index) => {
          if (!stage) {
            return null;
          }

          return (
            <ListStage
              key={stage._id}
              options={options}
              stage={stage}
              index={index}
              length={stages.length}
              queryParams={queryParams}
              refetchStages={stagesQuery.refetch}
            />
          );
        })}
      </Container>
    );
  }
}

type WithStagesQueryProps = {
  stagesQuery: StagesQueryResponse;
} & IRouterProps &
  Props;

const WithStagesQuery = (props: WithStagesQueryProps) => {
  const { stagesQuery } = props;

  if (stagesQuery.loading) {
    return <Spinner />;
  }

  const stages = stagesQuery.stages || [];

  const itemMap: IItemMap = {};
  const stageMap: IStageMap = {};

  for (const stage of stages) {
    itemMap[stage._id] = [];
    stageMap[stage._id] = stage;
  }

  return <WithStages {...props} stageMap={stageMap} initialItemMap={itemMap} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, StagesQueryResponse>(gql(queries.stages), {
      name: 'stagesQuery',
      options: ({ pipeline, queryParams, options: { getExtraParams } }) => ({
        variables: {
          pipelineId: pipeline._id,
          search: queryParams.search,
          customerIds: queryParams.customerIds,
          companyIds: queryParams.companyIds,
          assignedUserIds: queryParams.assignedUserIds,
          labelIds: queryParams.labelIds,
          extraParams: getExtraParams(queryParams),
          closeDateType: queryParams.closeDateType,
          userIds: queryParams.userIds,
          assignedToMe: queryParams.assignedToMe
        }
      })
    })
  )(withRouter(WithStagesQuery))
);
