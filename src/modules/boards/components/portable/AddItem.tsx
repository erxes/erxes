import { BoardSelect } from 'modules/boards/containers';
import {
  AddContainer,
  FormFooter,
  HeaderContent,
  HeaderRow
} from 'modules/boards/styles/item';
import { IItemParams, IOptions } from 'modules/boards/types';
import {
  Button,
  ControlLabel,
  Form,
  FormControl
} from 'modules/common/components';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import * as React from 'react';

type Props = {
  options: IOptions;
  customerIds?: string[];
  companyIds?: string[];
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  saveItem: (doc: IItemParams, callback: () => void) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  showSelect?: boolean;
  closeModal: () => void;
};

type State = {
  stageId: string;
  boardId: string;
  pipelineId: string;
};

class AddForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      boardId: '',
      pipelineId: '',
      stageId: props.stageId || ''
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  generateDoc = (values: { name: string }) => {
    const { stageId } = this.state;
    const { companyIds, customerIds } = this.props;

    if (!stageId) {
      return;
    }

    return {
      ...values,
      stageId,
      customerIds: customerIds || [],
      companyIds: companyIds || []
    };
  };

  renderSelect() {
    const { showSelect, options } = this.props;

    if (!showSelect) {
      return null;
    }

    const { stageId, pipelineId, boardId } = this.state;

    const stgIdOnChange = stgId => this.onChangeField('stageId', stgId);
    const plIdOnChange = plId => this.onChangeField('pipelineId', plId);
    const brIdOnChange = brId => this.onChangeField('boardId', brId);

    return (
      <BoardSelect
        type={options.type}
        stageId={stageId}
        pipelineId={pipelineId}
        boardId={boardId}
        onChangeStage={stgIdOnChange}
        onChangePipeline={plIdOnChange}
        onChangeBoard={brIdOnChange}
      />
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        {this.renderSelect()}

        <HeaderRow>
          <HeaderContent>
            <ControlLabel required={true}>Name</ControlLabel>
            <FormControl
              {...formProps}
              name="name"
              autoFocus={true}
              required={true}
            />
          </HeaderContent>
        </HeaderRow>

        <FormFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Close
          </Button>

          {renderButton({
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal
            // object: brand
          })}
        </FormFooter>
      </>
    );
  };

  render() {
    return (
      <AddContainer>
        <Form renderContent={this.renderContent} />
      </AddContainer>
    );
  }
}

export default AddForm;
