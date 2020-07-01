import React from 'react';

import { Button, Input, Modal } from 'antd';
import { IDashboardItem } from '../types';
import PageHeader from './PageHeader';
import ExploreQueryBuilder from './QueryBuilder/ExploreQueryBuilder';
import { ShadowedHeader } from './styles';

type Props = {
  dashboardItem?: IDashboardItem;
  isActionLoading: boolean;
  dashboardId: string;
  save: (params: {
    _id?: string;
    name: string;
    vizState: string;
    dashboardId: string;
  }) => void;
};

type State = {
  vizState: string;
  name: string;
  type: string;
  visible: boolean;
};

class Chart extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const dashboardItem = props.dashboardItem || {};

    this.state = {
      vizState: dashboardItem.vizState
        ? JSON.parse(dashboardItem.vizState)
        : {},
      type: dashboardItem.type,
      name: dashboardItem.name,
      visible: false,
    };
  }

  setVizState = vizState => {
    this.setState({ vizState });
  };

  setType = type => {
    this.setState({ type });
  };

  handleSubmit = () => {
    const { name, vizState, type } = this.state;
    const { dashboardId, dashboardItem } = this.props;

    if (!name) {
      return window.alert('Write name');
    }
    if (!vizState) {
      return window.alert('Choose chart');
    }

    const doc = {
      _id: dashboardItem ? dashboardItem._id : '',
      name,
      vizState,
      dashboardId,
      type,
    };

    this.props.save(doc);
  };

  setTitleModalVisible = value => {
    this.setState({
      visible: value,
    });
  };

  onChange = (key: string, value: any) => {
    this.setState({ [key]: value } as any);
  };

  render() {
    const { vizState, type, visible, name } = this.state;

    const onChange = e =>
      this.onChange('name', (e.currentTarget as HTMLInputElement).value);

    return (
      <div>
        <ShadowedHeader>
          <PageHeader
            title={<h4>Explore chart</h4>}
            button={
              <Button
                type='primary'
                shape="round"
                onClick={() => this.onChange('visible', true)}
              >
                Add to dashboard
              </Button>
            }
          />

          <Modal
            key='modal'
            title='Save Chart'
            visible={visible}
            onOk={async () => {
              this.onChange('visible', false);
              this.handleSubmit();
            }}
            onCancel={() => this.setTitleModalVisible(false)}
          >
            <Input
              placeholder='Dashboard Item Name'
              value={name}
              onChange={e => onChange(e)}
            />
          </Modal>
        </ShadowedHeader>
        
        <ExploreQueryBuilder
          vizState={vizState}
          setVizState={this.setVizState}
          type={type}
          setType={this.setType}
        />
      </div>
    );
  }
}

export default Chart;
