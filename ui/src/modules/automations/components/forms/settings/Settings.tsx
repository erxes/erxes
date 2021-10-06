import React from 'react';
import {
  LeftSidebar,
  SettingsContent,
  SettingsLayout,
  SpecificTimeContainer,
  DateControlWrapper
} from 'modules/automations/styles';
import FormGroup from 'modules/common/components/form/Group';
import FormControl from 'modules/common/components/form/Control';
import { __ } from 'modules/common/utils';
import OnlineHours from 'modules/settings/integrations/components/messenger/steps/OnlineHours';
import DateControl from 'modules/common/components/form/DateControl';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import dayjs from 'dayjs';
import UnEnrollment from 'modules/automations/containers/forms/settings/UnEnrollment';

type Props = {
  hours: any[];
};

type State = {
  currentTab: string;
  time: string;
  selectedOption: any;
  hours: any[];
  date: any;
  dates: any[];
  isAnnulay: boolean;
};

class Settings extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'general',
      time: 'any',
      hours: (props.hours || []).map(hour => ({ ...hour })),
      selectedOption: {},
      date: dayjs(new Date()).format('YYYY-MM-DD'),
      dates: [],
      isAnnulay: false
    };
  }

  onClickTab = (currentTab: string) => {
    this.setState({ currentTab });
  };

  onChangeTimeType = e => {
    this.setState({ time: e.target.value });
  };

  onChangeAnnually = e => {
    this.setState({ isAnnulay: e.target.checked });
  };

  onChangeHours = hours => {
    this.setState({ hours });
  };

  onDateChange = date => {
    this.setState({ date });
  };

  handleSelect = selectedOption => {
    console.log(`Selected: ${selectedOption.label}`);
  };

  add = () => {
    const { dates } = this.state;

    dates.push({
      _id: Math.random().toString(),
      name: ''
    });

    this.setState({ dates });
  };

  onRemove = dateId => {
    let dates = this.state.dates;

    dates = dates.filter(date => date._id !== dateId);

    this.setState({ dates });
  };

  renderSpecificTime() {
    const { time } = this.state;

    if (time !== 'specific') {
      return null;
    }

    return (
      <SpecificTimeContainer>
        <OnlineHours
          prevOptions={this.props.hours || []}
          onChange={this.onChangeHours}
        />
      </SpecificTimeContainer>
    );
  }

  renderDate(item) {
    const remove = () => {
      this.onRemove(item._id);
    };

    return (
      <div className="date-row">
        <DateControl
          value={this.state.date}
          required={false}
          name="date"
          onChange={date => this.onDateChange(date)}
          placeholder={'Start date'}
          dateFormat={'YYYY-MM-DD'}
        />

        <FormControl
          componentClass="checkbox"
          value={this.state.isAnnulay}
          onChange={this.onChangeAnnually}
        >
          {__('Annually')}
        </FormControl>

        <Button size="small" btnStyle="danger" onClick={remove}>
          <Icon icon="cancel-1" />
        </Button>
      </div>
    );
  }

  renderContent() {
    const { currentTab } = this.state;

    if (currentTab === 'general') {
      return (
        <div>
          <h3>{currentTab}</h3>
          <div>
            <p>{'What times do you want the actions to execute'}?</p>
            <FormGroup>
              <FormControl
                componentClass="checkbox"
                value="any"
                onChange={this.onChangeTimeType}
                inline={true}
              >
                {__('Any time')}
              </FormControl>

              <FormControl
                componentClass="checkbox"
                value="specific"
                onChange={this.onChangeTimeType}
                inline={true}
              >
                {__('Specific times')}
              </FormControl>
            </FormGroup>
            {this.renderSpecificTime()}
          </div>

          <div>
            <p>
              {
                'What upcoming dates do you want to pause actions from executing?'
              }
              ?
            </p>
            <DateControlWrapper>
              {this.state.dates.map((date, index) => (
                <React.Fragment key={index}>
                  {this.renderDate(date)}
                </React.Fragment>
              ))}
              <Button
                btnStyle="success"
                size="small"
                onClick={this.add}
                icon="add"
              >
                Add another dates
              </Button>
            </DateControlWrapper>
          </div>
        </div>
      );
    }

    return <UnEnrollment />;
  }

  render() {
    const { currentTab } = this.state;

    return (
      <SettingsLayout>
        <LeftSidebar>
          <li
            className={currentTab === 'general' ? 'active' : ''}
            onClick={this.onClickTab.bind(this, 'general')}
          >
            General
          </li>
          <li
            className={currentTab === 'suppression' ? 'active' : ''}
            onClick={this.onClickTab.bind(this, 'suppression')}
          >
            Unenrollment and Suppression
          </li>
        </LeftSidebar>
        <SettingsContent>{this.renderContent()}</SettingsContent>
      </SettingsLayout>
    );
  }
}

export default Settings;
