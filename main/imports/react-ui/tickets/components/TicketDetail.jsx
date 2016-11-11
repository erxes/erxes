import React, { PropTypes, Component } from 'react';
import { ButtonGroup, Button, MenuItem } from 'react-bootstrap';
import Sidebar from './Sidebar.jsx';
import Reply from '../containers/Reply';
import { Wrapper } from '/imports/react-ui/layout/components';


const propTypes = {
  comments: PropTypes.array.isRequired,
  ticket: PropTypes.object.isRequired,
};

class TicketDetails extends Component {
  constructor(props) {
    super(props);

    this.renderComments = this.renderComments.bind(this);
  }

  renderComments() {
    return this.props.comments.map((comment) => {
      const {
        _id,
        content,
      } = comment;
      return (
        <tr key={_id}>
          <td>
              {content}
          </td>
          <td>
          </td>
        </tr>
      );
    });
  }

  render() {
    const { ticket } = this.props;

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
      <div>
        <p>{ticket.content}</p>
        <table className="table">
          <thead>
            <tr>
              <th>Comments</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.renderComments()}
          </tbody>
        </table>
        <Reply ticket={ticket} />
      </div>
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

TicketDetails.propTypes = propTypes;

export default TicketDetails;
