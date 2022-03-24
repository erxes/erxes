import { SelectTeamMembers, __ } from 'erxes-ui';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Toggle from 'modules/common/components/Toggle';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { SelectMemberStyled } from 'modules/settings/boards/styles';
import { ExpandWrapper } from 'modules/settings/styles';
import React from 'react';
import SelectBoards from '../containers/SelectBoardPipeline';
import { IBoardSelectItem, IFieldGroup } from '../types';
import SelectDepartments from 'modules/settings/team/containers/department/SelectDepartments';

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
  visibility: string;
  memberIds: string[];
  departmentIds: string[];
};

class PropertyGroupForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { group } = props;
    let isVisible = true;
    let isVisibleInDetail = true;
    let selectedItems = [];
    let visibility = 'public';
    let memberIds = [];
    let departmentIds = [];

    if (group) {
      isVisible = group.isVisible;
      isVisibleInDetail = group.isVisibleInDetail;
      selectedItems = group.boardsPipelines || [];
      visibility = group.visibility;
      memberIds = group.memberIds || [];
      departmentIds = group.departmentIds || [];
    }

    this.state = {
      isVisible,
      isVisibleInDetail,
      selectedItems,
      visibility,
      memberIds,
      departmentIds
    };
  }

  generateDoc = (values: {
    _id?: string;
    name: string;
    description: string;
  }) => {
    const { group, type } = this.props;
    const {
      isVisible,
      isVisibleInDetail,
      selectedItems,
      visibility,
      memberIds,
      departmentIds
    } = this.state;
    const finalValues = values;

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
      isVisible,
      isVisibleInDetail,
      boardsPipelines,
      visibility,
      memberIds,
      departmentIds
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

  onChangeVisibility = (e: React.FormEvent<HTMLElement>) => {
    const visibility = (e.currentTarget as HTMLInputElement).value;

    this.setState({
      visibility,
      memberIds: visibility === 'public' ? [] : this.state.memberIds
    });
  };

  onChangeMembers = items => {
    this.setState({ memberIds: items });
  };

  onChangeDepartments = items => {
    this.setState({ departmentIds: items });
  };

  renderFieldVisible() {
    if (!this.props.group) {
      return null;
    }

    const Checked = () => <span>And</span>;
    const UnChecked = () => <span>Or</span>;

    return (
      <FormGroup>
        <ControlLabel>Visible</ControlLabel>
        <div>
          <Toggle
            id="visible"
            checked={this.state.isVisible}
            onChange={this.visibleHandler}
            icons={{ checked: <Checked />, unchecked: <UnChecked /> }}
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

  renderSelectMembers() {
    const { visibility, memberIds } = this.state;

    if (visibility === 'public') {
      return;
    }

    return (
      <>
        <FormGroup>
          <SelectMemberStyled zIndex={2002}>
            <ControlLabel>Members</ControlLabel>
            <SelectTeamMembers
              label="Choose members"
              name="selectedMemberIds"
              initialValue={memberIds}
              onSelect={this.onChangeMembers}
            />
          </SelectMemberStyled>
        </FormGroup>

        <FormGroup>
          <SelectDepartments
            defaultValue={this.state.departmentIds}
            isRequired={false}
            onChange={this.onChangeDepartments}
          />
        </FormGroup>
      </>
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

        <FormGroup>
          <ControlLabel>Code</ControlLabel>
          <FormControl {...formProps} name="code" defaultValue={object.code} />
        </FormGroup>

        {this.renderFieldVisible()}

        {['visitor', 'lead', 'customer'].includes(object.contentType) ? (
          this.renderFieldVisibleInDetail()
        ) : (
          <></>
        )}

        {this.renderBoardSelect()}

        <ExpandWrapper>
          <FormGroup>
            <ControlLabel required={true}>Visibility</ControlLabel>
            <FormControl
              {...formProps}
              name="visibility"
              componentClass="select"
              value={this.state.visibility}
              onChange={this.onChangeVisibility}
            >
              <option value="public">{__('Public')}</option>
              <option value="private">{__('Private')}</option>
            </FormControl>
          </FormGroup>
        </ExpandWrapper>

        {this.renderSelectMembers()}

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
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
