import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RightSidebar from './RightSidebar';
import LeftSidebar from './LeftSidebar';
import { Wrapper } from '../../layout/components';
import {
  Button,
  Label,
  Icon,
  FormControl,
  ControlLabel
} from '../../common/components';
import Conversation from './conversation/Conversation';

class Inbox extends Component {
  componentDidMount() {
    this.node.scrollTop = this.node.scrollHeight;
  }

  componentDidUpdate() {
    this.node.scrollTop = this.node.scrollHeight;
  }

  render() {
    const { conversations, messages, user } = this.props;
    const actionBarLeft = <div>Alice Caldwell</div>;

    const actionBarRight = (
      <div>
        <Label lblStyle="danger">urgent</Label>
        <Button btnStyle="success">
          <Icon icon="checkmark" />Resolve
        </Button>
      </div>
    );

    const actionBar = (
      <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />
    );

    const content = (
      <div
        style={{ height: '100%', overflow: 'auto' }}
        ref={node => {
          this.node = node;
        }}
      >
        <Conversation messages={messages} />
        <div style={{ padding: '20px', background: '#fff' }}>
          <ControlLabel>First name</ControlLabel>
          <FormControl defaultValue="Text input" type="email" required />

          <ControlLabel>File</ControlLabel>
          <FormControl type="file" />

          <ControlLabel>Select</ControlLabel>
          <FormControl defaultValue="2" componentClass="select">
            <option value="1">Toyota</option>
            <option value="2">Subaru</option>
            <option value="3">Honda</option>
            <option value="4">Suzuki</option>
          </FormControl>

          <ControlLabel>Textarea</ControlLabel>
          <FormControl defaultValue="Textarea" componentClass="textarea" />

          <FormControl defaultChecked={false} componentClass="checkbox" />
          <FormControl defaultChecked={true} componentClass="checkbox">
            checkbox
          </FormControl>

          <FormControl
            defaultChecked={false}
            name="radio"
            componentClass="radio"
          />
          <FormControl
            defaultChecked={true}
            name="radio"
            componentClass="radio"
          >
            radio
          </FormControl>
        </div>
      </div>
    );

    const breadcrumb = [
      { title: 'Inbox', link: '/inbox' },
      { title: 'Conversation' }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={actionBar}
        content={content}
        footer={<div />}
        leftSidebar={<LeftSidebar conversations={conversations} />}
        rightSidebar={<RightSidebar user={user} />}
      />
    );
  }
}

Inbox.propTypes = {
  title: PropTypes.string,
  conversations: PropTypes.array.isRequired,
  messages: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired
};

export default Inbox;
