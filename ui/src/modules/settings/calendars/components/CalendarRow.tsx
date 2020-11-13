import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Tip from 'modules/common/components/Tip';
import { IButtonMutateProps } from 'modules/common/types';
import React from 'react';
import CalendarForm from '../containers/CalendarForm';
import { ICalendar } from '../types';

type Props = {
  calendar: ICalendar;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (calendar: ICalendar) => void;
};

type State = {
  showModal: boolean;
};

class CalendarRow extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false
    };
  }

  renderExtraLinks() {
    const { remove, calendar } = this.props;

    const onClick = () => remove(calendar);

    const edit = () => {
      this.setState({ showModal: true });
    };

    return (
      <>
        <Tip text="Edit" placement="top">
          <Button btnStyle="link" onClick={edit} icon="edit-3" />
        </Tip>
        <Tip text="Delete">
          <Button btnStyle="link" onClick={onClick} icon="times-circle" />
        </Tip>
      </>
    );
  }

  renderEditForm() {
    const { renderButton, calendar } = this.props;

    const closeModal = () => {
      this.setState({ showModal: false });
    };

    return (
      <CalendarForm
        groupId={calendar.groupId || ''}
        renderButton={renderButton}
        calendar={calendar}
        closeModal={closeModal}
        show={this.state.showModal}
      />
    );
  }

  render() {
    const { calendar } = this.props;

    return (
      <tr>
        <td>{calendar.name}</td>
        <td>
          <ActionButtons>
            {this.renderExtraLinks()}
            {this.renderEditForm()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default CalendarRow;
