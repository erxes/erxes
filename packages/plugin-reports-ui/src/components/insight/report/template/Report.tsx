import { ScrollWrapper } from '@erxes/ui/src/styles/main';
import React, { useState } from 'react';
import { FlexColumn, TemplateBox } from '../../../../styles';
import { FlexRow } from '@erxes/ui-settings/src/styles';
import { Button, FormControl } from '@erxes/ui/src';
import { IFormProps } from '@erxes/ui/src/types';
import ChartTemplates from './Chart';

type Props = {
  template: any;
  chartTemplates: any[];

  selectedTemplateIndex: string;
  formProps: IFormProps;

  handleTemplateClick(template: any): void;

  templateCharts: { [templateType: string]: boolean };
  setTemplateCharts(templateCharts: { [templateType: string]: boolean }): void;
};

const ReportTemplate = (props: Props) => {
  const {
    template,
    chartTemplates,
    selectedTemplateIndex,
    formProps,
    templateCharts,
    setTemplateCharts,
    handleTemplateClick,
  } = props;

  const [showMore, setShowMore] = useState<boolean>(true);

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
          {...formProps}
          componentClass="radio"
          name={template.serviceType}
          checked={
            selectedTemplateIndex === template.serviceType &&
            !!chartTemplates.length
          }
        />
      </FlexRow>

      {selectedTemplateIndex === template.serviceType && (
        <>
          <ChartTemplates
            chartTemplates={chartTemplates}
            chartsOfReportTemplate={template.charts}
            templateCharts={templateCharts}
            setTemplateCharts={setTemplateCharts}
          />

          <Button onClick={() => setShowMore(!showMore)}>
            {showMore ? 'Show more' : 'Show less'}
          </Button>
        </>
      )}
    </TemplateBox>
  );
};

export default ReportTemplate;
