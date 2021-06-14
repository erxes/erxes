import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Toggle from 'modules/common/components/Toggle';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import SelectBoards from '../containers/SelectBoardPipeline';
import { IBoardSelectItem, IFieldGroup } from '../types';

type Props = {
  group?: IFieldGroup;
  type: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  isVisible: boolean;
  isVisibleInDetail: boolean;
  selectedItems: IBoardSelectItem[];
};

class PropertyGroupForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    let isVisible = true;
    let isVisibleInDetail = true;
    let selectedItems = [];

    if (props.group) {
      isVisible = props.group.isVisible;
      isVisibleInDetail = props.group.isVisibleInDetail;
      selectedItems = props.group.boardsPipelines || [];
    }

    this.state = {
      isVisible,
      isVisibleInDetail,
      selectedItems
    };
  }

  generateDoc = (values: {
    _id?: string;
    name: string;
    description: string;
  }) => {
    const { group, type } = this.props;
    const finalValues = values;
    const selectedItems = this.state.selectedItems;

    if (group) {
      finalValues._id = group._id;
    }

    const boardsPipelines =
      selectedItems &&
      selectedItems.map(e => {
        const boardsPipeline = {
          boardId: e.boardId,
          pipelineIds: e.pipelineIds
        };

        return boardsPipeline;
      });

    return {
      ...finalValues,
      contentType: type,
      isVisible: this.state.isVisible,
      isVisibleInDetail: this.state.isVisibleInDetail,
      boardsPipelines
    };
  };

  visibleHandler = e => {
    if (e.target.id === 'visible') {
      const isVisible = e.target.checked;

      return this.setState({ isVisible });
    }

    const isVisibleInDetail = e.target.checked;

    return this.setState({ isVisibleInDetail });
  };

  itemsChange = (items: IBoardSelectItem[]) => {
    this.setState({ selectedItems: items });
  };

  renderFieldVisible() {
    if (!this.props.group) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>Visible</ControlLabel>
        <div>
          <Toggle
            id="visible"
            checked={this.state.isVisible}
            onChange={this.visibleHandler}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
          />
        </div>
      </FormGroup>
    );
  }

  renderFieldVisibleInDetail() {
    if (!this.props.group) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>Visible in detail</ControlLabel>
        <div>
          <Toggle
            id="visibleDetail"
            checked={this.state.isVisibleInDetail}
            onChange={this.visibleHandler}
            icons={{
              checked: <span>Yes</span>,
              unchecked: <span>No</span>
            }}
          />
        </div>
      </FormGroup>
    );
  }

  renderBoardSelect() {
    if (!['task', 'deal', 'ticket'].includes(this.props.type)) {
      return null;
    }

    return (
      <SelectBoards
        isRequired={false}
        onChangeItems={this.itemsChange}
        type={this.props.type}
        selectedItems={this.state.selectedItems}
      />
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { group, closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const object = group || ({} as IFieldGroup);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            autoFocus={true}
            required={true}
            defaultValue={object.name}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            required={true}
            defaultValue={object.description}
          />
        </FormGroup>

        {this.renderFieldVisible()}

        {['visitor', 'lead', 'customer'].includes(object.contentType) ? (
          this.renderFieldVisibleInDetail()
        ) : (
          <></>
        )}

        {this.renderBoardSelect()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: 'property group',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: group
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default PropertyGroupForm;
