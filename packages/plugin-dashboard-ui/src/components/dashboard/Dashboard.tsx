import { __ } from 'coreui/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import { IDashboard, IDashboardItem } from '../../types';

import Modal from 'react-bootstrap/Modal';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import {
  BackButton,
  Title,
  DashboardFormContainer,
  ActionBarButtonsWrapper,
  DragField,
  CenterBar,
  SelectMemberStyled,
  ChartTitle
} from '../../styles';
import { ControlLabel, FormControl } from '@erxes/ui/src/components/form';
import { BarItems, HeightedWrapper } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import PageContent from '@erxes/ui/src/layout/components/PageContent';
import { Link } from 'react-router-dom';
import { FlexContent } from '@erxes/ui-log/src/activityLogs/styles';
import DashboardItem from './DashboardItem';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import { Alert } from '@erxes/ui/src/utils';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import Participators from './Participators';
import { IUser } from '@erxes/ui/src/auth/types';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import Form from '@erxes/ui/src/components/form/Form';
import ChartForm from '../../containers/dashboard/ChartForm';

const deserializeItem = i => ({
  ...i,
  layout: JSON.parse(i.layout) || {},
  vizState: JSON.parse(i.vizState)
});

const defaultLayout = i => ({
  x: i.layout.x || 0,
  y: i.layout.y || 0,
  w: i.layout.w || 3,
  h: i.layout.h || 3,
  minW: 1,
  minH: 1
});

type Props = {
  dashboard: IDashboard;
  dashboardItems: IDashboardItem[];
  removeDashboardItem: (itemId: string) => void;
  editDashboardItem: (doc: { _id: string; layout: string }) => void;
  save: (params: any) => void;
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
  isPublic: boolean;
  showTeamMemberSelect: boolean;
  selectedMemberIds: string[];
  item?: IDashboardItem;
};

class Dashboard extends React.Component<Props, State> {
  private wrapperRef;

