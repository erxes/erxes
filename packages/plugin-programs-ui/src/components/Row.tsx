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
import { IProgram, IType } from "../types";
import Form from "./Form";

const ProgramNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs({})`
    color: ${colors.colorCoreBlack};
    text-decoration: ${(props) => (props.checked ? "line-through" : "none")}
    `;

export const ProgramWrapper = styledTS<{ space: number }>(
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
  program: IProgram;
  space: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  programs: IProgram[];
  remove: (program: IProgram) => void;
  edit: (program: IProgram) => void;
  types?: IType[];
};

type State = {
  checked: boolean;
};

class Row extends React.Component<Props, State> {
  Activities({ program, checked }) {
    return (
      <ProgramNameStyled checked={checked}>{program.name}</ProgramNameStyled>
    );
  }

  removeProgram = () => {
    const { remove, program } = this.props;

    remove(program);
  };

  toggleCheck = () => {
    const { edit, program } = this.props;

    edit({ _id: program._id, checked: !program.checked });
  };

  render() {
    const { program, renderButton, space, programs, types } = this.props;

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
        program={program}
        renderButton={renderButton}
        programs={programs}
      />
    );

    const extractDate = program.expiryDate
      ? program.expiryDate?.toString().split("T")[0]
      : "-";

    return (
      <tr>
        <td>
          <ProgramWrapper space={space}>
            <FormControl
              componentclass="checkbox"
              onChange={this.toggleCheck}
              color={colors.colorPrimary}
              defaultChecked={program.checked || false}
            ></FormControl>
            <Margin>
              <this.Activities
                program={program}
                checked={program.checked || false}
              />
            </Margin>
          </ProgramWrapper>
        </td>
        <td>{extractDate}</td>
        <td>
          <ActionButtons>
            <ModalTrigger
              title="Edit program"
              trigger={editTrigger}
              content={content}
            />

            <Tip text={__("Delete")} placement="top">
              <Button
                btnStyle="link"
                onClick={this.removeProgram}
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
