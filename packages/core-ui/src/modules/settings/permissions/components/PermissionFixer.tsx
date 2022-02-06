import Button from 'modules/common/components/Button';
import Info from 'modules/common/components/Info';
import TextInfo from 'modules/common/components/TextInfo';
import { ModalFooter } from 'modules/common/styles/main';
import React from 'react';

type Props = {
  closeModal: () => void;
  fixPermissions: () => Promise<any>;
};

type State = {
  messages: string[];
};

export default class PermissionFixer extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      messages: []
    };
  }

  renderMessages() {
    const { messages } = this.state;

    if (messages.length > 0) {
      return (
        <ul>
          {messages.map(m => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      );
    }

    return null;
  }

  render() {
    const { closeModal, fixPermissions } = this.props;

    const fix = () => {
      fixPermissions().then(({ data }) => {
        const messages = data && data.permissionsFix ? data.permissionsFix : [];

        this.setState({
          messages: messages.length > 0 ? messages : ['Everything was fine']
        });
      });
    };

    return (
      <>
        <Info>
          When a team member has all permissions of a specific module &
          <TextInfo> can't perform some actions</TextInfo>, then this command
          comes to the rescue.
        </Info>
        {this.renderMessages()}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>
          <Button btnStyle="success" type="button" onClick={fix} icon="wrench">
            Fix
          </Button>
        </ModalFooter>
      </>
    );
  }
}
