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
import { ICalendar } from '../types';

type Props = {
  isPopupVisible: boolean;
  onHideModal: (date?: Date) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  selectedDate?: Date;
  calendars: ICalendar[];
};

class EditForm extends React.Component<Props, {}> {
  renderHeader() {
    return (
      <Modal.Header closeButton={true}>
        <Modal.Title>{__('Create Event')}</Modal.Title>
      </Modal.Header>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, onHideModal, selectedDate, calendars } = this.props;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Calendar</ControlLabel>

          <FormControl {...formProps} name="calendarId" componentClass="select">
            <option>Select calendar</option>
            {calendars.map(calendar => (
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
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>

          <FormControl
            {...formProps}
            name="description"
            componentClass="textarea"
            rows={5}
            defaultValue={''}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Start Date</ControlLabel>

          <FormControl
            {...formProps}
            name="start"
            componentClass="datetime-local"
            defaultValue={dayjs(selectedDate || new Date())
              .set('hour', 13)
              .format('YYYY-MM-DD HH:mm')}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>End Date</ControlLabel>

          <FormControl
            {...formProps}
            name="end"
            componentClass="datetime-local"
            defaultValue={dayjs(selectedDate || new Date())
              .set('hour', 14)
              .format('YYYY-MM-DD HH:mm')}
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
