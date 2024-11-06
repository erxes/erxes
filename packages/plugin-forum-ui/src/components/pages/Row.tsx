import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import Button from "@erxes/ui/src/components/Button";
import { DetailLink } from "../../styles";
import FormControl from "@erxes/ui/src/components/form/Control";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { IPage } from "../../types";
import Icon from "@erxes/ui/src/components/Icon";
import { Link } from "react-router-dom";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import PageForm from "./PageForm";
import React from "react";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "@erxes/ui/src/utils";

type Props = {
  page: IPage;
  remove: (pageId: string, emptyBulk?: () => void) => void;
  isChecked?: boolean;
  toggleBulk: (target: any, toAdd: boolean) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

class Row extends React.Component<Props> {
  renderEditAction(page) {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__("Edit")} placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    const content = (props) => (
      <PageForm {...props} renderButton={this.props.renderButton} page={page} />
    );

    return (
      <ModalTrigger
        title={__(`Edit Page`)}
        size="lg"
        trigger={trigger}
        content={content}
      />
    );
  }

  renderRemoveAction() {
    const { page, remove } = this.props;

    const onClick = () => remove(page._id);

    return (
      <Tip text={__("Delete")} placement="top">
        <Button
          id="pageDelete"
          btnStyle="link"
          onClick={onClick}
          icon="times-circle"
        />
      </Tip>
    );
  }

  render() {
    const { page, isChecked, toggleBulk } = this.props;

    const onChange = (e) => {
      if (toggleBulk) {
        toggleBulk(page, e.target.checked);
      }
    };

    const onClick = (e) => {
      e.stopPropagation();
    };

    return (
      <tr>
        <td id="pagesCheckBox" onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentclass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>
          <DetailLink>
            <Link to={`/forum/pages/${page._id}`}>{page.title}</Link>
          </DetailLink>
        </td>
        <td>{page.code}</td>
        <td>{page.listOrder}</td>
        <td>
          <ActionButtons>
            {this.renderEditAction(page)}
            {this.renderRemoveAction()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
