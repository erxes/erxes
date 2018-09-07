import * as React from 'react';
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
  saveDeal: PropTypes.func,
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
      boardId: '',
      pipelineId: '',
      stageId: props.stageId || '',
      name: ''
    };
  }

  onChangeField(name, value) {
    this.setState({ [name]: value });
  }

  save(e) {
    e.preventDefault();

    const { stageId, name } = this.state;
    const { customerId, companyId, saveDeal } = this.props;
    const { __, closeModal } = this.context;

    if (!stageId) return Alert.error(__('No stage'));

    if (!name) return Alert.error(__('Enter name'));

    const doc = {
      name,
      stageId,
      customerIds: customerId ? [customerId] : [],
      companyIds: companyId ? [companyId] : []
    };

    // before save, disable save button
    this.setState({ disabled: true });

    saveDeal(doc, () => {
      // after save, enable save button
      this.setState({ disabled: false });

      closeModal();
    });
  }

  renderSelect() {
    const { showSelect } = this.props;

    if (!showSelect) return null;

    const { stageId, pipelineId, boardId } = this.state;

    return (
      <DealSelect
        stageId={stageId}
        pipelineId={pipelineId}
        boardId={boardId}
        onChangeStage={stgId => this.onChangeField('stageId', stgId)}
        onChangePipeline={plId => this.onChangeField('pipelineId', plId)}
        onChangeBoard={brId => this.onChangeField('boardId', brId)}
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
              autoFocus
              onChange={e => this.onChangeField('name', e.target.value)}
            />
          </HeaderContent>
        </HeaderRow>

        <FormFooter>
          <Button
            btnStyle="simple"
            onClick={this.context.closeModal}
            icon="cancel-1"
          >
            Close
          </Button>

          <Button
            disabled={this.state.disabled}
            btnStyle="success"
            icon="checked-1"
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
DealAddForm.contextTypes = contextTypes;

export default DealAddForm;
