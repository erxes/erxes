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
import { DealSelect } from '../../containers';

const propTypes = {
  saveDeal: PropTypes.func.isRequired,
  customerId: PropTypes.string,
  companyId: PropTypes.string,
  boardsQuery: PropTypes.object,
  pipelinesQuery: PropTypes.object,
  stagesQuery: PropTypes.object,
  boardId: PropTypes.string,
  pipelineId: PropTypes.string,
  stageId: PropTypes.string,
  showSelect: PropTypes.bool
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

    this.save = this.save.bind(this);

    this.state = {
      disabled: false,
      name: '',
      boardId: props.boardId || '',
      pipelineId: '',
      stageId: props.stageId || ''
    };
  }

  onChangeField(name, value) {
    this.setState({ [name]: value });
  }

  save(e) {
    e.preventDefault();

    const { name, stageId } = this.state;
    const { customerId, companyId } = this.props;

    if (!stageId) return Alert.error('No stage');

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
    const { showSelect } = this.props;
    const { stageId, pipelineId, boardId } = this.state;

    if (!showSelect) return null;

    return (
      <DealSelect
        stageId={stageId}
        pipelineId={pipelineId}
        boardId={boardId}
        onChangeStage={stageId => this.onChangeField('stageId', stageId)}
        onChangePipeline={pipelineId =>
          this.onChangeField('pipelineId', pipelineId)
        }
        onChangeBoard={boardId => this.onChangeField('boardId', boardId)}
      />
    );
  }

  render() {
    return (
      <AddContainer onSubmit={e => this.save(e)}>
        {this.renderSelect()}

        <HeaderRow>
          <HeaderContent>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              required
              onChange={e => this.onChangeField('name', e.target.value)}
            />
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
