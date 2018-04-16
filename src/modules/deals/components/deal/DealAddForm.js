import React from 'react';
import PropTypes from 'prop-types';
import { Button, FormControl, ControlLabel } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import {
  AddContainer,
  HeaderRow,
  HeaderContent,
  FormFooter
} from '../../styles/deal';
import { DealSelect } from '../';

const propTypes = {
  saveDeal: PropTypes.func,
  customerId: PropTypes.string,
  companyId: PropTypes.string,
  boards: PropTypes.array,
  pipelines: PropTypes.array,
  stages: PropTypes.array,
  boardId: PropTypes.string,
  pipelineId: PropTypes.string,
  stageId: PropTypes.string,
  showSelect: PropTypes.bool,
  toggleForm: PropTypes.func,
  onChangeBoard: PropTypes.func,
  onChangePipeline: PropTypes.func,
  onChangeStage: PropTypes.func
};

const defaultProps = {
  showSelect: false
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
};

class DealAddForm extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeName = this.onChangeName.bind(this);
    this.save = this.save.bind(this);

    this.state = {
      disabled: false,
      name: ''
    };
  }

  onChangeName(e) {
    this.setState({ name: e.target.value });
  }

  save(e) {
    e.preventDefault();

    const { name } = this.state;
    const { stageId, customerId, companyId } = this.props;

    if (!stageId) return Alert('No stage');

    const doc = {
      name,
      stageId,
      customerIds: customerId ? [customerId] : [],
      companyIds: companyId ? [companyId] : []
    };

    // before save, disable save button
    this.setState({ disabled: true });

    this.props.saveDeal(doc, () => {
      // after save, enable save button
      this.setState({ disabled: false });

      this.context.closeModal();
    });
  }

  renderSelect() {
    const {
      boards,
      pipelines,
      stages,
      boardId,
      pipelineId,
      stageId,
      onChangeBoard,
      onChangePipeline,
      onChangeStage,
      showSelect
    } = this.props;

    if (!showSelect) return null;

    return (
      <HeaderRow>
        <HeaderContent>
          <DealSelect
            show={showSelect}
            boards={boards}
            pipelines={pipelines}
            stages={stages}
            boardId={boardId}
            pipelineId={pipelineId}
            stageId={stageId}
            onChangeBoard={onChangeBoard}
            onChangePipeline={onChangePipeline}
            onChangeStage={onChangeStage}
          />
        </HeaderContent>
      </HeaderRow>
    );
  }

  render() {
    return (
      <AddContainer onSubmit={e => this.save(e)}>
        {this.renderSelect()}

        <HeaderRow>
          <HeaderContent>
            <ControlLabel>Name</ControlLabel>
            <FormControl required onChange={this.onChangeName} />
          </HeaderContent>
        </HeaderRow>

        <FormFooter>
          <Button
            btnStyle="simple"
            onClick={this.context.closeModal}
            icon="close"
          >
            Close
          </Button>

          <Button
            disabled={this.state.disabled}
            btnStyle="success"
            icon="checkmark"
            type="submit"
          >
            Save
          </Button>
        </FormFooter>
      </AddContainer>
    );
  }
}

DealAddForm.propTypes = propTypes;
DealAddForm.defaultProps = defaultProps;
DealAddForm.contextTypes = contextTypes;

export default DealAddForm;
