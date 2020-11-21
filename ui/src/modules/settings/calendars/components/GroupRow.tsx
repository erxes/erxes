import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { IButtonMutateProps } from 'modules/common/types';
import React from 'react';
import GroupForm from '../containers/GroupForm';
import { ICalendar, IGroup } from '../types';
import CalendarForm from './CalendarForm';

type Props = {
  group: IGroup;
  groups: IGroup[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (group: IGroup) => void;
  removeCalendar: (calendar: ICalendar) => void;
  renderCalendarButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  showModal: boolean;
  showCalendarModal: boolean;
  calendarId: string;
};

class GroupRow extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      showCalendarModal: false,
      calendarId: ''
    };
  }

  renderExtraLinks() {
    const { remove, group } = this.props;

    const onClick = () => remove(group);

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
    const { renderButton, group } = this.props;

    const closeModal = () => {
      this.setState({ showModal: false });
    };

    return (
      <GroupForm
        boardId={group.boardId || ''}
        renderButton={renderButton}
        group={group}
        closeModal={closeModal}
        show={this.state.showModal}
      />
    );
  }

  renderCalendarActions(calendar) {
    const { removeCalendar } = this.props;

    const onClick = () => removeCalendar(calendar);

    const edit = () => {
      this.setState({ showCalendarModal: true, calendarId: calendar._id });
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

  renderCalendarForm() {
    const { renderCalendarButton, group, groups } = this.props;
    const { showCalendarModal, calendarId } = this.state;

    const closeModal = () => {
      this.setState({ showCalendarModal: false, calendarId: '' });
    };

    return (
      <CalendarForm
        renderButton={renderCalendarButton}
        calendar={group.calendars.find(c => c._id === calendarId)}
        closeModal={closeModal}
        show={showCalendarModal}
        groups={groups}
      />
    );
  }

  render() {
    const { group } = this.props;

    return (
      <>
        <tr>
          <td>
            {group.name} ({group.calendars.length})
          </td>
          <td>
            <ActionButtons>{this.renderExtraLinks()}</ActionButtons>
          </td>
        </tr>
        {group.calendars.map((calendar, i) => (
          <tr key={calendar._id}>
            <td>
              &nbsp; <Icon icon={'circle'} style={{ color: calendar.color }} />{' '}
              {calendar.name}
            </td>
            <td>
              <ActionButtons>
                {this.renderCalendarActions(calendar)}
              </ActionButtons>
            </td>
          </tr>
        ))}

        {this.renderEditForm()}
        {this.renderCalendarForm()}
      </>
    );
  }
}

export default GroupRow;
