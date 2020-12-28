import { QueryBuilder } from '@cubejs-client/react';
import { Card, Col, Divider, Empty, Menu, Row } from 'antd';
import { schemaTypes } from 'modules/dashboard/constants';
import React from 'react';
import styled from 'styled-components';
import { ChartRenderer } from '../ChartRenderer';
import {
  ChartWraper,
  EmptyWrapper,
  FilterItem,
  Label,
  SelectType,
  ShadowedHeader
} from '../styles';
import ButtonDropdown from './ButtonDropdown';
import FilterGroup from './FilterGroup';
import MemberGroup from './MemberGroup';
import SelectChartType from './SelectChartType';
import stateChangeHeuristics from './stateChangeHeuristics.js';
import TimeGroup from './TimeGroup';

const ControlsRow = styled(Row)`
  background: #fff;
  padding: 20px 20px 10px 20px;
  margin: 0;
`;

const StyledDivider = styled(Divider)`
  margin: 0 12px;
  height: 57px;
  top: 4px;
  background: #ddd;
`;

const StyledDividerHorizintal = styled(Divider)`
  margin: 12px;
  height: 1px;
  top: 4px;
  background: #ddd;
`;

const ChartCard = styled(Card)`
  border-radius: 4px;
  border: none;
`;

type Props = {
  vizState: any;
  setVizState: any;
  cubejsApi?: any;
  type?: string;
  setType: any;
};

class ExploreQueryBuilder extends React.Component<Props> {
  render() {
    const { vizState, setVizState, cubejsApi, setType, type } = this.props;

    const menu = (
      <Menu>
        {schemaTypes.map(schemaType => (
          <Menu.Item key={schemaType} onClick={() => setType(schemaType)}>
            {schemaType}
          </Menu.Item>
        ))}
      </Menu>
    );

    return (
      <QueryBuilder
        vizState={vizState}
        setVizState={setVizState}
        cubejsApi={cubejsApi}
        wrapWithQueryRenderer={false}
        stateChangeHeuristics={stateChangeHeuristics}
        render={({
          measures,
          availableMeasures,
          updateMeasures,
          dimensions,
          availableDimensions,
          updateDimensions,
          timeDimensions,
          availableTimeDimensions,
          updateTimeDimensions,
          isQueryPresent,
          chartType,
          updateChartType,
          validatedQuery,
          filters,
          updateFilters
        }) => {
          return (
            <>
              <ShadowedHeader>
                <ControlsRow justify="space-around" align="top" key="1">
                  <Col span={24}>
                    <Row align="top">
                      <FilterItem>
                        <Label>Type</Label>
                        <ButtonDropdown overlay={menu} type="dashed">
                          {type || 'Type'}
                        </ButtonDropdown>
                      </FilterItem>

                      <StyledDivider type="vertical" />
                      {type ? (
                        <>
                          <FilterItem>
                            <Label>Measure</Label>
                            <MemberGroup
                              type={type}
                              memberGroupType="measure"
                              members={measures}
                              availableMembers={availableMeasures}
                              addMemberName="Measure"
                              updateMethods={updateMeasures}
                            />
                          </FilterItem>
                          <StyledDivider type="vertical" />
                          <FilterItem>
                            <Label>Dimension</Label>
                            <MemberGroup
                              type={type}
                              memberGroupType="dimensions"
                              members={dimensions}
                              availableMembers={availableDimensions}
                              addMemberName="Dimension"
                              updateMethods={updateDimensions}
                            />
                          </FilterItem>
                          <StyledDivider type="vertical" />
                          <FilterItem>
                            <Label>Time</Label>
                            <TimeGroup
                              type={type}
                              members={timeDimensions}
                              availableMembers={availableTimeDimensions}
                              addMemberName="Time"
                              updateMethods={updateTimeDimensions}
                            />
                          </FilterItem>
                        </>
                      ) : null}
                    </Row>
                    {isQueryPresent ? (
                      <Row
                        justify="space-around"
                        align="top"
                        gutter={24}
                        style={{
                          marginBottom: 12
                        }}
                      >
                        <StyledDividerHorizintal type="horizontal" />
                        <Col span={24}>
                          <FilterItem>
                            <Label>Filter by dimension</Label>
                            <FilterGroup
                              members={filters}
                              availableMembers={availableDimensions}
                              addMemberName="Filter"
                              updateMethods={updateFilters}
                              schemaType={type}
                            />
                          </FilterItem>
                        </Col>
                      </Row>
                    ) : null}
                  </Col>
                </ControlsRow>
              </ShadowedHeader>

              {isQueryPresent ? (
                <ChartWraper>
                  <SelectType>
                    <SelectChartType
                      chartType={chartType}
                      updateChartType={updateChartType}
                      query={validatedQuery}
                    />
                  </SelectType>
                  <ChartCard>
                    <ChartRenderer
                      query={validatedQuery}
                      chartType={chartType}
                      chartHeight={400}
                    />
                  </ChartCard>
                </ChartWraper>
              ) : (
                <EmptyWrapper>
                  <Empty
                    imageStyle={{
                      height: 200
                    }}
                    description={
                      <>
                        <strong>Build Your Query</strong>
                        Choose a measure or dimension to get started
                      </>
                    }
                  />
                </EmptyWrapper>
              )}
            </>
          );
        }}
      />
    );
  }
}

export default ExploreQueryBuilder;
