import { ColorPick, ColorPicker } from '@erxes/ui/src/styles/main';
import { Dialog, Transition } from '@headlessui/react';
import {
  DialogContent,
  DialogWrapper,
  ModalFooter,
  ModalOverlay
} from '@erxes/ui/src/styles/main';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import { IBoard, IPipeline, IStage } from '@erxes/ui-tasks/src/boards/types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { Fragment, useEffect, useState } from 'react';
import { __, generateTree } from 'coreui/utils';

import BoardNumberConfigs from './numberConfig/BoardNumberConfigs';
import BoardNameConfigs from './nameConfig/BoardNameConfigs';

import Button from '@erxes/ui/src/components/Button';
import { COLORS } from '@erxes/ui/src/constants/colors';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ExpandWrapper } from '@erxes/ui-settings/src/styles';
import { Flex } from '@erxes/ui/src/styles/main';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import { IOption } from '../types';
import { ITag } from '@erxes/ui-tags/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import Popover from '@erxes/ui/src/components/Popover';
import Select from 'react-select';
import { SelectMemberStyled } from '@erxes/ui-tasks/src/settings/boards/styles';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import Stages from './Stages';
import TwitterPicker from 'react-color/lib/Twitter';
import { colors } from '@erxes/ui/src/styles';

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
  branches: IBranch[];
};

