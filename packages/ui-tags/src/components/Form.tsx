import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import { COLORS } from "@erxes/ui/src/constants/colors";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import Form from "@erxes/ui/src/components/form/Form";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { ITag } from "../types";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import Popover from "@erxes/ui/src/components/Popover";
import TwitterPicker from "react-color/lib/Twitter";
import { colors } from "@erxes/ui/src/styles";
import { getRandomNumber } from "@erxes/ui/src/utils";
import styled from "styled-components";

const ColorPick = styled.div`
  margin-top: 10px;
  border-radius: 4px;
  padding: 2px;
  border: 1px solid ${colors.borderDarker};
  cursor: pointer;
`;

const ColorPicker = styled.div`
  width: 100px;
  height: 20px;
  border-radius: 2px;
`;

type FormComponentProps = {
  tag?: ITag;
  tagType: string;
  types: any[];
  afterSave: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal?: () => void;
  tags: ITag[];
};

type IItem = {
  order?: string;
  name: string;
  _id: string;
};

const FormComponent: React.FC<FormComponentProps> = ({
  tag,
  closeModal,
  afterSave,
  renderButton,
  tags,
  tagType,
  types,
}) => {
  const [colorCode, setColorCode] = useState<string>(
    tag ? tag.colorCode || "" : COLORS[getRandomNumber(7)]
  );

  const onColorChange = (e: { hex: string }) => {
    setColorCode(e.hex);
  };

  const generateDoc = (values: {
    _id?: string;
    name: string;
    type: string;
    parentId?: string;
  }) => {
    const finalValues = values;

    if (tag) {
      finalValues._id = tag._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name,
      colorCode: colorCode,
      type: finalValues.type,
      parentId: finalValues.parentId,
    };
  };

  const generateTagOptions = (tags: IItem[], currentTagId?: string) => {
    const result: React.ReactNode[] = [];

    for (const tag of tags) {
      const order = tag.order || "";

      const foundedString = order.match(/[/]/gi);

      let space = "";

      if (foundedString) {
        space = "\u00A0 ".repeat(foundedString.length);
      }

      if (currentTagId !== tag._id) {
        result.push(
          <option key={tag._id} value={tag._id}>
            {space}
            {tag.name}
          </option>
        );
      }
    }

    return result;
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const object = tag || ({} as ITag);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Color</ControlLabel>
          <Popover
            placement="bottom-start"
            trigger={
              <ColorPick>
                <ColorPicker style={{ backgroundColor: colorCode }} />
              </ColorPick>
            }
          >
            <TwitterPicker
              width="266px"
              color={colorCode}
              onChange={onColorChange}
              colors={COLORS}
            />
          </Popover>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Tags Type</ControlLabel>
          <FormControl
            {...formProps}
            name="type"
            defaultValue={object.type || tagType}
            required={true}
            componentclass="select"
          >
            {types.map((type: any, index: number) => (
              <option value={type.contentType} key={index}>
                {type.description}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        {tags && (
          <FormGroup>
            <ControlLabel>Parent Tag</ControlLabel>

            <FormControl
              {...formProps}
              name="parentId"
              componentclass="select"
              defaultValue={object.parentId}
            >
              <option value="" />
              {generateTagOptions(tags, object._id)}
            </FormControl>
          </FormGroup>
        )}

        <ModalFooter id={"AddTagButtons"}>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel
          </Button>

          {renderButton({
            name: "tag",
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal || afterSave,
            object: tag,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default FormComponent;
