import { ScrollWrapper } from '@erxes/ui/src/styles/main';
import React, { useState } from 'react';
import { FlexColumn, TemplateBox } from '../../styles';
import { FlexRow } from '@erxes/ui-settings/src/styles';
import { Button, FormControl } from '@erxes/ui/src';
import { IFormProps } from '@erxes/ui/src/types';
import ChartTemplates from '../../containers/template/Chart';

type Props = {
  report: any;
  template: any;

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
    !!report && selectedTemplateType.includes(template.serviceType),
  );

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
          componentClass="radio"
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

          {!report?.serviceType && (
            <Button onClick={() => setShowMore(!showMore)}>
              {showMore ? 'Show less' : 'Show more'}
            </Button>
          )}
        </>
      )}
    </TemplateBox>
  );
};

export default ReportTemplate;
