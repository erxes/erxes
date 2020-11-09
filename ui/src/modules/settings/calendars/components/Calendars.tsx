import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import Table from 'modules/common/components/table';
import { Count, Title } from 'modules/common/styles/main';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { withRouter } from 'react-router-dom';
import CalendarForm from '../containers/CalendarForm';
import { ICalendar, IGroup } from '../types';
import CalendarRow from './CalendarRow';

type Props = {
  calendars: ICalendar[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  updateOrder?: any;
  remove: (calendar: ICalendar) => void;
  groupId?: string;
  refetch: ({ groupId }: { groupId?: string }) => Promise<any>;
  currentGroup?: IGroup;
} & IRouterProps;

type State = {
  showModal: boolean;
  calendars: ICalendar[];
  isDragDisabled: boolean;
};

class Calendars extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { history } = props;

    const showModal = history.location.hash.includes('showCalendarModal');

    this.state = {
      showModal,
      calendars: props.calendars,
      isDragDisabled: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.calendars !== this.props.calendars) {
      this.setState({ calendars: nextProps.calendars });
    }
  }

  renderAddForm = () => {
    const { groupId, renderButton } = this.props;

    const closeModal = () => this.setState({ showModal: false });

    return (
      <CalendarForm
        groupId={groupId}
        renderButton={renderButton}
        show={this.state.showModal}
        closeModal={closeModal}
      />
    );
  };

  addCalendar = () => {
    this.setState({
      showModal: true
    });
  };

  onTogglePopup = () => {
    const { isDragDisabled } = this.state;

    this.setState({ isDragDisabled: !isDragDisabled });
  };

  renderRows() {
    const { renderButton } = this.props;
    const { calendars } = this.state;

    return calendars.map(calendar => (
      <CalendarRow
        key={calendar._id}
        calendar={calendar}
        renderButton={renderButton}
        remove={this.props.remove}
        onTogglePopup={this.onTogglePopup}
      />
    ));
  }

  renderContent() {
    const { calendars } = this.props;

    if (calendars.length === 0) {
      return (
        <EmptyState
          text={`Get started on your calendar`}
          image="/images/actions/16.svg"
        />
      );
    }

    return (
      <>
        <Count>
          {calendars.length} {__('calendar')}
          {calendars.length > 1 && 's'}
        </Count>
        <Table>
          <thead>
            <tr>
              <th>{__('calendar')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRows()}</tbody>
        </Table>
      </>
    );
  }

  renderButton() {
    const { groupId } = this.props;

    if (!groupId) {
      return null;
    }

    return (
      <>
        <Button
          btnStyle="primary"
          uppercase={false}
          icon="plus-circle"
          onClick={this.addCalendar}
        >
          Add calendar
        </Button>
      </>
    );
  }

  render() {
    const { currentGroup } = this.props;

    const leftActionBar = (
      <Title>{currentGroup ? currentGroup.name : ''}</Title>
    );

    return (
      <div id="calendars-content">
        <Wrapper.ActionBar left={leftActionBar} right={this.renderButton()} />

        {this.renderContent()}
        {this.renderAddForm()}
      </div>
    );
  }
}

export default withRouter(Calendars);
