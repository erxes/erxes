import Button from 'modules/common/components/Button';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import Toggle from 'modules/common/components/Toggle';
import { __ } from 'modules/common/utils';
import { ISkillData } from 'modules/settings/integrations/types';
import {
  ISkillDocument,
  ISkillTypesDocument
} from 'modules/settings/skills/types';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import styled from 'styled-components';

type Props = {
  skillData?: ISkillData[];
  onChange: (name: any, value: any) => void;
  skillTypes: ISkillTypesDocument[];
  skills: ISkillDocument[];
  handleSkillTypeSelect: (typeId: string) => void;
  loading: boolean;
};

type SkillOption = {
  label: string;
  response: string;
  skillId: string;
};

const Item = styled.div`
  padding: 12px 16px 0 16px;
  margin-bottom: 12px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #eee;
  position: relative;
`;

function BuildSkill({
  skillData = [],
  skillTypes,
  skills,
  loading,
  onChange,
  handleSkillTypeSelect
}: Props) {
  const [show, setShow] = useState<boolean>(false);
  const [skillType, setSkillType] = useState<string | null>(null);

  // const [skillOptions, setSkillOptions] = useState<ISkillData[]>(skillData = []);

  const handleToggle = e => setShow(e.target.checked);
  const handleSkillOptionChange = (
    index: number,
    type: string,
    value: string
  ) => {
    const currentSkillOptions = [...skillData];

    currentSkillOptions[index][type] = value;

    onChange('skillData', currentSkillOptions);
  };

  const generateOptions = (
    options: Array<ISkillDocument | ISkillTypesDocument>
  ) => options.map(item => ({ label: item.name, value: item._id }));

  function renderSkillOptions() {
    if (skillData.length === 0) {
      return null;
    }

    return skillData.map((option, index) => {
      const handleLabelChange = e =>
        handleSkillOptionChange(index, 'label', e.currentTarget.value);
      const handleResponseChange = e =>
        handleSkillOptionChange(index, 'response', e.currentTarget.value);
      const handleSkillChange = e =>
        handleSkillOptionChange(index, 'skillId', e.value);

      return (
        <Item key={index}>
          <FormGroup>
            <ControlLabel>Select a skill</ControlLabel>
            <Select
              placeholder="Choose a select"
              value={option.skillId}
              isLoading={loading}
              options={generateOptions(skills)}
              onChange={handleSkillChange}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Write a label</ControlLabel>
            <FormControl value={option.label} onChange={handleLabelChange} />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Message response</ControlLabel>
            <FormControl
              value={option.response}
              onChange={handleResponseChange}
            />
          </FormGroup>
        </Item>
      );
    });
  }

  function renderContent() {
    if (!show) {
      return null;
    }

    const handleSelectChange = option => {
      setSkillType(option.value);
      handleSkillTypeSelect(option.value);
    };

    const handleAdd = () => {
      const currentSkillOptions: SkillOption[] = [
        ...skillData,
        {
          label: '',
          response: '',
          skillId: ''
        }
      ];

      onChange('skillData', currentSkillOptions);
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>Choose a skill type</ControlLabel>
          <Select
            placeholder="Please select a skill type"
            value={skillType}
            options={generateOptions(skillTypes)}
            onChange={handleSelectChange}
          />
        </FormGroup>
        {skillType ? (
          <FormGroup>
            <Button
              btnStyle="primary"
              uppercase={false}
              icon="plus-circle"
              onClick={handleAdd}
            >
              Add skill option
            </Button>
          </FormGroup>
        ) : null}
        {renderSkillOptions()}
      </>
    );
  }

  return (
    <>
      <FormGroup>
        <ControlLabel>Show skill in messenger</ControlLabel>
        <p>{__('First please create skills in settings')}</p>

        <Toggle
          checked={show}
          onChange={handleToggle}
          icons={{
            checked: <span>{__('Yes')}</span>,
            unchecked: <span>{__('No')}</span>
          }}
        />
      </FormGroup>
      {renderContent()}
    </>
  );
}

export default BuildSkill;
