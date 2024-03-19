import React, { useEffect, useState, memo } from 'react';

import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import FormControl from '@erxes/ui/src/components/form/Control';
import ControlLabel from '@erxes/ui/src/components/form/Label';

import ChartLoader from './ChartLoader';
import { FlexRow } from '../../styles';
import { IDashboard, IReport, IReportTemplate } from '../../types';

type Props = {
  report?: any;
  template: IReportTemplate;
  loading: boolean;
  chartTemplates: any[];
  chartsOfReportTemplate: string[];
  templateCharts: string[];
  setTemplateCharts(templateCharts: string[]): void;
};

const ChartTemplates = (props: Props) => {
  const {
    report,
    template,
    loading,
    chartTemplates,
    chartsOfReportTemplate,
    templateCharts,
    setTemplateCharts,
  } = props;

  const [templates, setTemplate] = useState<{
    [templateType: string]: boolean;
  }>({});

  useEffect(() => {
    if (!chartTemplates.length) return;

    const newTemplates = { ...templates };
    for (const chart of chartsOfReportTemplate) {
      newTemplates[chart] =
        report && report.charts
          ? report.charts.some((c) => c.templateType === chart)
          : true;
    }
    setTemplate(newTemplates);

    const trueTemplates = Object.keys(newTemplates).filter(
      (key) => newTemplates[key],
    );
    setTemplateCharts([...templateCharts, ...trueTemplates]);
  }, [chartTemplates.length]);

  const handleCheck = (v: any, chartTemplate: any) => {
    const updatedTemplates = {
      ...templates,
      [chartTemplate.templateType]: v.target.checked,
    };

    setTemplate(updatedTemplates);

    const updated = !v.target.checked
      ? templateCharts.filter(
          (template) => template !== chartTemplate.templateType,
        )
      : [...templateCharts, chartTemplate.templateType];
    setTemplateCharts(updated);
  };

  const renderContent = () => {
    return (
      <ul>
        {chartTemplates
          .filter((c) => c.templateType in templates)
          .map((chartTemplate) => (
            <FlexRow key={chartTemplate.templateType}>
              <ControlLabel>{chartTemplate.name}</ControlLabel>
              <FormControl
                componentClass="checkbox"
                name={chartTemplate.templateType}
                checked={templates[chartTemplate.templateType]}
                key={chartTemplate.name}
                onChange={(v) => handleCheck(v, chartTemplate)}
              />
            </FlexRow>
          ))}
      </ul>
    );
  };

  return (
    <DataWithLoader
      data={renderContent()}
      loading={loading}
      count={chartTemplates.length}
      loadingContent={<ChartLoader />}
    />
  );
};

export default ChartTemplates;
