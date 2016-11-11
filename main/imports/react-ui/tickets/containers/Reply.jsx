import React from 'react';
import Alert from 'meteor/erxes-notifier';
import { addComment } from '/imports/api/tickets/methods';


export default class Reply extends React.Component {
  constructor(props) {
    super(props);

    this.state = { content: null };
    this.submit = this.submit.bind(this);
  }

  submit(e) {
    e.preventDefault();

    const elm = this.refs.content;

    const comment = {
      content: elm.value,
      ticketId: this.props.ticket._id,
      internal: false,
    };

    addComment.call(comment, (error) => {
      if (error) {
        return Alert.error('Can\'t reply', error.reason);
      }

      elm.value = '';
    });
  }

  render() {
    return (
      <div>
        <h1 className="title">Channel form</h1>
        <form onSubmit={this.submit}>
          <textarea
            ref='content'
            required>
          </textarea>
          <button>Reply</button>
        </form>
      </div>
    );
  }
}

Reply.propTypes = {
  ticket: React.PropTypes.object.isRequired,
};
