import { ColorPick, ColorPicker } from "@erxes/ui/src/styles/main";
import { FlexContent, FlexItem } from "@erxes/ui/src/layout/styles";
import { IBoard, IPipeline, IStage } from "@erxes/ui-cards/src/boards/types";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { __, generateTree } from "coreui/utils";

import BoardNumberConfigs from "./numberConfig/BoardNumberConfigs";
import Button from "@erxes/ui/src/components/Button";
import Icon from "@erxes/ui/src/components/Icon";
import { COLORS } from "@erxes/ui/src/constants/colors";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { ExpandWrapper } from "@erxes/ui-settings/src/styles";
import { Flex } from "@erxes/ui/src/styles/main";
import Form from "@erxes/ui/src/components/form/Form";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IDepartment } from "@erxes/ui/src/team/types";
import { IOption } from "../types";
import { ITag } from "@erxes/ui-tags/src/types";
import Popover from "@erxes/ui/src/components/Popover";
import React, { Fragment } from "react";
import Select from "react-select";
import { SelectMemberStyled } from "@erxes/ui-cards/src/settings/boards/styles";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import Stages from "./Stages";
import TwitterPicker from "react-color/lib/Twitter";
import { colors } from "@erxes/ui/src/styles";
import {
  ModalFooter,
  DialogContent,
  DialogWrapper,
  ModalOverlay,
} from "@erxes/ui/src/styles/main";
import { Dialog, Transition } from "@headlessui/react";

