import React, { useEffect, useState } from "react";

import FormControl from "@erxes/ui/src/components/form/Control";
import Button from "@erxes/ui/src/components/Button";
import { FlexRow } from "@erxes/ui-settings/src/styles";

import ChartTemplates from "../../containers/template/Chart";
import { IDashboard, IReport, IReportTemplate } from "../../types";
import { FlexColumn, TemplateBox } from "../../styles";

type Props = {
  report?: any;
  template: IReportTemplate;

  selectedTemplateType: string | string[];

  handleTemplateClick(template: any): void;

  templateCharts: string[];
  setTemplateCharts(templateCharts: string[]): void;
};

const ReportTemplate = (props: Props) => {
  const {
    report,
    template,
    selectedTemplateType,
    templateCharts,
    setTemplateCharts,
    handleTemplateClick,
  } = props;

  const [showMore, setShowMore] = useState<boolean>(
    !!report && selectedTemplateType?.includes(template?.serviceType)
  );

  useEffect(() => {
    if (report?.__typename === "Report") {
      setShowMore(
        !!report && selectedTemplateType?.includes(template?.serviceType)
      );
    }
  }, [selectedTemplateType]);

  return (
    <TemplateBox showMore={showMore}>
      <FlexRow alignItems="start" onClick={() => handleTemplateClick(template)}>
        <div>
          <img src={template.img} width="200px" />
        </div>
        <FlexColumn>
          <h3>{template.title}</h3>
          <p>{template.description}</p>
        </FlexColumn>
        <FormControl
          componentclass="radio"
          name={template.serviceType}
          onChange={() => handleTemplateClick(template)}
          checked={selectedTemplateType.includes(template.serviceType)}
        />
      </FlexRow>

      {selectedTemplateType.includes(template.serviceType) && (
        <>
          <ChartTemplates
            report={report}
            template={template}
            chartsOfReportTemplate={template.charts}
            templateCharts={templateCharts}
            setTemplateCharts={setTemplateCharts}
          />

          {report?.__typename !== "Report" && !!selectedTemplateType.length && (
            <Button onClick={() => setShowMore(!showMore)}>
              {showMore ? "Show less" : "Show more"}
            </Button>
          )}
        </>
      )}
    </TemplateBox>
  );
};

export default ReportTemplate;
