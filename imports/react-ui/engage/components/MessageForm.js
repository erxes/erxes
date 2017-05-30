import React, { PropTypes, Component } from 'react';
import {
  ButtonGroup,
  Button,
  ControlLabel,
  FormControl,
  Checkbox,
  FormGroup,
} from 'react-bootstrap';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';

const propTypes = {
  message: PropTypes.object,
  save: PropTypes.func.isRequired,
  segments: PropTypes.array.isRequired,
};

class MessageForm extends Component {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();

    const doc = {
      customerIds: [],
      segmentId: document.getElementById('segmentId').value,
      title: document.getElementById('title').value,
      content: document.getElementById('content').value,
      isAuto: document.getElementById('isAuto').checked,
    };

    this.props.save(doc);
  }

  renderSegments(defaultValue) {
    const renderSegment = segment => {
      return <option key={segment._id} value={segment._id}>{segment.name}</option>;
    };

    return (
      <FormGroup>
        <ControlLabel>Segment</ControlLabel>

        <FormControl componentClass="select" id="segmentId" defaultValue={defaultValue}>
          {this.props.segments.map(segment => renderSegment(segment))}
        </FormControl>
      </FormGroup>
    );
  }

  render() {
    const breadcrumb = [{ title: 'Engage', link: '/engage' }];

    const message = this.props.message || {};

    const actionBar = (
      <Wrapper.ActionBar
        left={
          <ButtonGroup>
            <Button bsStyle="link" onClick={this.save}>
              <i className="ion-checkmark-circled" /> Save
            </Button>
            <Button bsStyle="link" href={FlowRouter.path('engage/messages/list')}>
              <i className="ion-close-circled" /> Cancel
            </Button>
          </ButtonGroup>
        }
      />
    );

    const content = (
      <div className="margined">
        <form onSubmit={this.save}>
          {this.renderSegments(message.segmentId)}

          <FormGroup>
            <ControlLabel>Title</ControlLabel>
            <FormControl id="title" defaultValue={message.title} required />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Content</ControlLabel>

            <FormControl
              id="content"
              componentClass="textarea"
              rows={5}
              defaultValue={message.content}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Is auto</ControlLabel>

            <Checkbox defaultChecked={message.isAuto} id="isAuto" />
          </FormGroup>
        </form>
      </div>
    );

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={breadcrumb} />}
          actionBar={actionBar}
          content={content}
        />
      </div>
    );
  }
}

MessageForm.propTypes = propTypes;

export default MessageForm;
