import { FormContent, FormFooter } from "../../styles";
import { IDashboard, IReportTemplate } from "../../types";
import React, { useState } from "react";

import Alert from "@erxes/ui/src/utils/Alert/index";
import Button from "@erxes/ui/src/components/Button";
import { Form as CommonForm } from "@erxes/ui/src/components/form";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IFormProps } from "@erxes/ui/src/types";
import ReportTemplate from "../template/Report";
import SelectMembersForm from "../utils/SelectMembersForm";
import SelectSections from "../../containers/utils/SelectSections";
import { __ } from "@erxes/ui/src/utils/index";
import { capitalize } from "lodash";
import { groupServiceTypesByServiceName } from "../../utils";

type Props = {
  queryParams: any;

  dashboard?: IDashboard;
  reportTemplates: IReportTemplate[];

  closeDrawer: () => void;
  handleMutation(values: any): void;
};

const Form = (props: Props) => {
  const { dashboard, reportTemplates, closeDrawer, handleMutation } = props;

  const servicesGroup = groupServiceTypesByServiceName(reportTemplates);

  const [name, setName] = useState<string>(dashboard?.name || "");
  const [sectionId, setSectionId] = useState<string>(
    dashboard?.sectionId || ""
  );

  const [userIds, setUserIds] = useState(dashboard?.assignedUserIds || []);
  const [departmentIds, setDepartmentIds] = useState(
    dashboard?.assignedDepartmentIds || []
  );

  const [visibility, setVisibility] = useState(
    dashboard?.visibility || "public"
  );

  const [serviceTypes, setServiceTypes] = useState<string[]>(
    dashboard?.serviceTypes || []
  );

  const [templateCharts, setTemplateCharts] = useState<string[]>([]);
  const [serviceNames, setServiceNames] = useState<string[]>(
    dashboard?.serviceNames || []
  );

  const handleSubmit = () => {
    if (!name || serviceNames.length === 0 || !sectionId) {
      return Alert.warning(__("Please fill the required fields"));
    }

    handleMutation({
      name,
      visibility,
      sectionId,
      assignedUserIds: userIds,
      assignedDepartmentIds: departmentIds,
      serviceTypes: Array.from([...new Set(serviceTypes)]),
      charts: Array.from([...new Set(templateCharts)]),
      serviceNames: Array.from([...new Set(serviceNames)]),
    });
  };

  const handleUserChange = (_userIds) => {
    setUserIds(_userIds);
  };

  const handleDepartmentChange = (_departmentIds) => {
    setDepartmentIds(_departmentIds);
  };

  const calculateName = () => {
    return serviceNames.map((type) => capitalize(type)).join(" & ") + " Charts";
  };

  const handleTemplateClick = (template) => {
    const { serviceType, serviceName, charts } = template;

    const isTemplateSelected = serviceTypes.includes(serviceType);

    if (!isTemplateSelected) {
      setServiceNames(Array.from(new Set([...serviceNames, serviceName])));
      setServiceTypes([...serviceTypes, serviceType]);
    } else {
      const remainingServiceTypes = servicesGroup[serviceName].filter((type) =>
        serviceTypes.includes(type)
      );

      if (
        remainingServiceTypes.length === 1 &&
        remainingServiceTypes[0] === serviceType
      ) {
        setServiceNames(serviceNames.filter((name) => name !== serviceName));
      }

      setServiceTypes(serviceTypes.filter((type) => type !== serviceType));

      const updatedTemplateCharts = templateCharts.filter(
        (chart) => !charts.includes(chart)
      );
      setTemplateCharts(updatedTemplateCharts);
    }
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormContent>
          <FormGroup>
            <ControlLabel required={true}>Dashboard Name</ControlLabel>
            <FormControl
              {...formProps}
              name="name"
              value={name}
              required={true}
              placeholder={__("Dashboard Name")}
              onChange={(e) => setName((e.target as any).value)}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel required={true}>{__("Choose Section")}</ControlLabel>
            <SelectSections
              sectionId={sectionId}
              setSectionId={setSectionId}
              type="dashboard"
            />
          </FormGroup>

          <FormGroup>
            {/* <ControlLabel>Visibility</ControlLabel> */}

            <FormControl
              {...formProps}
              componentclass="checkbox"
              name="public"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
            >
              {__("Public")}
            </FormControl>

            <FormControl
              {...formProps}
              componentclass="checkbox"
              name="private"
              checked={visibility === "private"}
              onChange={() => setVisibility("private")}
            >
              {__("Private")}
            </FormControl>
          </FormGroup>

          {visibility === "private" && (
            <FormGroup>
              <SelectMembersForm
                userIds={userIds}
                departmentIds={departmentIds}
                handleDepartmentChange={handleDepartmentChange}
                handleUserChange={handleUserChange}
              />
            </FormGroup>
          )}

          <FormGroup>
            <ControlLabel required={true}>
              Create reports from templates
            </ControlLabel>

            {reportTemplates.map((template, index) => {
              return (
                <ReportTemplate
                  key={index}
                  report={dashboard}
                  template={template}
                  selectedTemplateType={serviceTypes}
                  handleTemplateClick={handleTemplateClick}
                  templateCharts={templateCharts}
                  setTemplateCharts={setTemplateCharts}
                />
              );
            })}
          </FormGroup>
        </FormContent>

        <FormFooter>
          <Button btnStyle="simple" onClick={closeDrawer}>
            {__("Cancel")}
          </Button>
          <Button btnStyle="success" onClick={handleSubmit}>
            Save
          </Button>
        </FormFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default Form;
