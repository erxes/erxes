import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { IPipeline, IStage } from '../types';
import { Stages } from './';

type Props = {
  show?: boolean;
  boardId: string;
  pipeline?: IPipeline;
  stages?: IStage[];
  save: (
    params: { doc: { name: string; boardId: string; stages: IStage[] } },
    callback: () => void,
    pipeline?: IPipeline
  ) => void;
  closeModal: () => void;
};

type State = {
  stages: IStage[];
};

class PipelineForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.save = this.save.bind(this);
    this.onChangeStages = this.onChangeStages.bind(this);
    this.generateDoc = this.generateDoc.bind(this);

    this.state = { stages: (props.stages || []).map(stage => ({ ...stage })) };
  }

  onChangeStages(stages) {
    this.setState({ stages });
  }

  save(e) {
    e.preventDefault();

    const { save, closeModal, pipeline } = this.props;

    save(this.generateDoc(), () => closeModal(), pipeline);
  }

  generateDoc() {
    const { pipeline } = this.props;

    return {
      doc: {
        name: (document.getElementById('pipeline-name') as HTMLInputElement)
          .value,
        boardId: pipeline ? pipeline.boardId : this.props.boardId,
        stages: this.state.stages.filter(el => el.name)
      }
    };
  }

  renderContent() {
    const { pipeline } = this.props;
    const { stages } = this.state;

    return (
      <React.Fragment>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl
            id="pipeline-name"
            defaultValue={pipeline ? pipeline.name : ''}
            type="text"
            autoFocus
            required
          />
        </FormGroup>

        <Stages stages={stages} onChangeStages={this.onChangeStages} />
      </React.Fragment>
    );
  }

  render() {
    const { show, pipeline, closeModal } = this.props;

    if (!show) return null;

    return (
      <Modal show={show} onHide={closeModal}>
        <form onSubmit={this.save}>
          <Modal.Header closeButton>
            <Modal.Title>
              {pipeline ? 'Edit pipeline' : 'Add pipeline'}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {this.renderContent()}
            <Modal.Footer>
              <Button
                btnStyle="simple"
                type="button"
                icon="cancel-1"
                onClick={() => closeModal()}
              >
                Cancel
              </Button>

              <Button btnStyle="success" icon="checked-1" type="submit">
                Save
              </Button>
            </Modal.Footer>
          </Modal.Body>
        </form>
      </Modal>
    );
  }
}

export default PipelineForm;
