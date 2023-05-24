import Button from '../../common/Button';
import { HeaderWrapper } from '../../styles/main';
import Modal from '../../common/Modal';
import React from 'react';
import TaskForm from '../containers/Form';
import { GroupBy } from '../../types';
import { Dropdown } from 'react-bootstrap';
import DropdownToggle from '../../common/DropdownToggle';

type Props = {
  taskLabel: string;
  setGroupBy: any;
};

type State = {
  show: boolean;
  currentGroupBy: string;
};

export default class TaskHeader extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      currentGroupBy: 'List'
    };
  }

  showModal = () => {
    this.setState({ show: !this.state.show });
  };

  render() {
    const { setGroupBy } = this.props;
    const { show } = this.state;

    const groupBys: GroupBy[] = [
      { groupBy: 'List', setGroupBy: 'normal' },
      { groupBy: 'Stage', setGroupBy: 'stage' },
      { groupBy: 'Label', setGroupBy: 'label' },
      { groupBy: 'Priority', setGroupBy: 'priority' },
      { groupBy: 'Due Date', setGroupBy: 'duedate' },
      { groupBy: 'Assigned User', setGroupBy: 'user' }
    ];

    return (
      <>
        <HeaderWrapper>
          <h4>{this.props.taskLabel}</h4>
          <div className="right">
            <Button
              btnStyle="success"
              uppercase={false}
              onClick={this.showModal}
              icon="add"
            >
              Create a New Task
            </Button>
          </div>

          <Dropdown>
            <Dropdown.Toggle
              as={DropdownToggle}
              id="dropdown-custom-components"
            >
              <Button btnStyle="primary" uppercase={false} icon="filter">
                {this.state.currentGroupBy}
              </Button>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {groupBys.map(groupBy => (
                <Dropdown.Item
                  key={groupBy.groupBy}
                  className="d-flex align-items-center justify-content-between"
                  eventKey="1"
                  onClick={() => {
                    setGroupBy(groupBy.setGroupBy);
                    this.setState({ currentGroupBy: groupBy.groupBy });
                  }}
                >
                  {groupBy.groupBy}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </HeaderWrapper>
        <Modal
          content={() => <TaskForm closeModal={this.showModal} />}
          onClose={this.showModal}
          isOpen={show}
        />
      </>
    );
  }
}
