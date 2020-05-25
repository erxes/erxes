import { QueryBuilder } from '@cubejs-client/react';
import { Card, Col, Divider, Menu, Row } from 'antd';
import React from 'react';
import styled from 'styled-components';
import ChartRenderer from '../ChartRenderer';
import ButtonDropdown from './ButtonDropdown';
import MemberGroup from './MemberGroup';
import SelectChartType from './SelectChartType';
import stateChangeHeuristics from './stateChangeHeuristics.js';
import TimeGroup from './TimeGroup';
import { schemaTypes } from './Types';

const ControlsRow = styled(Row)`
  background: #fff;
  margin-bottom: 12px;
  padding: 20px;
  margin: 0 0 12px;
`;

const StyledDivider = styled(Divider)`
  margin: 0 12px;
  height: 57px;
  top: 4px;
  background: #ddd;
`;

const ChartCard = styled(Card)`
  border-radius: 4px;
  border: none;
`;

const ChartWraper = styled.div`
  margin: 20px;
`;

const SelectType = styled.div`
  margin: 20px 0;
`;

const Empty = styled.div`
  text-align: center;
  margin-top: 185px;
`;

const Label = styled.label`
  margin-bottom: 12px;
  color: #a1a1b5;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-size: 11px;
  font-weight: bold;
  display: block;
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
        {schemaTypes.map((schemaType) => (
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
          segments,
          availableSegments,
          updateSegments,
          timeDimensions,
          availableTimeDimensions,
          updateTimeDimensions,
          isQueryPresent,
          chartType,
          updateChartType,
          validatedQuery,
        }) => {
          return (
            <>
              <ControlsRow justify="space-around" align="top" key="1">
                <Col span={24}>
                  <Row align="top">
                    <span>
                      <Label>Type</Label>
                      <ButtonDropdown overlay={menu} type="dashed">
                        {type || 'Type'}
                      </ButtonDropdown>
                    </span>

                    <StyledDivider type="vertical" />
                    {type ? (
                      <>
                        <span>
                          <Label>Measure</Label>
                          <MemberGroup
                            type={type}
                            memberGroupType="measure"
                            members={measures}
                            availableMembers={availableMeasures}
                            addMemberName="Measure"
                            updateMethods={updateMeasures}
                          />
                        </span>
                        <StyledDivider type="vertical" />
                        <span>
                          <Label>Dimension</Label>
                          <MemberGroup
                            type={type}
                            memberGroupType="dimensions"
                            members={dimensions}
                            availableMembers={availableDimensions}
                            addMemberName="Dimension"
                            updateMethods={updateDimensions}
                          />
                        </span>
                        <StyledDivider type="vertical" />
                        <span>
                          <Label>Segment</Label>
                          <MemberGroup
                            type={type}
                            members={segments}
                            memberGroupType="segments"
                            availableMembers={availableSegments}
                            addMemberName="Segment"
                            updateMethods={updateSegments}
                          />
                        </span>
                        <StyledDivider type="vertical" />
                        <span>
                          <Label>Time</Label>
                          <TimeGroup
                            type={type}
                            members={timeDimensions}
                            availableMembers={availableTimeDimensions}
                            addMemberName="Time"
                            updateMethods={updateTimeDimensions}
                          />
                        </span>
                      </>
                    ) : null}
                  </Row>
                </Col>
              </ControlsRow>
              <ChartWraper>
                {isQueryPresent ? (
                  <>
                    <SelectType>
                      <SelectChartType
                        chartType={chartType}
                        updateChartType={updateChartType}
                      />
                    </SelectType>
                    <ChartCard style={{ minHeight: 420 }}>
                      <ChartRenderer
                        vizState={{ query: validatedQuery, chartType }}
                        chartHeight={400}
                      />
                    </ChartCard>
                  </>
                ) : (
                  <Empty>
                    <h2>Build Your Query</h2>
                    <p>Choose a measure or dimension to get started</p>
                  </Empty>
                )}
              </ChartWraper>
            </>
          );
        }}
      />
    );
  }
}

export default ExploreQueryBuilder;
