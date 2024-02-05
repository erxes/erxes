import { ControlLabel, FormControl } from '@erxes/ui/src';
import React, { useEffect, useState } from 'react';
import { Column, Flex } from '@erxes/ui/src/styles/main';
import { FlexRow } from '../../../../styles';

type Props = {
  chartTemplates: any[];
  chartsOfReportTemplate: string[];
  templateCharts: { [templateType: string]: boolean };
  setTemplateCharts(templateCharts: { [templateType: string]: boolean }): void;
};

const ChartTemplates = (props: Props) => {
  const {
    chartTemplates,
    chartsOfReportTemplate,
    templateCharts,
    setTemplateCharts,
  } = props;

  useEffect(() => {
    for (const chart of chartsOfReportTemplate) {
      templateCharts[chart] = true;
      setTemplateCharts(templateCharts);
    }
  }, [chartTemplates]);

  return (
    <ul>
      {chartTemplates
        .filter((c) => c.templateType in templateCharts)
        .map((chartTemplate) => (
          <FlexRow key={chartTemplate.templateType}>
            <ControlLabel>{chartTemplate.name}</ControlLabel>
            <FormControl
              componentClass="checkbox"
              name={chartTemplate.templateType}
              checked={templateCharts[chartTemplate.templateType]}
              key={chartTemplate.name}
              onChange={(v: any) => {
                templateCharts[chartTemplate.templateType] = v.target.checked;
                setTemplateCharts({ ...templateCharts });
              }}
            />
          </FlexRow>
        ))}
    </ul>
  );
};

export default ChartTemplates;
