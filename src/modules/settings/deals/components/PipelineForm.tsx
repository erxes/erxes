import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import {
  ColorPicker,
  Picker,
  PipColorContainer
} from 'modules/forms/components/step/style';
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { ChromePicker } from 'react-color';
import { IPipeline, IStage } from '../types';
import { Stages } from './';

type Props = {
  show?: boolean;
  boardId: string;
  pipeline?: IPipeline;
  stages?: IStage[];
  save: (
    params: { doc: { name: string; boardId?: string; stages: IStage[] } },
    callback: () => void,
    pipeline?: IPipeline
  ) => void;
  closeModal: () => void;
};

type State = {
  stages: IStage[];
  color: string;
  theme: string;
};

class PipelineForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      stages: (props.stages || []).map(stage => ({ ...stage })),
      color: '#673FBD',
      theme: ''
    };
  }

  onChangeStages = stages => {
    this.setState({ stages });
  };

  onColorChange = e => {
    this.setState({ color: e.hex, theme: '#673FBD' });
  };

  generateDoc = () => {
    const { pipeline } = this.props;

    return {
      doc: {
        name: (document.getElementById('pipeline-name') as HTMLInputElement)
          .value,
        boardId: pipeline ? pipeline.boardId : this.props.boardId,
        stages: this.state.stages.filter(el => el.name)
      }
    };
  };

  save = e => {
    e.preventDefault();

    const { save, closeModal, pipeline } = this.props;

    save(
      this.generateDoc(),
      () => {
        closeModal();
      },
      pipeline
    );
  };

  renderContent() {
    const { pipeline } = this.props;
    const { stages, color } = this.state;

    const popoverTop = (
      <Popover id="color-picker">
        <ChromePicker color={color} onChange={this.onColorChange} />
      </Popover>
    );
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            id="pipeline-name"
            defaultValue={pipeline ? pipeline.name : ''}
            type="text"
            autoFocus={true}
            required={true}
          />
        </FormGroup>

        <Stages stages={stages} onChangeStages={this.onChangeStages} />
        <OverlayTrigger
          trigger="click"
          rootClose={true}
          placement="bottom"
          overlay={popoverTop}
        >
          <PipColorContainer>
            <label>Change background color</label>
            <ColorPicker>
              <Picker style={{ backgroundColor: color }} />
            </ColorPicker>
          </PipColorContainer>
        </OverlayTrigger>
      </>
    );
  }

  render() {
    const { show, pipeline, closeModal } = this.props;

    if (!show) {
      return null;
    }

    return (
      <Modal show={show} onHide={closeModal} dialogClassName="transform">
        <form onSubmit={this.save}>
          <Modal.Header closeButton={true}>
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
                onClick={closeModal}
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
