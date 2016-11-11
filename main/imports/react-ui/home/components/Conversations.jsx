import React, { Component } from 'react';
import { Collapse, Well } from 'react-bootstrap';
import { NameCard } from '../../common';


class Conversation extends Component {
  constructor(props) {
    super(props);

    this.state = { open: false };
  }

  render() {
    const user1 = {
      emails: [
        { address: 'boldkhuu.b@nmma.co' },
      ],
      details: {
        fullName: 'Болдхүү Батбаатар',
      },
    };

    return (
      <Well onClick={() => this.setState({ open: !this.state.open })}>
        <NameCard
          user={user1}
          secondLine={
            <span>
              sent a message to
              <strong><a href="#">Галсан Дэмбэрэл</a></strong>
            </span>
          }
        />

        <Collapse in={this.state.open}>
          <Well>
            <div className="message-list">
              <div className="avatar-container">
                <div className="name-letters">
                  <span>A.B</span>
                </div>
              </div>
              <div className="title">
                <div className="full-name">
                  <a href="/details">Anar-Erdene Batjargal</a>
                </div>
                <small className="date">
                  About 11min ago
                </small>
              </div>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Nunc lobortis ut sapien at egestas. In pellentesque porttitor nulla.
                Praesent id molestie velit. In faucibus eu erat non lobortis.
                Nunc ex urna, interdum a ultrices sed, aliquet vitae libero.
                Mauris imperdiet sed augue nec fringilla.
              </p>
            </div>
          </Well>
        </Collapse>
      </Well>
    );
  }
}

export default Conversation;
