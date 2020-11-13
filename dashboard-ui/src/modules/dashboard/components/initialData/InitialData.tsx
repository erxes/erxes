import { Col, Row } from 'antd';
import { IDashboardItem } from 'modules/dashboard/types';
import React from 'react';
import styled from 'styled-components';
import { ChartRenderer } from '../ChartRenderer';
import InitialDataItem from './InitialDataItem';

type Props = {
  items: IDashboardItem[];
  dashboardId: string;
  save: (params: {
    name: string;
    vizState: string;
    dashboardId: string;
  }) => void;
};

const Datas = styled.div`
  padding: 20px;
  background: #fff;
`;

class InitialData extends React.Component<Props, {}> {
  render() {
    const { items, dashboardId, save } = this.props;

    return (
      <Datas>
        <Row gutter={[20, 20]}>
          {items.map((item, index) => {
            const vizState = JSON.parse(item.vizState);
            return (
              <Col key={Math.random()} span={12}>
                <InitialDataItem
                  key={Math.random()}
                  dashboardId={dashboardId}
                  item={item}
                  title={item.name}
                  save={save}
                  bordered={true}
                >
                  <ChartRenderer
                    key={Math.random()}
                    chartType={vizState.chartType}
                    query={vizState.query}
                    chartHeight={500}
                  />
                </InitialDataItem>
              </Col>
            );
          })}
        </Row>
      </Datas>
    );
  }
}

export default InitialData;
