import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';
import { Wrapper } from 'modules/layout/components';
import { Button, Icon, FormControl } from 'modules/common/components';

const propTypes = {
  kind: PropTypes.string,
  message: PropTypes.object,
  save: PropTypes.func.isRequired,
  users: PropTypes.array
};

class FormBase extends Component {
  constructor(props) {
    super(props);

    const message = props.message || {};

    this.state = { fromUser: message.fromUserId || '' };

    // binds
    this.generateDoc = this.generateDoc.bind(this);
    this.save = this.save.bind(this);
    this.saveAndLive = this.saveAndLive.bind(this);
    this.saveAndDraft = this.saveAndDraft.bind(this);
    this.onChangeUser = this.onChangeUser.bind(this);
  }

  componentDidMount() {
    this.setState({ fromUser: document.getElementById('fromUserId').value });
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
      <Button btnStyle="success" onClick={this.save}>
        <Icon icon="checkmark" /> Save
      </Button>
    );

    const saveAndLive = (
      <Button
        btnStyle="success"
        onClick={this.saveAndLive}
        key="action-save-live"
      >
        <Icon icon="checkmark" /> Save & live
      </Button>
    );

    const saveAndDraft = (
      <Button
        btnStyle="success"
        onClick={this.saveAndDraft}
        key="action-save-draft"
      >
        <Icon icon="checkmark" /> Save & draft
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
    const { kind } = this.props;

    if (kind === 'auto') {
      return 'Auto message';
    } else if (kind === 'manual') {
      return 'Manual message';
    }

    return 'Visitor auto message';
  }

  onChangeUser(e) {
    this.setState({ fromUser: e.target.value });
  }

  render() {
    const breadcrumb = [
      { title: 'Engage', link: '/engage' },
      { title: this.renderTitle() }
    ];

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
                onChange={this.onChangeUser}
              >
                {this.props.users.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.fullName || u.username}
                  </option>
                ))}
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

            <Link to="/engage">
              <Button btnStyle="simple">
                <Icon icon="close" /> Cancel
              </Button>
            </Link>
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
