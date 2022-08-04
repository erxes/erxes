import { __ } from 'coreui/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import { IDashboard, IDashboardItem } from '../../types';
import RTG from 'react-transition-group';
import {
  BackButton,
  Title,
  DashboardFormContainer,
  ActionBarButtonsWrapper,
  DragField,
  RightDrawerContainer
} from '../../styles';
import { FormControl } from '@erxes/ui/src/components/form';
import { BarItems, HeightedWrapper } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import PageContent from '@erxes/ui/src/layout/components/PageContent';
import { Link } from 'react-router-dom';
import { FlexContent } from '@erxes/ui/src/activityLogs/styles';
import DashboardItem from './DashboardItem';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import ChartFrom from '../explore/ChartForm';

const deserializeItem = i => ({
  ...i,
  layout: JSON.parse(i.layout) || {},
  vizState: JSON.parse(i.vizState)
});

const defaultLayout = i => ({
  x: i.layout.x || 0,
  y: i.layout.y || 0,
  w: i.layout.w || 1,
  h: i.layout.h || 1,
  minW: 1,
  minH: 1
});

type Props = {
  dashboard: IDashboard;
  dashboardItems: IDashboardItem[];
  removeDashboardItem: (itemId: string) => void;
  editDashboardItem: (doc: { _id: string; layout: string }) => void;
  save?: (params: any) => void;
  saveLoading?: boolean;
  dashboardId: string;
  history: any;
  queryParams: any;
};

type State = {
  isDragging: boolean;
  name: string;
  showEdit: boolean;
  showDrawer: boolean;
};

class Dashboard extends React.Component<Props, State> {
  private wrapperRef;

  constructor(props) {
    super(props);

    const { dashboard } = this.props;

    this.state = {
      isDragging: false,
      name: dashboard.name,
      showEdit: false,
      showDrawer: false
    };
  }

  setWrapperRef = node => {
    this.wrapperRef = node;
  };

  setIsDragging = value => {
    this.setState({ isDragging: value });
  };

  onLayoutChange = newLayout => {
    const { dashboardItems, editDashboardItem } = this.props;

    newLayout.forEach(l => {
      const item = dashboardItems.find(i => i._id.toString() === l.i);
      const toUpdate = JSON.stringify({
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h
      });

      if (item && toUpdate !== item.layout) {
        editDashboardItem({
          _id: item._id,
          layout: toUpdate
        });
      }
    });
  };

  // handleSubmit = () => {
  //   const { name } = this.state;
  //   const { dashboard, save } = this.props;

  //   if (!name || name === 'Your dashboard title') {
  //     return Alert.error('Enter an Automation title');
  //   }

  //   const generateValues = () => {
  //     const finalValues = {
  //       _id: dashboard._id,
  //       name
  //     };

  //     return finalValues;
  //   };

  //   return save(generateValues());
  // };

  onNameChange = (e: React.FormEvent<HTMLElement>) => {
    const value = (e.currentTarget as HTMLButtonElement).value;
    this.setState({ name: value });
  };

  rendeRightActionBar() {
    return (
      <BarItems>
        <ActionBarButtonsWrapper>
          {this.renderButtons()}
          <Button
            btnStyle="success"
            size="small"
            icon={'check-circle'}
            // onClick={this.handleSubmit}
          >
            {__('Save')}
          </Button>
        </ActionBarButtonsWrapper>
      </BarItems>
    );
  }

  renderLeftActionBar() {
    const { name } = this.state;

    return (
      <FlexContent>
        <Link to={`/dashboards`}>
          <BackButton>
            <Icon icon="angle-left" size={20} />
          </BackButton>
        </Link>
        <Title>
          <FormControl
            name="name"
            value={name}
            onChange={this.onNameChange}
            required={true}
            autoFocus={true}
          />
          <Icon icon="edit-alt" size={16} />
        </Title>
      </FlexContent>
    );
  }

  toggleDrawer = (_type: string) => {
    const { showDrawer } = this.state;

    this.setState({ showDrawer: !showDrawer });
  };

  renderButtons() {
    return (
      <>
        <Button
          btnStyle="primary"
          size="small"
          icon="plus-circle"
          onClick={this.toggleDrawer.bind(this, 'triggers')}
        >
          Add a chart
        </Button>
      </>
    );
  }

  showEdit = () => {
    if (this.state.showEdit) {
      return (
        <>
          <TextInfo hugeness="big">edit</TextInfo>
          <TextInfo hugeness="big" textStyle="danger">
            delete
          </TextInfo>
        </>
      );
    }

    return;
  };

  onMouseOver = () => {
    this.setState({ showEdit: true });
  };

  onMouseOut = () => {
    this.setState({ showEdit: false });
  };

  render() {
    const { dashboard, dashboardItems, dashboardId } = this.props;

    const dashboardItem = item => {
      if (item.layout) {
        return (
          <div key={item._id} data-grid={defaultLayout(item)}>
            <DashboardItem item={item} />
          </div>
        );
      }
      return;
    };

    return (
      <>
        <HeightedWrapper>
          <DashboardFormContainer>
            <Wrapper.Header
              title={`${(dashboard && dashboard.name) || 'Automation'}`}
              breadcrumb={[
                { title: __('Dashboar1d'), link: '/dashboards' },
                { title: `${(dashboard && dashboard.name) || ''}` }
              ]}
            />
            <PageContent
              actionBar={
                <Wrapper.ActionBar
                  left={this.renderLeftActionBar()}
                  right={this.rendeRightActionBar()}
                />
              }
              transparent={false}
            >
              {!this.state.showDrawer ? (
                <DragField
                  cols={6}
                  margin={[30, 30]}
                  containerPadding={[30, 30]}
                  onDragStart={() => this.setIsDragging(true)}
                  onDragStop={() => this.setIsDragging(false)}
                  onResizeStart={() => this.setIsDragging(true)}
                  onResizeStop={() => this.setIsDragging(false)}
                  rowHeight={160}
                  onLayoutChange={this.onLayoutChange}
                  isDragging={this.state.isDragging}
                  useCSSTransforms={true}
                >
                  {dashboardItems.map(deserializeItem).map(dashboardItem)}
                </DragField>
              ) : null}
              {this.state.showDrawer ? (
                <ChartFrom
                  showDrawer={this.state.showDrawer}
                  item={dashboardItems[0]}
                  vizState={dashboardItem[0]}
                />
              ) : null}
            </PageContent>
          </DashboardFormContainer>
        </HeightedWrapper>
      </>
    );
  }
}

export default Dashboard;
