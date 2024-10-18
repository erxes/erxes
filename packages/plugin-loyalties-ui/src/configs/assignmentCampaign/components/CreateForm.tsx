import React, { useState } from "react";
import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormControl,
  FormGroup,
  DateControl,
  Uploader,
  DataWithLoader
} from "@erxes/ui/src/components";
import { RichTextEditor } from "@erxes/ui/src/components/richTextEditor/TEditor";
import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleDateContainer as DateContainer
} from "@erxes/ui/src/styles/eindex";
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from "@erxes/ui/src/types";
import { IAssignmentCampaign } from "../types";
import { extractAttachment, __ } from "@erxes/ui/src/utils";
import { isEnabled } from "@erxes/ui/src/utils/core";
import Select from "react-select";
import { IVoucherCampaign } from "../../voucherCampaign/types";
import { Wrapper } from "@erxes/ui/src/layout";
import { Title } from "@erxes/ui-settings/src/styles";
import Sidebar from "../../general/components/Sidebar";
import { FormFooter, SettingsContent } from "../../../styles";
import { Link } from "react-router-dom";
import SelectSegments from "@erxes/ui-segments/src/containers/SelectSegments";
import { useNavigate } from "react-router-dom";

type Props = {
  assignmentCampaign?: IAssignmentCampaign;
  voucherCampaigns: IVoucherCampaign[];
  queryParams: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

const CreateForm = (props: Props) => {
  const [assignmentCampaign, setAssignmentCampaign] = useState(
    props.assignmentCampaign || ({} as IAssignmentCampaign)
  );
  const navigate = useNavigate();

  const generateDoc = (values: {
    _id?: string;
    attachment?: IAttachment;
    description: string;
  }) => {
    const finalValues = values;

    if (assignmentCampaign._id) {
      finalValues._id = assignmentCampaign._id;
    }

    return {
      ...finalValues,
      ...assignmentCampaign
    };
  };

  const onChangeDescription = (content: string) => {
    setAssignmentCampaign({
      ...assignmentCampaign,
      description: content
    });
  };

  const onChangeAttachment = (files: IAttachment[]) => {
    setAssignmentCampaign({
      ...assignmentCampaign,
      attachment: files.length ? files[0] : undefined
    });
  };

  const onDateInputChange = (type: string, date) => {
    setAssignmentCampaign({
      ...assignmentCampaign,
      [type]: date
    });
  };

  const onInputChange = e => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    setAssignmentCampaign({
      ...assignmentCampaign,
      [name]: value
    });
  };

  const renderContent = (formProps: IFormProps) => {
    const { renderButton } = props;
    const { values, isSubmitted } = formProps;

    const onChangeVoucherCampaign = selected => {
      const value = (selected || {}).value;

      setAssignmentCampaign({
        ...assignmentCampaign,
        voucherCampaignId: value
      });
    };

    const onChangeSegments = segmentIds => {
      setAssignmentCampaign({
        ...assignmentCampaign,
        segmentIds
      });
    };

    const attachments =
      (assignmentCampaign.attachment &&
        extractAttachment([assignmentCampaign.attachment])) ||
      [];

    const onSave = () => {
      navigate(`/erxes-plugin-loyalty/settings/assignment`);
    };

    const selectOptions = props.voucherCampaigns.map(voucher => ({
      label: `${voucher.title}`,
      value: voucher._id
    }));

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>title</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={assignmentCampaign.title}
            autoFocus={true}
            required={true}
            onChange={onInputChange}
          />
        </FormGroup>

        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Start Date</ControlLabel>
              <DateContainer>
                <DateControl
                  {...formProps}
                  required={true}
                  name="startDate"
                  placeholder={__("Start date")}
                  value={assignmentCampaign.startDate}
                  onChange={onDateInputChange.bind(this, "startDate")}
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>End Date</ControlLabel>
              <DateContainer>
                <DateControl
                  {...formProps}
                  required={true}
                  name="endDate"
                  placeholder={__("End date")}
                  value={assignmentCampaign.endDate}
                  onChange={onDateInputChange.bind(this, "endDate")}
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Finish Date of Use</ControlLabel>
              <DateContainer>
                <DateControl
                  {...formProps}
                  required={true}
                  name="finishDateOfUse"
                  placeholder={__("Finish date of use")}
                  value={assignmentCampaign.finishDateOfUse}
                  onChange={onDateInputChange.bind(this, "finishDateOfUse")}
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        <FormGroup>
          <ControlLabel>Segments</ControlLabel>
          <SelectSegments
            name="segmentIds"
            label={__("Choose segments")}
            contentTypes={["core:customer", "core:lead"]}
            initialValue={assignmentCampaign.segmentIds}
            multi={true}
            onSelect={onChangeSegments}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Voucher Campaign</ControlLabel>
          <Select
            placeholder={__("Choose voucher campaign")}
            value={selectOptions.find(
              o => o.value === assignmentCampaign.voucherCampaignId
            )}
            isClearable={true}
            options={selectOptions}
            name="voucherCampaignId"
            onChange={onChangeVoucherCampaign}
            // loadingPlaceholder={__('Loading...')}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <RichTextEditor
            content={assignmentCampaign.description || ""}
            onChange={onChangeDescription}
            height={150}
            isSubmitted={formProps.isSaved}
            name={`assignmentCampaign_description_${assignmentCampaign.description}`}
            toolbar={[
              "bold",
              "italic",
              "orderedList",
              "bulletList",
              "link",
              "unlink",
              "|",
              "image"
            ]}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Featured image</ControlLabel>

          <Uploader
            defaultFileList={attachments}
            onChange={onChangeAttachment}
            multiple={false}
            single={true}
          />
        </FormGroup>
        <FormFooter>
          <Link to={`/erxes-plugin-loyalty/settings/assignment`}>
            <Button
              btnStyle="simple"
              onClick={() => {}}
              icon="times-circle"
              uppercase={false}
            >
              Close
            </Button>
          </Link>
          {renderButton({
            name: "Assignment Campaign",
            values: generateDoc(values),
            isSubmitted,
            object: assignmentCampaign,
            callback: onSave
          })}
        </FormFooter>
      </>
    );
  };

  const breadcrumb = [
    { title: __("Settings"), link: "/settings" },
    { title: __("Assignment Campaign") }
  ];

  const content = (
    <SettingsContent>
      <CommonForm renderContent={renderContent} />
    </SettingsContent>
  );
  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__("Create Assignment Campaign")}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__("Create Assignment Campaign")}</Title>}
        />
      }
      content={
        <DataWithLoader
          data={content}
          loading={false}
          emptyText={__("There is no data")}
          emptyImage="/images/actions/5.svg"
        />
      }
      leftSidebar={<Sidebar />}
      transparent={true}
      hasBorder
    />
  );
};

export default CreateForm;
