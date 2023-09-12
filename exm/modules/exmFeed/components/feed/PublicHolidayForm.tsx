import { CustomRangeContainer, UploadItems } from "../../styles";
import { IButtonMutateProps, IFormProps } from "../../../common/types";
import React, { useState } from "react";
import { description, title } from "../../utils";

import ControlLabel from "../../../common/form/Label";
import DateControl from "../../../common/form/DateControl";
import { Form } from "../../../common/form";
import GenerateFields from "../GenerateFields";
import Uploader from "../../../common/Uploader";

type Props = {
  renderButton: (props: IButtonMutateProps) => any;
  item?: any;
  closeModal?: () => void;
  fields: any[];
};

export default function PostForm(props: Props) {
  const item = props.item || {};
  const fields = props.fields;

  const [images, setImage] = useState(item.images || []);
  const [createdAt, setCreatedAt] = useState(item.createdAt);
  const [customFieldsData, setCustomFieldsData] = useState(
    item.customFieldsData || []
  );

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, closeModal } = props;

    return (
      <>
        {title(formProps, item)}
        {description(formProps, item)}
        <CustomRangeContainer>
          <DateControl
            value={createdAt}
            required={false}
            name="createdAt"
            onChange={(date) => setCreatedAt(date)}
            placeholder={"Date"}
            dateFormat={"YYYY-MM-DD HH:mm:ss"}
            timeFormat={true}
          />
        </CustomRangeContainer>
        <GenerateFields
          fields={fields}
          customFieldsData={customFieldsData}
          setCustomFieldsData={setCustomFieldsData}
        />
        <UploadItems>
          <div>
            <ControlLabel>Add image:</ControlLabel>
            <Uploader defaultFileList={images || []} onChange={setImage} />
          </div>
        </UploadItems>
        {renderButton({
          values: {
            title: values.title,
            description: values.description ? values.description : null,
            contentType: "publicHoliday",
            images,
            createdAt,
            customFieldsData,
          },
          isSubmitted,
          callback: closeModal,
        })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}
