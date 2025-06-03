import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import Button from "@erxes/ui/src/components/Button";
import Icon from "@erxes/ui/src/components/Icon";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import Tip from "@erxes/ui/src/components/Tip";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { __ } from "@erxes/ui/src/utils";
import React from "react";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import Form from "./Form";
import { IBundleCondition, IBundleRule } from "@erxes/ui-products/src/types";

export const TagWrapper = styledTS<{ space: number }>(styled.div)`
  padding-left: ${props => props.space * 20}px;
`;

type Props = {
  item: IBundleRule;
  remove: (item: IBundleRule) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  bundleConditions: IBundleCondition[];
};

const Row: React.FC<Props> = props => {
  const { renderButton, remove, item, bundleConditions } = props;

  const renderEditAction = item => {
    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__("Edit")} placement="bottom">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    const content = props => (
      <Form
        {...props}
        bundleRule={item}
        extended={true}
        renderButton={renderButton}
        bundleConditions={bundleConditions}
      />
    );

    return (
      <ModalTrigger
        size="lg"
        title="Edit"
        trigger={editTrigger}
        content={content}
      />
    );
  };

  const removeHandler = item => {
    remove(item);
  };

  return (
    <tr>
      <td>{item.name || ""}</td>
      <td>{item.description || ""}</td>
      <td>
        <ActionButtons>
          {renderEditAction(item)}
          <Tip text={__("Delete")} placement="bottom">
            <Button
              btnStyle="link"
              onClick={() => removeHandler(item)}
              icon="times-circle"
            />
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
};

export default Row;
