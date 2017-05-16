import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from '/imports/react-ui/layout/components';
import { EmptyState } from '/imports/react-ui/common';
import Form from './Form';
import List from './List';

const propTypes = {
  internalNotes: PropTypes.array.isRequired,
  createInternalNote: PropTypes.func.isRequired,
  removeInternalNote: PropTypes.func.isRequired,
};

class InternalNotes extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFormShown: false,
    };

    this.toggleForm = this.toggleForm.bind(this);
    this.createInternalNote = this.createInternalNote.bind(this);
    this.removeInternalNote = this.removeInternalNote.bind(this);
  }

  toggleForm() {
    this.setState({ isFormShown: !this.state.isFormShown });
  }

  createInternalNote(content) {
    if (content.trim()) {
      this.props.createInternalNote(content);
      this.setState({ isFormShown: false });
    }
  }

  removeInternalNote(internalNoteId) {
    this.props.removeInternalNote(internalNoteId);
  }

  render() {
    return (
      <Wrapper.Sidebar.Section>
        <h3>Internal notes</h3>
        <Wrapper.Sidebar.Section.QuickButtons>
          <a className="quick-button" onClick={this.toggleForm}>
            <i className={`ion-${this.state.isFormShown ? 'close' : 'plus'}-round`} />
          </a>
        </Wrapper.Sidebar.Section.QuickButtons>

        {this.state.isFormShown ? <Form createInternalNote={this.createInternalNote} /> : null}

        {this.props.internalNotes.length
          ? <List
              internalNotes={this.props.internalNotes}
              removeInternalNote={this.removeInternalNote}
            />
          : <EmptyState
              icon={<i className="ion-clipboard" />}
              text="No internal notes"
              size="small"
            />}
      </Wrapper.Sidebar.Section>
    );
  }
}

InternalNotes.propTypes = propTypes;

export default InternalNotes;
