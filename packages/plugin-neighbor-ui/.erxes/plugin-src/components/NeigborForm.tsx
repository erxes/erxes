import React, { useState } from "react";
import Tip from "@erxes/ui/src/components/Tip";
import { __ } from "@erxes/ui/src/utils";
import Icon from "@erxes/ui/src/components/Icon";
import Button from "@erxes/ui/src/components/Button";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import { TYPES } from "../constants";
import NeighorFormItem from "../containers/NeighorFormItem";

type Props = {
  neighbor: any;
  save: (variables: any) => void;
};

const NeighborForm = ({ neighbor, save }: Props) => {
  const [info, setInfo] = useState(neighbor ? neighbor.info || {} : {});

  const onChange = (type, values) => {
    setInfo({
      ...info,
      [type]: values,
    });
  };

  const renderTypes = TYPES.map((type) => {
    return (
      <NeighorFormItem
        type={type}
        itemInfo={info[type.type] || []}
        onChange={onChange}
      />
    );
  });

  const closeModal = (formProps) => {
    save(info);
    formProps.closeModal();
  };

  const content = (formProps) => {
    const cancel = (
      <Button
        btnStyle="simple"
        type="button"
        icon="times-circle"
        uppercase={false}
        onClick={formProps.closeModal}
      >
        Cancel
      </Button>
    );

    return (
      <>
        {renderTypes}
        {cancel}
        <Button
          onClick={() => closeModal(formProps)}
          btnStyle="success"
          type="button"
          icon="check-circle"
          uppercase={false}
        >
          Save
        </Button>
      </>
    );
  };

  const trigger = (
    <Button id="skill-edit-skill" btnStyle="link">
      <Tip text={__("Neighbor")} placement="bottom">
        <Icon icon="edit-3" />
      </Tip>
    </Button>
  );

  return (
    <ActionButtons>
      <ModalTrigger title={"neighbor"} trigger={trigger} content={content} />
    </ActionButtons>
  );
};

export default NeighborForm;