const PipelineForm = (props: Props) => {
  const { pipeline, show, closeModal, options } = props;
  const [stages, setStages] = useState(
    (props.stages || []).map(stage => ({ ...stage }))
  );
  const [visibility, setVisibility] = useState(
    pipeline ? pipeline.visibility : 'public'
  );
  const [selectedMemberIds, setSelectedMemberIds] = useState(
    pipeline ? pipeline.memberIds : []
  );
  const [backgroundColor, setBackgroundColor] = useState(
    (pipeline && pipeline.bgColor) || colors.colorPrimaryDark
  );
  const [isCheckDate, setIsCheckDate] = useState(
    pipeline ? pipeline.isCheckDate : false
  );
  const [isCheckUser, setIsCheckUser] = useState(
    pipeline ? pipeline.isCheckUser : false
  );
  const [isCheckDepartment, setIsCheckDepartment] = useState(
    pipeline ? pipeline.isCheckDepartment : false
  );
  const [excludeCheckUserIds, setExcludeCheckUserIds] = useState(
    pipeline ? pipeline.excludeCheckUserIds : []
  );
  const [boardId, setBoardId] = useState(props.boardId || '');
  const [tagId, setTagId] = useState(pipeline ? pipeline.tagId : '');
  const [numberConfig, setNumberConfig] = useState(
    (pipeline && pipeline.numberConfig) || ''
  );
  const [numberSize, setNumberSize] = useState(
    (pipeline && pipeline.numberSize) || ''
  );

  const [nameConfig, setNameConfig] = useState(
    (pipeline && pipeline.nameConfig) || ''
  );

  const [departmentIds, setDepartmentIds] = useState(
    pipeline ? pipeline.departmentIds : []
  );
  const [branchIds, setBranchIds] = useState(
    pipeline ? pipeline.branchIds : []
  );
  useEffect(() => {
    setStages((props.stages || []).map(stage => ({ ...stage })));
  }, [props.stages]);

  const onChangeStages = stages => {
    setStages(stages);
  };

  const onChangeVisibility = (e: React.FormEvent<HTMLElement>) => {
    setVisibility((e.currentTarget as HTMLInputElement).value);
  };

  const onChangeMembers = items => {
    setSelectedMemberIds(items);
  };

  const onChangeDepartments = options => {
    setDepartmentIds((options || []).map(o => o.value));
  };
  const onChangeBranch = options => {
    setBranchIds((options || []).map(o => o.value));
  };
  const onChangeDominantUsers = items => {
    setExcludeCheckUserIds(items);
  };

  const onColorChange = e => {
    setBackgroundColor(e.hex);
  };

  const onChangeNumber = (key: string, value: string) => {
    if (key === 'numberConfig') {
      setNumberConfig(value);
    }
    if (key === 'numberSize') {
      setNumberSize(value);
    }
  };
  const onChangeName = (key: string, value: string) => {
    if (key === 'nameConfig') {
      setNameConfig(value);
    }
  };

  const generateDoc = (values: {
    _id?: string;
    name: string;
    visibility: string;
  }) => {
    const { pipeline, type, extraFields } = props;

    const finalValues = values;

    if (pipeline) {
      finalValues._id = pipeline._id;
    }

    return {
      ...finalValues,
      ...extraFields,
      type,
      boardId,
      stages: stages.filter(el => el.name),
      memberIds: selectedMemberIds,
      bgColor: backgroundColor,
      isCheckDate,
      isCheckUser,
      isCheckDepartment,
      excludeCheckUserIds,
      numberConfig,
      numberSize,
      nameConfig,
      departmentIds,
      tagId,
      branchIds
    };
  };

  const renderNumberInput = () => {
    return (
      <FormGroup>
        <BoardNumberConfigs
          onChange={(key: string, conf: string) => onChangeNumber(key, conf)}
          config={numberConfig || ''}
          size={numberSize || ''}
        />
      </FormGroup>
    );
  };

  const renderNameInput = () => {
    return (
      <FormGroup>
        <BoardNameConfigs
          onChange={(key: string, conf: string) => onChangeName(key, conf)}
          config={nameConfig || ''}
        />
      </FormGroup>
    );
  };

  const renderSelectMembers = () => {
    if (visibility === 'public') {
      return;
    }

    const departmentOptions = generateTree(
      props.departments,
      null,
      (node, level) => ({
        value: node._id,
        label: `${'---'.repeat(level)} ${node.title}`
      })
    );

    const branchesOptions = generateTree(
      props.branches,
      null,
      (node, level) => ({
        value: node._id,
        label: `${'---'.repeat(level)} ${node.title}`
      })
    );
    return (
      <>
        <FormGroup>
          <SelectMemberStyled>
            <ControlLabel>Members</ControlLabel>

            <SelectTeamMembers
              label='Choose members'
              name='selectedMemberIds'
              initialValue={selectedMemberIds}
              onSelect={onChangeMembers}
            />
          </SelectMemberStyled>
        </FormGroup>
        <FormGroup>
          <SelectMemberStyled>
            <ControlLabel>Departments</ControlLabel>
            <Select
              value={departmentOptions.filter(option =>
                departmentIds?.includes(option.value)
              )}
              options={departmentOptions}
              onChange={onChangeDepartments.bind(this)}
              placeholder={__('Choose department ...')}
              isMulti={true}
            />
          </SelectMemberStyled>
        </FormGroup>
        <FormGroup>
          <SelectMemberStyled>
            <ControlLabel>Branches</ControlLabel>
            <Select
              value={branchesOptions.filter(option =>
                branchIds?.includes(option.value)
              )}
              options={branchesOptions}
              onChange={onChangeBranch.bind(this)}
              placeholder={__('Choose branch ...')}
              isMulti={true}
            />
          </SelectMemberStyled>
        </FormGroup>
      </>
    );
  };

  const onChangeIsCheckDate = e => {
    const isChecked = (e.currentTarget as HTMLInputElement).checked;
    setIsCheckDate(isChecked);
  };

  const onChangeIsCheckUser = e => {
    const isChecked = (e.currentTarget as HTMLInputElement).checked;
    setIsCheckUser(isChecked);
  };

  const onChangeIsCheckDepartment = e => {
    const isChecked = (e.currentTarget as HTMLInputElement).checked;
    setIsCheckDepartment(isChecked);
  };

  const renderDominantUsers = () => {
    if (!isCheckUser && !isCheckDepartment) {
      return;
    }

    return (
      <FormGroup>
        <SelectMemberStyled>
          <ControlLabel>Users eligible to see all {props.type}</ControlLabel>

          <SelectTeamMembers
            label='Choose members'
            name='excludeCheckUserIds'
            initialValue={excludeCheckUserIds}
            onSelect={onChangeDominantUsers}
          />
        </SelectMemberStyled>
      </FormGroup>
    );
  };

  const renderBoards = () => {
    const { boards = [] } = props;

    const boardOptions = boards.map(board => ({
      value: board._id,
      label: board.name
    }));

    const onChange = item => {
      setBoardId(item.value);
    };

    return (
      <FormGroup>
        <ControlLabel required={true}>Board</ControlLabel>
        <Select
          placeholder={__('Choose a board')}
          value={boardOptions.find(option => option.value === boardId)}
          options={boardOptions}
          onChange={onChange}
          isClearable={true}
        />
      </FormGroup>
    );
  };

  const renderTags = () => {
    const { tags } = props;

    const filteredTags = tags && tags.filter(tag => !tag.parentId);

    const onChange = item => {
      setTagId(item?.value);
    };

    const generateOptions = items => {
      if (!items || items.length === 0) {
        return null;
      }

      return items.map(item => {
        return {
          value: item._id,
          label: item.name
        };
      });
    };

    return (
      <FormGroup>
        <ControlLabel>Tags</ControlLabel>
        <Select
          placeholder={__('Choose a tag')}
          value={(generateOptions(filteredTags) || []).find(
            option => option.value === tagId
          )}
          options={generateOptions(filteredTags)}
          isClearable={true}
          onChange={onChange}
        />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { pipeline, renderButton, closeModal, options, renderExtraFields } =
      props;
    const { values, isSubmitted } = formProps;
    const object = pipeline || ({} as IPipeline);
    const pipelineName =
      options && options.pipelineName
        ? options.pipelineName.toLowerCase()
        : 'pipeline';

    return (
      <div id='manage-pipeline-modal'>
        <FlexContent>
          <FlexItem count={4}>
            <FormGroup>
              <ControlLabel required={true}>Name</ControlLabel>
              <FormControl
                {...formProps}
                name='name'
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
                name='visibility'
                componentclass='select'
                value={visibility}
                onChange={onChangeVisibility}
              >
                <option value='public'>{__('Public')}</option>
                <option value='private'>{__('Private')}</option>
              </FormControl>
            </FormGroup>
          </ExpandWrapper>
          <FormGroup>
            <ControlLabel>Background</ControlLabel>
            <div>
              <Popover
                placement='bottom-end'
                trigger={
                  <ColorPick>
                    <ColorPicker style={{ backgroundColor: backgroundColor }} />
                  </ColorPick>
                }
              >
                <TwitterPicker
                  width='266px'
                  triangle='hide'
                  color={backgroundColor}
                  onChange={onColorChange}
                  colors={COLORS}
                />
              </Popover>
            </div>
          </FormGroup>
        </Flex>

        {renderBoards()}

        {renderTags()}

        {renderSelectMembers()}

        {renderNumberInput()}

        {renderNameInput()}

        <FormGroup>
          <FlexContent>
            <FlexItem>
              <ControlLabel>
                {__(`Select the day after the card created date`)}
              </ControlLabel>
              <span style={{ marginLeft: '10px' }}>
                <FormControl
                  componentclass='checkbox'
                  checked={isCheckDate}
                  onChange={onChangeIsCheckDate}
                />
              </span>
            </FlexItem>
          </FlexContent>
        </FormGroup>

        <FormGroup>
          <FlexContent>
            <FlexItem>
              <ControlLabel>
                {__(`Show only the user's assigned(created)`)} {props.type}
              </ControlLabel>
              <span style={{ marginLeft: '10px' }}>
                <FormControl
                  componentclass='checkbox'
                  checked={isCheckUser}
                  onChange={onChangeIsCheckUser}
                />
              </span>
            </FlexItem>
            <FlexItem>
              <ControlLabel>
                {__(`Show only user’s assigned (created)`)} {props.type}{' '}
                {__(`by department`)}
              </ControlLabel>
              <span style={{ marginLeft: '10px' }}>
                <FormControl
                  componentclass='checkbox'
                  checked={isCheckDepartment}
                  onChange={onChangeIsCheckDepartment}
                />
              </span>
            </FlexItem>
          </FlexContent>
        </FormGroup>

        {renderDominantUsers()}

        <FormGroup>
          <ControlLabel>Stages</ControlLabel>
          <div id='stages-in-pipeline-form'>
            <Stages
              options={options}
              type={props.type}
              stages={stages}
              onChangeStages={onChangeStages}
              departments={props.departments}
            />
          </div>
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle='simple'
            type='button'
            icon='times-circle'
            onClick={closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            name: pipelineName,
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: pipeline,
            confirmationUpdate: true
          })}
        </ModalFooter>
      </div>
    );
  };

  if (!show) {
    return null;
  }

  const pipelineName =
    options && options.pipelineName
      ? options.pipelineName.toLowerCase()
      : 'pipeline';

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as='div' onClose={() => {}} className={` relative z-10`}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <ModalOverlay />
        </Transition.Child>
        <DialogWrapper>
          <DialogContent>
            <Dialog.Panel className={`dialog-size-xl`}>
              <Dialog.Title as='h3'>
                {pipeline ? `Edit ${pipelineName}` : `Add ${pipelineName}`}
                <Icon icon='times' size={24} onClick={closeModal} />
              </Dialog.Title>
              <Transition.Child>
                <div className='dialog-description'>
                  <Form renderContent={renderContent} />
                </div>
              </Transition.Child>
            </Dialog.Panel>
          </DialogContent>
        </DialogWrapper>
      </Dialog>
    </Transition>
  );
};

export default PipelineForm;
