import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from '../../layout/components';

class Inbox extends Component {
  render() {
    const content = (
      <div
        className="scroll-area"
        ref={node => {
          this.node = node;
        }}
      >
        <div className="margined">
          Welcome {this.props.title}
        </div>
      </div>
    );

    const breadcrumb = [{ title: 'Inbox', link: '/inbox' }, { title: 'Conversation' }];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        content={content}
      />
    );
  }
}

Inbox.propTypes = {
  title: PropTypes.string,
};

export default Inbox;
