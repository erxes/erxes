import {
  Button,
  ControlLabel,
  FormControl,
  TabTitle,
  Tabs,
} from "@erxes/ui/src/components";
import { CenterBar, FlexCenter, FlexColumn } from "../../styles";
import React, { useEffect, useState } from "react";

import { FlexRow } from "@erxes/ui-settings/src/styles";
import { Form } from "@erxes/ui/src";
import { IFormProps } from "@erxes/ui/src/types";
import SelectMembersForm from "../utils/SelectMembersForm";
import { __ } from "@erxes/ui/src/utils";

type Props = {
  history: any;
  queryParams: any;

  chartTemplates: any[];
  chartsOfReportTemplate: string[];

  reportName?: string;
  reportTemplateType?: string | null;
  createReport(values: any): void;
  setShowModal(showModal: boolean): void;
};

const ReportFormModal = (props: Props) => {
  const {
    createReport,
    setShowModal,
    reportTemplateType,
    reportName,
    chartTemplates,
    chartsOfReportTemplate,
  } = props;

  const [totalFilters, setTotalFilters] = useState<any[]>([{}]);
  const [visibility, setVisibility] = useState("public");
  const [userIds, setUserIds] = useState([]);
  const [departmentIds, setDepartmentIds] = useState([]);

  const [templateCharts, setTemplateCharts] = useState<{
    [templateType: string]: boolean;
  }>({});

  const [name, setName] = useState(reportName || "");

  const emptyChartsOfReportTemplate =
    !chartsOfReportTemplate || !chartsOfReportTemplate.length;

  useEffect(() => {
    const getFilters: any[] = [];

    for (const chartTemplate of chartTemplates) {
      getFilters.push(...chartTemplate.filterTypes);
    }
    setTotalFilters(getFilters);

    // handle form from other plugin
    if (emptyChartsOfReportTemplate) {
      for (const chartTemplate of chartTemplates) {
        templateCharts[chartTemplate.templateType] = true;
      }
    }

    for (const chart of chartsOfReportTemplate) {
      templateCharts[chart] = true;
      setTemplateCharts(templateCharts);
    }
  }, [chartTemplates]);

  const handleUserChange = (_userIds) => {
    setUserIds(_userIds);
  };

  const handleDepartmentChange = (_departmentIds) => {
    setDepartmentIds(_departmentIds);
  };

  const handleNameChange = (e) => {
    e.preventDefault();
    setName(e.target.value);
  };

  const handleSubmit = () => {
    let filterCharts;

    filterCharts = chartsOfReportTemplate.filter((chartName) => {
      const chartChecked = templateCharts[chartName];
      if (chartChecked) {
        return chartChecked;
      }
    });

    if (emptyChartsOfReportTemplate) {
      filterCharts = chartTemplates
        .filter((c) => {
          const chartChecked = templateCharts[c.templateType];
          if (chartChecked) {
            return c;
          }
        })
        .map((c) => c.templateType);
    }

    createReport({
      name,
      visibility,
      assignedUserIds: userIds,
      assignedDepartmentIds: departmentIds,
      reportTemplateType,
      charts: filterCharts,
    });
  };

  const renderContent = (formProps: IFormProps) => {
    const { values } = formProps;

    return (
      <FlexColumn style={{ gap: "30px" }}>
        <div>
          <ControlLabel>Report Name</ControlLabel>
          <FormControl
            type="text"
            onChange={handleNameChange}
            value={name}
            autoFocus={true}
          />
        </div>

        <FlexRow $justifyContent="space-between">
          <ControlLabel>Visibility</ControlLabel>
          <CenterBar>
            <Tabs full={true}>
              <TabTitle
                className={visibility === "public" ? "active" : ""}
                onClick={() => setVisibility("public")}
              >
                {__("Public")}
              </TabTitle>
              <TabTitle
                className={visibility === "private" ? "active" : ""}
                onClick={() => setVisibility("private")}
              >
                {__("Private")}
              </TabTitle>
            </Tabs>
          </CenterBar>
        </FlexRow>
        {visibility === "private" && (
          <SelectMembersForm
            handleDepartmentChange={handleDepartmentChange}
            handleUserChange={handleUserChange}
          />
        )}

        <FlexColumn style={{ gap: "20px" }}>
          {chartTemplates
            .filter((c) => c.templateType in templateCharts)
            .map((chartTemplate) => {
              return (
                <FlexRow
                  key={chartTemplate.templateType}
                  $justifyContent="space-between"
                >
                  <ControlLabel>{chartTemplate.name}</ControlLabel>
                  <FormControl
                    componentclass="checkbox"
                    name={chartTemplate.templateType}
                    checked={templateCharts[chartTemplate.templateType]}
                    key={chartTemplate.name}
                    onChange={(v: any) => {
                      templateCharts[chartTemplate.templateType] =
                        v.target.checked;
                      setTemplateCharts({ ...templateCharts });
                    }}
                  />
                </FlexRow>
              );
            })}
        </FlexColumn>

        <FlexCenter>
          <Button btnStyle="primary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button btnStyle="success" onClick={handleSubmit}>
            Save Changes
          </Button>
        </FlexCenter>
      </FlexColumn>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ReportFormModal;
