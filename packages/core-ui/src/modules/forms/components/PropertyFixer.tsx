import Button from "modules/common/components/Button";
import Info from "modules/common/components/Info";
import TextInfo from "modules/common/components/TextInfo";
import { ModalFooter } from "modules/common/styles/main";
import { Alert } from "modules/common/utils";
import React from "react";

type Props = {
  closeModal: () => void;
  fixProperties: () => Promise<any>;
};

type State = {
  messages: string[];
};

export default class PropertyFixer extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
    };
  }

  renderMessages() {
    const { messages } = this.state;

    if (messages.length > 0) {
      return (
        <ul>
          {messages.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      );
    }

    return null;
  }

  render() {
    const { closeModal, fixProperties } = this.props;

    const fix = () => {
      fixProperties()
        .then(({ data }) => {
          const messages =
            data && data.fieldsGroupFix ? data.fieldsGroupFix : [];

          this.setState({
            messages: messages.length > 0 ? messages : ["Everything was fine"],
          });

          closeModal();
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    };

    return (
      <>
        <Info>
          When your properties or fields are not updating correctly or
          <TextInfo> some data seems out of sync</TextInfo>, this tool helps fix
          inconsistencies.
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
            Fix Properties
          </Button>
        </ModalFooter>
      </>
    );
  }
}
