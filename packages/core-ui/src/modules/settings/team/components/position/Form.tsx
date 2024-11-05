import { FormControl, FormGroup } from "@erxes/ui/src/components/form";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import Form from "@erxes/ui/src/components/form/Form";
import { IBranch, ICoordinate } from "@erxes/ui/src/team/types";
import { ModalFooter } from "@erxes/ui/src/styles/main";
import SelectTeamMembers from "@erxes/ui/src/team/containers/SelectTeamMembers";
import { __ } from "modules/common/utils";
import SelectPositions from "@erxes/ui/src/team/containers/SelectPositions";

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  item?: IBranch;
  closeModal: () => void;
};

export default function BranchForm(props: Props) {
  const { closeModal, renderButton, item } = props;
  const object = item || ({} as IBranch);

  const [userIds, setUserIds] = useState(
    (object.users || []).map((user) => user._id),
  );
  const [parentId, setParentId] = useState(object.parentId || null);

  const coordinateObj = object.coordinate || ({} as ICoordinate);

  const generateDoc = (values) => {
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      userIds,
      parentId,
      links: object.links,
      coordinate: {
        longitude: coordinateObj.longitude || "",
        latitude: coordinateObj.latitude || "",
      },
      supervisorId: object.supervisorId,
      image: object.image,
      ...finalValues,
      radius: Number(finalValues.radius),
    };
  };

  const onChangeParent = (value: string) => {
    if (value) {
      setParentId(value);
    } else {
      setParentId(null);
    }
  };

  const onSelectTeamMembers = (ids: string[] | string) => {
    if (Array.isArray(ids)) {
      setUserIds(ids);
    } else {
      setUserIds([ids]);
    }
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__("Title")}</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={object.title}
            autoFocus={true}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__("Code")}</ControlLabel>
          <FormControl
            {...formProps}
            required={true}
            name="code"
            defaultValue={object.code}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__("Parent")}</ControlLabel>
          <SelectPositions
            label="Position"
            name="parentId"
            multi={false}
            initialValue={parentId || undefined}
            onSelect={onChangeParent}
            filterParams={{ withoutUserFilter: true }}
          />
          {/* <FormControl
            {...formProps}
            name="parentId"
            componentclass="select"
            defaultValue={parentId || null}
            onChange={(e) => onChangeParent}
          >
            <option value="" />
            {generateOptions()}
          </FormControl> */}
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__("Team Members")}</ControlLabel>

          <SelectTeamMembers
            label="Choose team members"
            name="userIds"
            initialValue={userIds}
            onSelect={onSelectTeamMembers}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="times-circle"
            onClick={closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            name: values.title,
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}
