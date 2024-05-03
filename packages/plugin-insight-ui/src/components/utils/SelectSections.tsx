import React, { useState } from "react";

import CreatableSelect from "react-select/creatable";

import Icon from "@erxes/ui/src/components/Icon";
import { __ } from "@erxes/ui/src/utils/index";

import { ISection, SectionMutationVariables } from "../../types";
import { CustomOption } from "../../styles";

type Props = {
  type: "dashboard" | "goal" | "report";
  sections: ISection[];
  sectionId: string;
  setSectionId(value: string): void;
  addSection(values: SectionMutationVariables): void;
};

const SelectSections = (props: Props) => {
  const { type, sections, sectionId, setSectionId, addSection } = props;

  const [input, setInput] = useState<string>("");

  const handleClick = () => {
    if (input === "" && input.length < 2) {
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

    return optionsWithButton;
  };

  return (
    <CreatableSelect
      placeholder={__("Choose a section")}
      value={generateOptions(sections).find((o) => o.value === sectionId)}
      onChange={(selectedOption) => setSectionId(selectedOption.value)}
      options={generateOptions(sections)}
      isClearable={false}
      // noResultsText={customOption}
      onInputChange={(value) => setInput(value)}
      required={true}
    />
  );
};

export default SelectSections;
