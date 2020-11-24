import dayjs from 'dayjs';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { IAccount, IEvent, INylasCalendar } from '../types';
import { milliseconds } from '../utils';
import { CalendarConsumer } from './Wrapper';

type Props = {
  isPopupVisible: boolean;
  onHideModal: (date?: Date) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  selectedDate?: Date;
  event?: IEvent;
  account?: IAccount;
};

type State = {
  calendars: INylasCalendar[];
  accountId?: string;
  selectedMemberIds: string[];
};

class EditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      calendars: [],
      selectedMemberIds: []
    };

    this.hideModal = this.hideModal.bind(this);
  }

  onChangeMembers = items => {
    this.setState({ selectedMemberIds: items });
  };

  renderHeader() {
    return (
      <Modal.Header closeButton={true}>
        <Modal.Title>
          {__(`${this.props.event ? 'Edit' : 'Create'}  Event`)}
        </Modal.Title>
      </Modal.Header>
    );
  }

  dateDefaulValue = (start?: boolean) => {
    const { selectedDate, event } = this.props;
    let day = dayjs(selectedDate || new Date()).set('hour', start ? 13 : 14);

    if (event && event.when) {
      const time = start ? event.when.start_time : event.when.end_time;
      day = dayjs(time ? milliseconds(time) : new Date());
    }

    return day.format('YYYY-MM-DD HH:mm');
  };

  onChangeAccount = (accounts, e: React.FormEvent<HTMLElement>) => {
    const selectedId = (e.target as HTMLInputElement).value;

    this.setCalendars(accounts, selectedId);
  };

  setCalendars = (accounts, selectedId) => {
    const account = accounts.find(acc => acc._id === selectedId);

    this.setState({
      calendars: account.calendars,
      accountId: account.accountId
    });
  };

  hideModal() {
    this.setState({ selectedMemberIds: [], calendars: [] });
    this.props.onHideModal();
  }

  renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, event, account } = this.props;
    const { selectedMemberIds } = this.state;

    const renderAccounts = () => {
      return (
        <CalendarConsumer>
          {({ accounts, currentUser }) => {
            let defaultValue = account && account._id;

            if (!defaultValue && currentUser) {
              const acc = accounts.find(cal => {
                return cal.isPrimary && cal.userId === currentUser._id;
              });

              defaultValue = acc && acc._id;
            }

            return (
              <FormGroup>
                <ControlLabel>Account</ControlLabel>

                <FormControl
                  componentClass="select"
                  onChange={this.onChangeAccount.bind(this, accounts)}
                  defaultValue={defaultValue}
                >
                  <option>Select account</option>
                  {accounts.map(acc => (
                    <option key={acc._id} value={acc._id}>
                      {acc.name}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
            );
          }}
        </CalendarConsumer>
      );
    };

    return (
      <>
        {renderAccounts()}

        <FormGroup>
          <ControlLabel required={true}>Calendar</ControlLabel>

          <FormControl
            {...formProps}
            name="calendarId"
            componentClass="select"
            defaultValue={event && event.providerCalendarId}
          >
            <option>Select calendar</option>
            {((account && account.calendars) || this.state.calendars)
              .filter(c => !c.readOnly)
              .map(calendar => (
                <option key={calendar._id} value={calendar.providerCalendarId}>
                  {calendar.name}
                </option>
              ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Title</ControlLabel>

          <FormControl
            {...formProps}
            name="title"
            autoFocus={true}
            required={true}
            defaultValue={event && event.title}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>

          <FormControl
            {...formProps}
            name="description"
            componentClass="textarea"
            rows={5}
            defaultValue={event && event.description}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Members</ControlLabel>

          <SelectTeamMembers
            {...formProps}
            label="Choose members"
            name="memberIds"
            value={selectedMemberIds}
            onSelect={this.onChangeMembers}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Start Date</ControlLabel>

          <FormControl
            {...formProps}
            name="start"
            componentClass="datetime-local"
            defaultValue={this.dateDefaulValue(true)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>End Date</ControlLabel>

          <FormControl
            {...formProps}
            name="end"
            componentClass="datetime-local"
            defaultValue={this.dateDefaulValue()}
          />
        </FormGroup>

        <ModalFooter>
          {renderButton({
            values: {
              ...values,
              accountId: this.state.accountId || (account && account.accountId),
              memberIds: selectedMemberIds
            },
            isSubmitted,
            callback: this.hideModal
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return (
      <Modal
        enforceFocus={false}
        show={this.props.isPopupVisible}
        onHide={this.hideModal}
        animation={false}
      >
        {this.renderHeader()}
        <Modal.Body>
          <Form renderContent={this.renderContent} />
        </Modal.Body>
      </Modal>
    );
  }
}

export default EditForm;
