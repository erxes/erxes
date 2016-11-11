import React, { PropTypes, Component } from 'react';
import { ButtonGroup, Button, MenuItem } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from './Sidebar.jsx';


const propTypes = {
  tickets: PropTypes.array.isRequired,
};

class TicketList extends Component {
  constructor(props) {
    super(props);

    this.renderTickets = this.renderTickets.bind(this);
  }

  renderTickets() {
    return this.props.tickets.map((ticket) => {
      const {
        _id,
        content,
      } = ticket;
      return (
        <tr key={_id}>
          <td>
            <a href={`/tickets/detail/${_id}`}>
              {content}
            </a>
          </td>
          <td>
          </td>
        </tr>
      );
    });
  }

  render() {
    const header = (
      <Wrapper.Header
        title="Tickets"
        description="Lovely tickets are here"
      >
        <MenuItem href="#">Action</MenuItem>
        <MenuItem href="#">Action</MenuItem>
        <MenuItem href="#">Action</MenuItem>
        <MenuItem divider />
        <MenuItem href="#">Action</MenuItem>
      </Wrapper.Header>
    );

    const actionBar = (
      <ButtonGroup bsSize="small">
        <Button href="#" bsSize="sm">[No action]</Button>
      </ButtonGroup>
    );

    const content = (
      <table className="table">
        <thead>
          <tr>
            <th>Content</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {this.renderTickets()}
        </tbody>
      </table>
    );

    return (
      <div>
        <Wrapper
          header={header}
          sidebar={<Sidebar />}
          actionBar={actionBar}
          content={content}
        />
      </div>
    );
  }
}

TicketList.propTypes = propTypes;

export default TicketList;
