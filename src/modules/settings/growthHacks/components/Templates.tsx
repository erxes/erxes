import { IPipeline } from 'modules/boards/types';
import React from 'react';
import { Modal } from 'react-bootstrap';

type Props = {
  templates: IPipeline[];
  closeModal: () => void;
  show: boolean;
};

// tslint:disable
class Templates extends React.Component<Props> {
  render() {
    const { templates, show, closeModal } = this.props;

    const copy = (id: string) => {
      console.log('_id: ', id);
    };

    return (
      <Modal
        show={show}
        onHide={closeModal}
        enforceFocus={false}
        dialogClassName="transform"
      >
        {templates.map(t => (
          <div onClick={() => copy(t._id)} key={t._id}>
            {t.name}
          </div>
        ))}
      </Modal>
    );
  }
}

export default Templates;
