import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import Button from "@erxes/ui/src/components/Button";
import { FormControl } from "@erxes/ui/src/components/form";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Tip from "@erxes/ui/src/components/Tip";
import { colors, dimensions } from "@erxes/ui/src/styles";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { __ } from "@erxes/ui/src/utils";
import React from "react";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import { ICurriculum, IType } from "../types";
import Form from "./Form";

const CurriculumNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs(
  {}
)`
    color: ${colors.colorCoreBlack};
    text-decoration: ${(props) => (props.checked ? "line-through" : "none")}
    `;

export const CurriculumWrapper = styledTS<{ space: number }>(
  styled.div
)`padding-left: ${(props) => props.space * 20}px;
  display:inline-flex;
  justify-content:flex-start;
  align-items: center;
`;

const Margin = styledTS(styled.div)`
 margin: ${dimensions.unitSpacing}px;
`;

type Props = {
  curriculum: ICurriculum;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  curriculums: ICurriculum[];
  remove: (curriculum: ICurriculum) => void;
  edit: (curriculum: ICurriculum) => void;
  types?: IType[];
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  Activities({ curriculum, checked }) {
    return (
      <CurriculumNameStyled checked={checked}>
        {curriculum.name}
      </CurriculumNameStyled>
    );
  }

  removeCurriculum = () => {
    const { remove, curriculum } = this.props;

    remove(curriculum);
  };

  toggleCheck = () => {
    const { edit, curriculum } = this.props;

    edit({ _id: curriculum._id, checked: !curriculum.checked });
  };

  render() {
    const { curriculum, renderButton, space, curriculums, types } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__("Edit")} placement="top">
          <Icon icon="edit-3"></Icon>
        </Tip>
      </Button>
    );

    const content = (props) => (
      <Form
        {...props}
        types={types}
        curriculum={curriculum}
        renderButton={renderButton}
        curriculums={curriculums}
      />
    );

    const extractDate = curriculum.expiryDate
      ? curriculum.expiryDate?.toString().split("T")[0]
      : "-";

    return (
      <tr>
        <td>
          <CurriculumWrapper space={space}>
            <FormControl
              componentclass="checkbox"
              onChange={this.toggleCheck}
              color={colors.colorPrimary}
              defaultChecked={curriculum.checked || false}
            ></FormControl>
            <Margin>
              <this.Activities
                curriculum={curriculum}
                checked={curriculum.checked || false}
              />
            </Margin>
          </CurriculumWrapper>
        </td>
        <td>{extractDate}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title="Edit curriculum"
              trigger={editTrigger}
              content={content}
            />

            <Tip text={__("Delete")} placement="top">
              <Button
                btnStyle="link"
                onClick={this.removeCurriculum}
                icon="times-circle"
              />
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
