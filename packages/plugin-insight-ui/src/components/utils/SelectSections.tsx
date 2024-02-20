import { Icon, __ } from '@erxes/ui/src';
import React, { useState } from 'react';
import Select, { Option } from 'react-select-plus';
import { CustomOption } from '../../styles';
import { ISection, SectionMutationVariables } from '../../types';

type Props = {
  type: 'dashboard' | 'goal' | 'report';
  sections: ISection[];
  sectionId: string;
  setSectionId(value: string): void;
  addSection(values: SectionMutationVariables): void;
};

const SelectSections = (props: Props) => {
  const { type, sections, sectionId, setSectionId, addSection } = props;

  const [input, setInput] = useState<string>('');

  const handleClick = () => {
    if (input === '' && input.length < 2) {
      return;
    }

    addSection({ name: input, type });
  };

  const customOption = (
    <CustomOption onClick={handleClick}>
      <Icon className="list-icon" icon="plus-1" />
      <div>Section</div>
    </CustomOption>
  );

  const generateOptions = (options) => {
    const optionsWithButton = options.map((option) => ({
      label: option.name,
      value: option._id,
    }));

    // optionsWithButton.push({
    //   label: '',
    //   value: '',
    //   disabled: true
    // });
    return optionsWithButton;
  };

  // const optionRenderer = option => {
  //   if (option.value === '') {
  //     return customOption;
  //   } else {
  //     return <div>{option.label}</div>;
  //   }
  // };

  return (
    <Select
      placeholder={__('Choose a section')}
      value={sectionId}
      onChange={(selectedOption) => setSectionId(selectedOption.value)}
      options={generateOptions(sections)}
      // optionRenderer={optionRenderer}
      clearable={false}
      noResultsText={customOption}
      onInputChange={(value) => setInput(value)}
      required={true}
    />
  );
};

export default SelectSections;