  constructor(props) {
    super(props);

    const { dashboard } = this.props;

    const visibility = dashboard ? dashboard.visibility : 'public';

    this.state = {
      isDragging: false,
      name: dashboard.name,
      showEdit: false,
      showDrawer: false,
      isPublic: visibility === 'public' ? true : false,
      showTeamMemberSelect: false,
      selectedMemberIds: dashboard.selectedMemberIds || []
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

  handleSubmit = () => {
    const { name } = this.state;
    const { dashboard, save } = this.props;

    if (!name || name === 'Your dashboard title') {
      return Alert.error('Enter an Dashboard title');
    }

    const generateValues = () => {
      const finalValues = {
        _id: dashboard._id,
        name
      };

      return finalValues;
    };

    return save(generateValues());
  };

  onNameChange = (e: React.FormEvent<HTMLElement>) => {
    const value = (e.currentTarget as HTMLButtonElement).value;
    this.setState({ name: value });
  };

  switchVisiblitybarTab = visibility => {
    const { dashboard, save } = this.props;

    this.setState({ isPublic: visibility === 'public' ? true : false });

    save({ _id: dashboard._id, visibility });
  };

  rendeRightActionBar() {
    const { isPublic } = this.state;

    const { dashboard } = this.props;

    const members = dashboard.members || ([] as IUser[]);

    const onClickButton = () => {
      this.setState({ showTeamMemberSelect: true });
    };

    return (
      <BarItems>
        {!isPublic ? (
          <>
            <Button
              btnStyle="link"
              size="small"
              icon={'check-circle'}
              onClick={onClickButton}
            >
              {__('Select  members')}
            </Button>
            <Participators participatedUsers={members} limit={100} />
          </>
        ) : null}

        <ActionBarButtonsWrapper>
          {this.renderButtons()}
          <Button
            btnStyle="success"
            size="small"
            icon={'check-circle'}
            onClick={this.handleSubmit}
          >
            {__('Save')}
          </Button>
        </ActionBarButtonsWrapper>
      </BarItems>
    );
  }

  renderLeftActionBar() {
    const { name, isPublic } = this.state;

    return (
      <FlexContent>
        <Link to={`/dashboard`}>
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

        <CenterBar>
          <Tabs full={true}>
            <TabTitle
              className={isPublic ? 'public' : ''}
              onClick={this.switchVisiblitybarTab.bind(this, 'public')}
            >
              {__('Public')}
            </TabTitle>
            <TabTitle
              className={isPublic ? '' : 'public'}
              onClick={this.switchVisiblitybarTab.bind(this, 'private')}
            >
              {__('Private')}
            </TabTitle>
          </Tabs>
        </CenterBar>
      </FlexContent>
    );
  }

  toggleDrawer = () => {
    const { showDrawer } = this.state;

    this.setState(
      {
        item: {} as IDashboardItem
      },
      () => {
        this.setState({ showDrawer: !showDrawer });
      }
    );
  };

  renderButtons() {
    return (
      <>
        <Button
          btnStyle="primary"
          size="small"
          icon="plus-circle"
          onClick={this.toggleDrawer}
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

  onChangeMembers = selectedMemberIds => {
    this.setState({ selectedMemberIds });
  };

  onCancel = () => {
    this.setState({ showTeamMemberSelect: false });
  };

  onConfirm = () => {
    const { dashboard, save } = this.props;
    const { selectedMemberIds } = this.state;

    save({ _id: dashboard._id, selectedMemberIds });
    this.setState({ showTeamMemberSelect: false });
  };

  removeDashboardItem = itemId => {
    return this.props.removeDashboardItem(itemId);
  };

  editDashboardItem = item => {
    this.setState(
      {
        item
      },
      () => {
        this.setState({ showDrawer: true });
      }
    );
  };

  render() {
    const { dashboard, dashboardItems, dashboardId } = this.props;
    const { showTeamMemberSelect, selectedMemberIds } = this.state;

    const haveChart = dashboardItems.length > 0 ? true : false;

    const dashboardItem = item => {
      if (item.layout) {
        return (
          <div key={item._id} data-grid={defaultLayout(item)}>
            <ChartTitle>
              <div>{item.name}</div>
              <span
                className="db-item-action"
                onClick={this.editDashboardItem.bind(this, item)}
              >
                edit
              </span>
              <span
                className="db-item-action"
                onClick={this.removeDashboardItem.bind(this, item._id)}
              >
                delete
              </span>
            </ChartTitle>
            <DashboardItem item={item} />
          </div>
        );
      }
      return;
    };

    return (
      <>
        <Modal
          show={showTeamMemberSelect}
          onHide={this.onCancel}
          centered={true}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Body>
            <Form
              renderContent={() => (
                <FormGroup>
                  <SelectMemberStyled zIndex={2002}>
                    <ControlLabel>Members</ControlLabel>

                    <SelectTeamMembers
                      label="Choose members"
                      name="selectedMemberIds"
                      initialValue={selectedMemberIds}
                      onSelect={this.onChangeMembers}
                    />
                  </SelectMemberStyled>
                </FormGroup>
              )}
            />
            <ModalFooter>
              <Button
                btnStyle={'simple'}
                onClick={this.onCancel}
                icon="times-circle"
                uppercase={false}
              >
                cancel
              </Button>
              <Button
                btnStyle="success"
                onClick={this.onConfirm}
                icon="check-circle"
                uppercase={false}
              >
                Save
              </Button>
            </ModalFooter>
          </Modal.Body>
        </Modal>
        <HeightedWrapper>
          <DashboardFormContainer>
            <Wrapper.Header
              title={`${(dashboard && dashboard.name) || 'Dashboard'}`}
              breadcrumb={[
                { title: __('Dashboar1d'), link: '/dashboard' },
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
                  haveChart={haveChart}
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
                <ChartForm
                  item={this.state.item}
                  showDrawer={this.state.showDrawer}
                  dashboardId={dashboardId}
                  toggleDrawer={this.toggleDrawer}
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
