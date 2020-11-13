import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import Table from 'modules/common/components/table';
import { Count, Title } from 'modules/common/styles/main';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { withRouter } from 'react-router-dom';
import { CALENDAR_INTEGRATIONS } from '../constants';
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
  customLink: (kind: string) => void;
} & IRouterProps;

type State = {
  showModal: boolean;
  calendars: ICalendar[];
};

class Calendars extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { history } = props;

    const showModal = history.location.hash.includes('showCalendarModal');

    this.state = {
      showModal,
      calendars: props.calendars
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

  addCalendar = (kind: string) => {
    this.props.customLink(kind);
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

  addButton() {
    const { groupId } = this.props;

    if (!groupId) {
      return null;
    }

    return (
      <>
        <Dropdown className="dropdown-btn" alignRight={true}>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-customize">
            <Button btnStyle="simple" size="small">
              {__('Add calendar ')} <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {CALENDAR_INTEGRATIONS.map(i => (
              <li key={i.kind}>
                <a
                  href={`#${i.kind}`}
                  onClick={this.addCalendar.bind(this, i.kind)}
                >
                  {i.name}
                </a>
              </li>
            ))}
          </Dropdown.Menu>
        </Dropdown>
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
        <Wrapper.ActionBar left={leftActionBar} right={this.addButton()} />

        {this.renderContent()}
        {this.renderAddForm()}
      </div>
    );
  }
}

export default withRouter(Calendars);
