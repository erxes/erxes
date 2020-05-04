import { QueryBuilder } from '@cubejs-client/react';
import { Card, Col, Divider, Menu, Row } from 'antd';
import React from 'react';
import styled from 'styled-components';
import ChartRenderer from '../ChartRenderer';
import ButtonDropdown from './ButtonDropdown';
import MemberGroup from './MemberGroup';
import SelectChartType from './SelectChartType';
import TimeGroup from './TimeGroup';
import { types } from './Types';

const ControlsRow = styled(Row)`
  background: #ffffff;
  margin-bottom: 12px;
  padding: 18px 28px 10px 28px;
`;

const StyledDivider = styled(Divider)`
  margin: 0 12px;
  height: 4.5em;
  top: 0.5em;
  background: #f4f5f6;
`;

const ChartCard = styled(Card)`
  border-radius: 4px;
  border: none;
`;

const ChartRow = styled(Row)`
  padding-left: 28px;
  padding-right: 28px;
`;

const Empty = styled.div`
  text-align: center;
  margin-top: 185px;
`;

const LabelStyled = styled.div`
  margin-bottom: 12px;
  color: #a1a1b5;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-size: 11px;
  font-weight: bold;
`;

type Props = {
  vizState: any;
  setVizState: any;
  cubejsApi?: any;
};

type State = {
  type: string;
};

class ExploreQueryBuilder extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { type: '' };
  }

  updateType = type => {
    this.setState({ type });
  };

  render() {
    const { vizState, setVizState, cubejsApi } = this.props;

    const menu = (
      <Menu>
        {types.map(type => (
          <Menu.Item key={type} onClick={() => this.updateType(type)}>
            {type}
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
          validatedQuery
        }) => {
          return (
            <>
              <ControlsRow justify="space-around" align="top" key="1">
                <Col span={24}>
                  <Row align="top" style={{ paddingBottom: 23 }}>
                    <span>
                      <LabelStyled>Type</LabelStyled>
                      <ButtonDropdown overlay={menu}>
                        {this.state.type || 'Type'}
                      </ButtonDropdown>
                    </span>
                    <StyledDivider type="vertical" />
                    <span>
                      <LabelStyled>Measure</LabelStyled>
                      <MemberGroup
                        members={measures}
                        availableMembers={availableMeasures}
                        addMemberName="Measure"
                        updateMethods={updateMeasures}
                      />
                    </span>
                    <StyledDivider type="vertical" />
                    <span>
                      <LabelStyled>Dimension</LabelStyled>
                      <MemberGroup
                        members={dimensions}
                        availableMembers={availableDimensions}
                        addMemberName="Dimension"
                        updateMethods={updateDimensions}
                      />
                    </span>
                    <StyledDivider type="vertical" />
                    <span>
                      <LabelStyled>Segment</LabelStyled>
                      <MemberGroup
                        members={segments}
                        availableMembers={availableSegments}
                        addMemberName="Segment"
                        updateMethods={updateSegments}
                      />
                    </span>
                    <StyledDivider type="vertical" />
                    <span>
                      <LabelStyled>Time</LabelStyled>
                      <TimeGroup
                        members={timeDimensions}
                        availableMembers={availableTimeDimensions}
                        addMemberName="Time"
                        updateMethods={updateTimeDimensions}
                      />
                    </span>
                  </Row>
                </Col>
              </ControlsRow>
              ,
              <ChartRow justify="space-around" align="top" gutter={24} key="2">
                <Col span={24}>
                  {isQueryPresent ? (
                    <>
                      <Row style={{ marginTop: 15, marginBottom: 25 }}>
                        <SelectChartType
                          chartType={chartType}
                          updateChartType={updateChartType}
                        />
                      </Row>
                      ,
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
                </Col>
              </ChartRow>
            </>
          );
        }}
      />
    );
  }
}

export default ExploreQueryBuilder;
