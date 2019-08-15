import { IPipeline } from 'modules/boards/types';
import React from 'react';
import { Modal } from 'react-bootstrap';

type Props = {
  templates: IPipeline[];
  closeModal: () => void;
  show: boolean;
  pipelinesCopy: ({ _id, boardId, type }) => void;
  boardId: string;
};

class Templates extends React.Component<Props> {
  render() {
    const { templates, show, closeModal, pipelinesCopy, boardId } = this.props;

    const copy = (id: string) => {
      pipelinesCopy({ _id: id, boardId, type: 'growthHack' });

      closeModal();
    };

    return (
      <Modal
        show={show}
        onHide={closeModal}
        enforceFocus={false}
        dialogClassName="transform"
      >
        {templates.map(t => (
          <div onClick={copy.bind(this, t._id)} key={t._id}>
            {t.name}
          </div>
        ))}
      </Modal>
    );
  }
}

export default Templates;
