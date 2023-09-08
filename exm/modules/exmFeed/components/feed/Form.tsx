import {
  AdditionalInfo,
  AdditionalItem,
  CreateFormContainer,
  CreateInput,
  FlexRow,
  UploadItems,
} from "../../styles";
import { Form, FormGroup } from "../../../common/form";
import { IButtonMutateProps, IFormProps } from "../../../common/types";
import React, { useState } from "react";
import { description, getDepartmentOptions, title } from "../../utils";

import ControlLabel from "../../../common/form/Label";
import GenerateFields from "../GenerateFields";
import Icon from "../../../common/Icon";
import ModalTrigger from "../../../common/ModalTrigger";
import NameCard from "../../../common/nameCard/NameCard";
import Select from "react-select-plus";
import Uploader from "../../../common/Uploader";
import { __ } from "../../../../utils";

type Props = {
  renderButton: (props: IButtonMutateProps) => any;
  item?: any;
  closeModal?: () => void;
  fields: any[];
  departments: any[];
};

export default function PostForm(props: Props) {
  const item = props.item || {};
  const fields = props.fields;
  const departments = props.departments || [];

  const [attachments, setAttachment] = useState(item.attachments || []);
  const [images, setImage] = useState(item.images || []);
  const [customFieldsData, setCustomFieldsData] = useState(
    item.customFieldsData || []
  );
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  const onChangeDepartment = (option: any) => {
    setSelectedDepartment(option);
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { renderButton, closeModal } = props;

    return (
      <>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          {title(formProps, item)}
        </FormGroup>
        <FormGroup>
          <ControlLabel>Main Post</ControlLabel>
          {description(formProps, item)}
        </FormGroup>
        <FormGroup>
          <ControlLabel>Choose department</ControlLabel>
          <Select
            placeholder="Choose one department"
            name="departmentId"
            value={selectedDepartment}
            onChange={onChangeDepartment}
            multi={false}
            options={getDepartmentOptions(departments)}
          />
        </FormGroup>
        {fields && fields.length !== 0 && (
          <FormGroup>
            <ControlLabel>Custom fields</ControlLabel>
            <GenerateFields
              fields={fields}
              customFieldsData={customFieldsData}
              setCustomFieldsData={setCustomFieldsData}
            />
          </FormGroup>
        )}
        <ControlLabel>Add to your post</ControlLabel>
        <UploadItems>
          <div>
            <Uploader
              defaultFileList={images || []}
              onChange={setImage}
              btnText="Cover Image"
              btnIcon="image"
              single={true}
              btnIconSize={30}
            />
          </div>
          <div>
            <Uploader
              defaultFileList={attachments || []}
              onChange={setAttachment}
              btnText="Attachments"
              btnIcon="files-landscapes-alt"
              btnIconSize={30}
            />
          </div>
        </UploadItems>

        {renderButton({
          values: {
            title: values.title,
            description: values.description ? values.description : null,
            contentType: "post",
            images,
            attachments,
            customFieldsData,
            department: selectedDepartment ? selectedDepartment.label : null,
          },
          isSubmitted,
          callback: closeModal,
        })}
      </>
    );
  };

  const content = (datas) => <Form {...datas} renderContent={renderContent} />;

  return (
    <CreateFormContainer>
      <FlexRow>
        <NameCard.Avatar user={{}} size={45} />
        <ModalTrigger
          dialogClassName="create-post"
          size="lg"
          title="Create post"
          trigger={<CreateInput>{__("What`s on your mind?")}</CreateInput>}
          content={content}
        />
      </FlexRow>
      <AdditionalInfo>
        <ModalTrigger
          dialogClassName="create-post"
          size="lg"
          title="Create post"
          trigger={
            <AdditionalItem>
              <Icon icon="picture" size={16} />
              <span>{__("Photo/video")}</span>
            </AdditionalItem>
          }
          content={content}
        />
      </AdditionalInfo>
    </CreateFormContainer>
  );
}
