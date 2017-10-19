import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from '../../layout/components';

class Inbox extends Component {
  render() {
    const Sidebar = Wrapper.Sidebar;
    const content = (
      <div
        className="scroll-area"
        ref={node => {
          this.node = node;
        }}
      >
        Welcome {this.props.title}
      </div>
    );

    const breadcrumb = [{ title: 'Inbox', link: '/inbox' }, { title: 'Conversation' }];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        content={content}
        footer={<div />}
        leftSidebar={
          <Sidebar wide>
            <Sidebar.Section>
              Section
            </Sidebar.Section>
          </Sidebar>
        }
        rightSidebar={
          <Wrapper.Sidebar >
            <Sidebar.Section>
              Section
            </Sidebar.Section>
          </Wrapper.Sidebar>
          }
      />
    );
  }
}

Inbox.propTypes = {
  title: PropTypes.string,
};

export default Inbox;
