import dayjs from 'dayjs';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { ICalendar, IEvent } from '../types';
import { milliseconds } from '../utils';

type Props = {
  isPopupVisible: boolean;
  onHideModal: (date?: Date) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  selectedDate?: Date;
  calendars: ICalendar[];
  event?: IEvent;
};

class EditForm extends React.Component<Props, {}> {
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

  renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, onHideModal, calendars, event } = this.props;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Calendar</ControlLabel>

          <FormControl
            {...formProps}
            name="calendarId"
            componentClass="select"
            defaultValue={event && event.providerCalendarId}
          >
            <option>Select calendar</option>
            {calendars
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
            values,
            isSubmitted,
            callback: onHideModal
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
        onHide={this.props.onHideModal}
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
