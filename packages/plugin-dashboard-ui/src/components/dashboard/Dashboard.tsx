import { __, Alert } from 'coreui/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import { IDashboard } from '../../types';
import {
  BackButton,
  Title,
  AutomationFormContainer,
  ActionBarButtonsWrapper
} from '../../styles';
import { FormControl } from '@erxes/ui/src/components/form';
import { BarItems, HeightedWrapper } from '@erxes/ui/src/layout/styles';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import PageContent from '@erxes/ui/src/layout/components/PageContent';
import { Link } from 'react-router-dom';
import { FlexContent } from '@erxes/ui/src/activityLogs/styles';

type Props = {
  dashboard: IDashboard;
  save?: (params: any) => void;
  saveLoading?: boolean;
  dashboardId: string;
  history: any;
  queryParams: any;
};

type State = {
  name: string;
};

class Dashboard extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { dashboard } = this.props;

    this.state = {
      name: dashboard.name
    };
  }

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

  render() {
    const { dashboard } = this.props;

    return (
      <>
        <HeightedWrapper>
          <AutomationFormContainer>
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
              <div>a</div>
            </PageContent>
          </AutomationFormContainer>
        </HeightedWrapper>
      </>
    );
  }
}

export default Dashboard;