type Props = {
  type: string;
  show: boolean;
  boardId: string;
  pipeline?: IPipeline;
  stages?: IStage[];
  boards: IBoard[];
  tags?: ITag[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  options?: IOption;
  renderExtraFields?: (formProps: IFormProps) => JSX.Element;
  extraFields?: any;
  departments: IDepartment[];
};

type State = {
  stages: IStage[];
  visibility: string;
  selectedMemberIds: string[];
  backgroundColor: string;
  isCheckDate: boolean;
  isCheckUser: boolean;
  isCheckDepartment: boolean;
  excludeCheckUserIds: string[];
  boardId: string;
  tagId?: string;
  numberConfig?: string;
  numberSize?: string;
  departmentIds?: string[];
};

class PipelineForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { pipeline, stages } = this.props;

    this.state = {
      stages: (stages || []).map((stage) => ({ ...stage })),
      visibility: pipeline ? pipeline.visibility || "public" : "public",
      selectedMemberIds: pipeline ? pipeline.memberIds || [] : [],
      backgroundColor:
        (pipeline && pipeline.bgColor) || colors.colorPrimaryDark,
      isCheckDate: pipeline ? pipeline.isCheckDate || false : false,
      isCheckUser: pipeline ? pipeline.isCheckUser || false : false,
      isCheckDepartment: pipeline ? pipeline.isCheckDepartment || false : false,
      excludeCheckUserIds: pipeline ? pipeline.excludeCheckUserIds || [] : [],
      boardId: props.boardId || "",
      tagId: pipeline ? pipeline.tagId : "",
      numberConfig: (pipeline && pipeline.numberConfig) || "",
      numberSize: (pipeline && pipeline.numberSize) || "",
      departmentIds: pipeline ? pipeline.departmentIds || [] : [],
    };
  }

  onChangeStages = (stages) => {
    this.setState({ stages });
  };

  onChangeVisibility = (e: React.FormEvent<HTMLElement>) => {
    this.setState({
      visibility: (e.currentTarget as HTMLInputElement).value,
    });
  };

  onChangeMembers = (items) => {
    this.setState({ selectedMemberIds: items });
  };

  onChangeDepartments = (options) => {
    this.setState({ departmentIds: (options || []).map((o) => o.value) });
  };

  onChangeDominantUsers = (items) => {
    this.setState({ excludeCheckUserIds: items });
  };

  collectValues = (items) => {
    return items.map((item) => item.value);
  };

  onColorChange = (e) => {
    this.setState({ backgroundColor: e.hex });
  };

  onChangeNumber = (key: string, value: string) => {
    this.setState({ [key]: value } as any);
  };

  generateDoc = (values: {
    _id?: string;
    name: string;
    visibility: string;
  }) => {
    const { pipeline, type, extraFields } = this.props;
    const {
      selectedMemberIds,
      stages,
      backgroundColor,
      isCheckDate,
      isCheckUser,
      isCheckDepartment,
      excludeCheckUserIds,
      boardId,
      numberConfig,
      numberSize,
      departmentIds,
      tagId,
    } = this.state;

    const finalValues = values;

    if (pipeline) {
      finalValues._id = pipeline._id;
    }

    return {
      ...finalValues,
      ...extraFields,
      type,
      boardId,
      stages: stages.filter((el) => el.name),
      memberIds: selectedMemberIds,
      bgColor: backgroundColor,
      isCheckDate,
      isCheckUser,
      isCheckDepartment,
      excludeCheckUserIds,
      numberConfig,
      numberSize,
      departmentIds,
      tagId,
    };
  };

  renderNumberInput() {
    return (
      <FormGroup>
        <BoardNumberConfigs
          onChange={(key: string, conf: string) =>
            this.onChangeNumber(key, conf)
          }
          config={this.state.numberConfig || ""}
          size={this.state.numberSize || ""}
        />
      </FormGroup>
    );
  }

  renderSelectMembers() {
    const { visibility, selectedMemberIds, departmentIds } = this.state;

    if (visibility === "public") {
      return;
    }

    const departmentOptions = generateTree(
      this.props.departments,
      null,
      (node, level) => ({
        value: node._id,
        label: `${"---".repeat(level)} ${node.title}`,
      })
    );

    return (
      <>
        <FormGroup>
          <SelectMemberStyled>
            <ControlLabel>Members</ControlLabel>

            <SelectTeamMembers
              label="Choose members"
              name="selectedMemberIds"
              initialValue={selectedMemberIds}
              onSelect={this.onChangeMembers}
            />
          </SelectMemberStyled>
        </FormGroup>
        <FormGroup>
          <SelectMemberStyled>
            <ControlLabel>Departments</ControlLabel>
            <Select
              value={departmentOptions.filter((option) =>
                this.state.departmentIds?.includes(option.value)
              )}
              options={departmentOptions}
              onChange={this.onChangeDepartments.bind(this)}
              placeholder={__("Choose department ...")}
              isMulti={true}
            />
          </SelectMemberStyled>
        </FormGroup>
      </>
    );
  }

  onChangeIsCheckDate = (e) => {
    const isChecked = (e.currentTarget as HTMLInputElement).checked;
    this.setState({ isCheckDate: isChecked });
  };

  onChangeIsCheckUser = (e) => {
    const isChecked = (e.currentTarget as HTMLInputElement).checked;
    this.setState({ isCheckUser: isChecked });
  };

  onChangeIsCheckDepartment = (e) => {
    const isChecked = (e.currentTarget as HTMLInputElement).checked;
    this.setState({ isCheckDepartment: isChecked });
  };

  renderDominantUsers() {
    const { isCheckUser, isCheckDepartment, excludeCheckUserIds } = this.state;

    if (!isCheckUser && !isCheckDepartment) {
      return;
    }

    return (
      <FormGroup>
        <SelectMemberStyled>
          <ControlLabel>
            Users eligible to see all {this.props.type}
          </ControlLabel>

          <SelectTeamMembers
            label="Choose members"
            name="excludeCheckUserIds"
            initialValue={excludeCheckUserIds}
            onSelect={this.onChangeDominantUsers}
          />
        </SelectMemberStyled>
      </FormGroup>
    );
  }

  renderBoards() {
    const { boards } = this.props;

    const boardOptions = boards.map((board) => ({
      value: board._id,
      label: board.name,
    }));

    const onChange = (item) => {
      this.setState({ boardId: item.value });
    };

    return (
      <FormGroup>
        <ControlLabel required={true}>Board</ControlLabel>
        <Select
          placeholder={__("Choose a board")}
          value={boardOptions.find(
            (option) => option.value === this.state.boardId
          )}
          options={boardOptions}
          onChange={onChange}
          isClearable={true}
        />
      </FormGroup>
    );
  }

  renderTags() {
    const { tags } = this.props;

    const filteredTags = tags && tags.filter((tag) => !tag.parentId);

    const onChange = (item) => {
      this.setState({ tagId: item.value });
    };

    const generateOptions = (items) => {
      if (!items || items.length === 0) {
        return null;
      }

      return items.map((item) => {
        return {
          value: item._id,
          label: item.name,
        };
      });
    };

    return (
      <FormGroup>
        <ControlLabel>Tags</ControlLabel>
        <Select
          placeholder={__("Choose a tag")}
          value={(generateOptions(filteredTags) || []).find(
            (option) => option.value === this.state.tagId
          )}
          options={generateOptions(filteredTags)}
          isClearable={true}
          onChange={onChange}
        />
      </FormGroup>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { pipeline, renderButton, closeModal, options, renderExtraFields } =
      this.props;
    const { values, isSubmitted } = formProps;
    const object = pipeline || ({} as IPipeline);
    const pipelineName =
      options && options.pipelineName
        ? options.pipelineName.toLowerCase()
        : "pipeline";

    return (
      <div id="manage-pipeline-modal">
        <FlexContent>
          <FlexItem count={4}>
            <FormGroup>
              <ControlLabel required={true}>Name</ControlLabel>
              <FormControl
                {...formProps}
                name="name"
                defaultValue={object.name}
                autoFocus={true}
                required={true}
              />
            </FormGroup>
          </FlexItem>
        </FlexContent>

        {renderExtraFields && renderExtraFields(formProps)}

        <Flex>
          <ExpandWrapper>
            <FormGroup>
              <ControlLabel required={true}>Visibility</ControlLabel>
              <FormControl
                {...formProps}
                name="visibility"
                componentclass="select"
                value={this.state.visibility}
                onChange={this.onChangeVisibility}
              >
                <option value="public">{__("Public")}</option>
                <option value="private">{__("Private")}</option>
              </FormControl>
            </FormGroup>
          </ExpandWrapper>
          <FormGroup>
            <ControlLabel>Background</ControlLabel>
            <div>
              <Popover
                placement="bottom-end"
                trigger={
                  <ColorPick>
                    <ColorPicker
                      style={{ backgroundColor: this.state.backgroundColor }}
                    />
                  </ColorPick>
                }
              >
                <TwitterPicker
                  width="266px"
                  triangle="hide"
                  color={this.state.backgroundColor}
                  onChange={this.onColorChange}
                  colors={COLORS}
                />
              </Popover>
            </div>
          </FormGroup>
        </Flex>

        {this.renderBoards()}

        {this.renderTags()}

        {this.renderSelectMembers()}

        {this.renderNumberInput()}

        <FormGroup>
          <FlexContent>
            <FlexItem>
              <ControlLabel>
                {__(`Select the day after the card created date`)}
              </ControlLabel>
              <span style={{ marginLeft: "10px" }}>
                <FormControl
                  componentclass="checkbox"
                  checked={this.state.isCheckDate}
                  onChange={this.onChangeIsCheckDate}
                />
              </span>
            </FlexItem>
          </FlexContent>
        </FormGroup>

        <FormGroup>
          <FlexContent>
            <FlexItem>
              <ControlLabel>
                {__(`Show only the user's assigned(created)`)} {this.props.type}
              </ControlLabel>
              <span style={{ marginLeft: "10px" }}>
                <FormControl
                  componentclass="checkbox"
                  checked={this.state.isCheckUser}
                  onChange={this.onChangeIsCheckUser}
                />
              </span>
            </FlexItem>
            <FlexItem>
              <ControlLabel>
                {__(`Show only user’s assigned (created)`)} {this.props.type}{" "}
                {__(`by department`)}
              </ControlLabel>
              <span style={{ marginLeft: "10px" }}>
                <FormControl
                  componentclass="checkbox"
                  checked={this.state.isCheckDepartment}
                  onChange={this.onChangeIsCheckDepartment}
                />
              </span>
            </FlexItem>
          </FlexContent>
        </FormGroup>

        {this.renderDominantUsers()}

        <FormGroup>
          <ControlLabel>Stages</ControlLabel>
          <div id="stages-in-pipeline-form">
            <Stages
              options={options}
              type={this.props.type}
              stages={this.state.stages}
              onChangeStages={this.onChangeStages}
              departments={this.props.departments}
            />
          </div>
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="times-circle"
            onClick={closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            name: pipelineName,
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: pipeline,
            confirmationUpdate: true,
          })}
        </ModalFooter>
      </div>
    );
  };

  render() {
    const { show, closeModal, pipeline, options } = this.props;

    if (!show) {
      return null;
    }

    const pipelineName =
      options && options.pipelineName
        ? options.pipelineName.toLowerCase()
        : "pipeline";

    return (
      <Transition appear show={show} as={Fragment}>
        <Dialog as="div" onClose={closeModal} className={` relative z-10`}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ModalOverlay />
          </Transition.Child>
          <DialogWrapper>
            <DialogContent>
              <Dialog.Panel className={` dialog-size-lg`}>
                <Dialog.Title as="h3">
                  {pipeline ? `Edit ${pipelineName}` : `Add ${pipelineName}`}
                  <Icon icon="times" size={24} onClick={closeModal} />
                </Dialog.Title>
                <Transition.Child>
                  <div className="dialog-description">
                    <Form renderContent={this.renderContent} />
                  </div>
                </Transition.Child>
              </Dialog.Panel>
            </DialogContent>
          </DialogWrapper>
        </Dialog>
      </Transition>
    );
  }
}

export default PipelineForm;
