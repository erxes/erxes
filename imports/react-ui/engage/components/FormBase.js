import React, { PropTypes, Component } from 'react';
import { ButtonGroup, Button, FormControl } from 'react-bootstrap';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';

const propTypes = {
  message: PropTypes.object,
  save: PropTypes.func.isRequired,
  users: PropTypes.array,
};

class FormBase extends Component {
  constructor(props) {
    super(props);

    // binds
    this.generateDoc = this.generateDoc.bind(this);
    this.save = this.save.bind(this);
    this.saveAndLive = this.saveAndLive.bind(this);
    this.saveAndDraft = this.saveAndDraft.bind(this);
  }

  getMessage() {
    return this.props.message || { email: {}, messenger: {} };
  }

  generateDoc(e) {
    e.preventDefault();

    return {};
  }

  save(e) {
    const doc = this.generateDoc(e);
    this.props.save(doc);
  }

  saveAndLive(e) {
    const doc = this.generateDoc(e);
    this.props.save({ isLive: true, isDraft: false, ...doc });
  }

  saveAndDraft(e) {
    const doc = this.generateDoc(e);
    this.props.save({ isLive: false, isDraft: true, ...doc });
  }

  renderButtons(message) {
    const save = (
      <Button bsStyle="link" onClick={this.save}>
        <i className="ion-checkmark-circled" /> Save
      </Button>
    );

    const saveAndLive = (
      <Button bsStyle="link" onClick={this.saveAndLive} key="action-save-live">
        <i className="ion-checkmark-circled" /> Save & live
      </Button>
    );

    const saveAndDraft = (
      <Button bsStyle="link" onClick={this.saveAndDraft} key="action-save-draft">
        <i className="ion-checkmark-circled" /> Save & draft
      </Button>
    );

    if (message._id) {
      return save;
    } else {
      return [saveAndLive, saveAndDraft];
    }
  }

  renderSidebarExtra() {
    return null;
  }

  renderContent() {
    return null;
  }

  renderTitle() {
    const kind = FlowRouter.getQueryParam('kind');
    if (kind == 'auto') {
      return 'Auto message';
    } else if (kind == 'manual') {
      return 'Manual message';
    }
    return 'Visitor auto message';
  }

  render() {
    const breadcrumb = [{ title: 'Engage', link: '/engage' }, { title: this.renderTitle() }];

    const message = this.getMessage();

    const { Section } = Wrapper.Sidebar;
    const { Title } = Wrapper.Sidebar.Section;

    const sidebar = (
      <Wrapper.Sidebar size="wide">
        <form onSubmit={this.save}>
          <Section>
            <Title>Title</Title>
            <div className="box">
              <FormControl id="title" defaultValue={message.title} required />
            </div>
          </Section>

          <Section>
            <Title>From</Title>
            <div className="box">
              <FormControl
                id="fromUserId"
                componentClass="select"
                defaultValue={message.fromUserId}
              >
                {this.props.users.map(u =>
                  <option key={u._id} value={u._id}>
                    {u.fullName || u.username}
                  </option>,
                )}
              </FormControl>
            </div>
          </Section>

          {this.renderSidebarExtra()}
        </form>
      </Wrapper.Sidebar>
    );

    const actionBar = (
      <Wrapper.ActionBar
        left={
          <ButtonGroup>
            {this.renderButtons(message)}

            <Button bsStyle="link" href={FlowRouter.path('engage/home')}>
              <i className="ion-close-circled" /> Cancel
            </Button>
          </ButtonGroup>
        }
      />
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={actionBar}
        content={this.renderContent()}
        leftSidebar={sidebar}
      />
    );
  }
}

FormBase.propTypes = propTypes;

export default FormBase;
