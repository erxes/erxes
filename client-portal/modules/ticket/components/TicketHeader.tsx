import Button from '../../common/Button';
import { HeaderWrapper } from '../../styles/main';
import Icon from '../../common/Icon';
import Modal from '../../common/Modal';
import React from 'react';
import TicketForm from '../containers/Form';

import { Dropdown } from 'react-bootstrap';
import DropdownToggle from '../../common/DropdownToggle';

type Props = {
  ticketLabel: string;
  mode: any;
  setMode: any;
};

type State = {
  show: boolean;
};

export default class TicketHeader extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      show: false
    };
  }

  showModal = () => {
    this.setState({ show: !this.state.show });
  };

  render() {
    const { show } = this.state;
    const { setMode, mode } = this.props;

    return (
      <>
        <HeaderWrapper>
          <h4>{this.props.ticketLabel}</h4>
          <div className='right'>
            <Button
              btnStyle='success'
              uppercase={false}
              onClick={this.showModal}
              icon='add'
            >
              Create a New Ticket
            </Button>
          </div>

          <Dropdown>
            <Dropdown.Toggle
              as={DropdownToggle}
              id='dropdown-custom-components'
            >
              <Button btnStyle='success' uppercase={false} icon='filter'>
                LIST
              </Button>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item
                className='d-flex align-items-center justify-content-between'
                eventKey='1'
                onClick={() => {
                  setMode('stage');
                }}
              >
                Stage
              </Dropdown.Item>
              <Dropdown.Item
                className='d-flex align-items-center justify-content-between'
                eventKey='1'
                onClick={() => {
                  setMode('label');
                }}
              >
                <div>Label</div>
              </Dropdown.Item>
              <Dropdown.Item
                className='d-flex align-items-center justify-content-between'
                eventKey='1'
                onClick={() => {
                  setMode('priority');
                }}
              >
                <div>Priority</div>
              </Dropdown.Item>
              <Dropdown.Item
                eventKey='4'
                onClick={() => {
                  setMode('duedate');
                }}
              >
                Due Date
              </Dropdown.Item>

              <Dropdown.Item
                eventKey='5'
                onClick={() => {
                  setMode('user');
                }}
              >
                Assigned user
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </HeaderWrapper>
        <Modal
          content={() => <TicketForm closeModal={this.showModal} />}
          onClose={this.showModal}
          isOpen={show}
        />
      </>
    );
  }
}
