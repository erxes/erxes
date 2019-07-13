import Button from 'modules/common/components/Button';
import TextInfo from 'modules/common/components/TextInfo';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Col, Modal, Row } from 'react-bootstrap';

type Props = {
  oldData?: string;
  newData?: string;
  showModal?: boolean;
  closeModal: () => void;
  changeState: (logId: string) => void;
  action: string;
};

export default class LogModal extends React.Component<Props> {
  /**
   * Reads a stringified json and builds a list using its attributes.
   * @param {string} jsonString A stringified JSON object
   */
  prettyJSON(jsonString?: string) {
    const list: JSX.Element[] = [];

    if (jsonString) {
      const clean = jsonString.replace('\n', '');
      const parsed = JSON.parse(clean);
      const names = Object.getOwnPropertyNames(parsed);

      for (const name of names) {
        let item = <li key={name}>{`${name} : ${parsed[name]}`}</li>;

        if (typeof parsed[name] === 'object') {
          item = (
            <li key={name}>{`${name} : ${JSON.stringify(parsed[name])}`}</li>
          );
        }

        list.push(item);
      }
    }

    return <ul>{list}</ul>;
  }

  render() {
    const {
      oldData,
      newData,
      changeState,
      showModal,
      closeModal,
      action
    } = this.props;

    return (
      <Modal
        enforceFocus={false}
        bsSize="lg"
        show={showModal}
        onHide={changeState}
        dialogClassName="wide-modal"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>
            {__('Changes')} ({action})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col sm={6}>
              <TextInfo textStyle="warning">{__('Old data')}</TextInfo>
              {this.prettyJSON(oldData)}
            </Col>
            <Col sm={6}>
              <TextInfo textStyle="success">{__('New data')}</TextInfo>
              {this.prettyJSON(newData)}
            </Col>
          </Row>
          <Modal.Footer>
            <Button type="button" icon="cancel-1" onClick={closeModal}>
              {__('Close')}
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    );
  }
}
