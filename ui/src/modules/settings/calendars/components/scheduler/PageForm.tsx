import { ICalendar as IAccountCalendar } from 'modules/calendar/types';
import Button from 'modules/common/components/Button';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { Step, Steps } from 'modules/common/components/step';
import {
  ControlWrapper,
  Indicator,
  StepWrapper
} from 'modules/common/components/step/styles';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import { __, Alert } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { Content, LeftContent } from 'modules/settings/integrations/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select-plus';
import { SchedulePageMutationVariables } from '../../types';
import {
  BookingFlow,
  CustomFields,
  Event,
  OpeningHours,
  PageStyles
} from './steps';
import { ScheduleAdditionalField } from './types';

type Props = {
  page?: any;
  accountId: string;
  calendars: IAccountCalendar[];
  save: (doc: SchedulePageMutationVariables) => void;
};

type State = {
  title: string;
  location: string;
  duration: number;
  cancellationPolicy?: string;

  calendarId: string;
  confirmationMethod?: string;

  timezone: string;

  additionalFields?: ScheduleAdditionalField[];

  companyName?: string;
  slug?: string;
  color: string;
  submitText?: string;
  thankYouText?: string;
};

class CreateSchedulePage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const calendar = props.calendars[0] || ({} as IAccountCalendar);

    this.state = {
      title: '',
      location: '',
      duration: 45,
      calendarId: calendar._id,
      confirmationMethod: 'automatic',
      color: '#9900ef',
      timezone: 'Asia/Ulaanbaatar'
    };
  }

  save = e => {
    e.preventDefault();

    const {
      title,
      slug,
      timezone,
      calendarId,
      location,
      duration,
      color,
      companyName,
      submitText,
      thankYouText,
      cancellationPolicy,
      confirmationMethod
    } = this.state;

    if (!title) {
      return Alert.error('Write title');
    }

    if (!location) {
      return Alert.error('Write location');
    }

    if (!slug) {
      return Alert.error('Write slug');
    }

    this.props.save({
      name: title,
      slug,
      timezone,
      calendarIds: [calendarId],
      event: {
        title,
        location,
        duration
      },
      appearance: {
        color,
        companyName,
        submitText,
        thankYouText
      },
      booking: {
        cancellationPolicy,
        confirmationMethod
      }
    });
  };

  onChange = <T extends keyof State>(key: T, value: State[T]) => {
    this.setState(({ [key]: value } as unknown) as Pick<State, keyof State>);

    if (['title', 'slug'].includes(key)) {
      const { title, duration } = this.state;

      this.setState({ slug: `${title.replace(/ /g, '-')}-${duration}` });
    }
  };

  renderButtons() {
    const cancelButton = (
      <Link to={`/settings/schedule`}>
        <Button btnStyle="simple" icon="times-circle" uppercase={false}>
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}
        <Button
          btnStyle="success"
          uppercase={false}
          onClick={this.save}
          icon="check-circle"
        >
          Save
        </Button>
      </Button.Group>
    );
  }

  renderOptions = array => {
    return array.map(obj => ({
      value: obj._id,
      label: obj.name
    }));
  };

  render() {
    const { calendars } = this.props;
    const {
      duration,
      location,
      title,
      cancellationPolicy,

      calendarId,

      timezone,

      confirmationMethod,

      additionalFields,

      companyName,
      slug,
      color,
      submitText,
      thankYouText
    } = this.state;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Calendar'), link: '/settings/calendars' },
      { title: __('Schedule'), link: `/settings/schedule` }
    ];

    const onChangeCalendar = item => this.setState({ calendarId: item.value });

    return (
      <StepWrapper>
        <Wrapper.Header title={__('Schedule')} breadcrumb={breadcrumb} />
        <Content>
          <LeftContent>
            <Steps>
              <Step img="/images/icons/erxes-07.svg" title="Event Info">
                <Event
                  onChange={this.onChange}
                  title={title}
                  duration={duration}
                  location={location}
                  cancellationPolicy={cancellationPolicy}
                />
              </Step>
              <Step img="/images/icons/erxes-21.svg" title="Calendars">
                <FlexItem>
                  <LeftItem>
                    <FormGroup>
                      <ControlLabel>
                        Which calendar should be used for availability and
                        booking?
                      </ControlLabel>

                      <Select
                        placeholder={__('Choose a group')}
                        value={calendarId}
                        options={this.renderOptions(calendars)}
                        onChange={onChangeCalendar}
                        clearable={false}
                      />
                    </FormGroup>
                  </LeftItem>
                </FlexItem>
              </Step>

              <Step img="/images/icons/erxes-20.svg" title="Opening Hours">
                <OpeningHours onChange={this.onChange} timezone={timezone} />
              </Step>

              <Step img="/images/icons/erxes-16.svg" title="Booking flow">
                <BookingFlow
                  onChange={this.onChange}
                  confirmationMethod={confirmationMethod}
                />
              </Step>

              <Step img="/images/icons/erxes-18.svg" title="Custom fields">
                <CustomFields
                  onChange={this.onChange}
                  additionalFields={additionalFields}
                />
              </Step>

              <Step img="/images/icons/erxes-12.svg" title="Page Styles">
                <PageStyles
                  onChange={this.onChange}
                  companyName={companyName}
                  slug={slug}
                  color={color}
                  submitText={submitText}
                  thankYouText={thankYouText}
                />
              </Step>
            </Steps>
            <ControlWrapper>
              <Indicator>
                {__('You are')} {this.props.page ? 'editing' : 'creating'}{' '}
                <strong /> {__('page')}
              </Indicator>
              {this.renderButtons()}
            </ControlWrapper>
          </LeftContent>
        </Content>
      </StepWrapper>
    );
  }
}

export default CreateSchedulePage;
