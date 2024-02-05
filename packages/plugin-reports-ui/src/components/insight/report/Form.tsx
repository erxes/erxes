import React, { useEffect, useState } from 'react';
import { FlexItem, FlexRow } from '@erxes/ui-settings/src/styles';
import {
  Button,
  ControlLabel,
  FormControl,
  TabTitle,
  Tabs,
} from '@erxes/ui/src/components';
import {
  BoxContainer,
  CenterBar,
  FlexCenter,
  FlexColumn,
  FormFooter,
  FormContent,
  TemplateBox,
} from '../../../styles';
import { Form as CommonForm } from '@erxes/ui/src/components/form';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { Alert, __ } from '@erxes/ui/src';
import ChartTemplates from './template/Chart';
import { Column, ModalFooter, ScrollWrapper } from '@erxes/ui/src/styles/main';
import ReportTemplate from './template/Report';
import SelectMembersForm from '../../utils/SelectMembersForm';
import { IReport } from '../../../types';
import { MenuFooter } from '@erxes/ui-cards/src/boards/styles/rightMenu';

type Props = {
  history: any;
  queryParams: any;

  reportTemplates: any[];
  chartTemplates: any[];

  report?: IReport;

  handleMutation(values: any): void;
  setShowDrawer(value: boolean): void;
  loadReportChartTemplates(serviceName: string, charts: any): void;
};

const Form = (props: Props) => {
  const {
    report,
    chartTemplates,
    reportTemplates,
    handleMutation,
    setShowDrawer,
    loadReportChartTemplates,
  } = props;

  console.log(report);

  const [name, setName] = useState(report?.name || '');
  const [userIds, setUserIds] = useState(report?.assignedUserIds || []);
  const [departmentIds, setDepartmentIds] = useState(
    report?.assignedDepartmentIds || [],
  );
  const [visibility, setVisibility] = useState(report?.visibility || 'public');
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState('');
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [templateCharts, setTemplateCharts] = useState<{
    [templateType: string]: boolean;
  }>({});

  const handleSubmit = () => {
    if (!name || !currentTemplate) {
      return Alert.warning(__('Please fill the required fields'));
    }

    const filterCharts = (currentTemplate.charts || []).filter((chartName) => {
      const chartChecked = templateCharts[chartName];
      if (chartChecked) {
        return chartChecked;
      }
    });

    handleMutation({
      name,
      visibility,
      assignedUserIds: userIds,
      assignedDepartmentIds: departmentIds,
      reportTemplateType: selectedTemplateIndex,
      charts: filterCharts,
      serviceName: currentTemplate.serviceName,
    });
  };

  const handleTemplateClick = (template) => {
    if (selectedTemplateIndex !== template.serviceType) {
      setTemplateCharts({});
      setCurrentTemplate(template);
      setSelectedTemplateIndex(template.serviceType);
      loadReportChartTemplates(template.serviceName, template.charts);

      if (!name || reportTemplates.some((report) => report.title === name)) {
        setName(template.title);
      }
    }
  };

  const handleUserChange = (_userIds) => {
    setUserIds(_userIds);
  };

  const handleDepartmentChange = (_departmentIds) => {
    setDepartmentIds(_departmentIds);
  };

  const renderContent = (formProps: IFormProps) => {
    return (
      <>
        <FormContent>
          <FormGroup>
            <ControlLabel required={true}>Report Name</ControlLabel>
            <FormControl
              {...formProps}
              name="name"
              value={name}
              required={true}
              placeholder={__('Report Name')}
              onChange={(e) => setName((e.target as any).value)}
            />
          </FormGroup>

          <FormGroup>
            {/* <ControlLabel>Visibility</ControlLabel> */}

            <FormControl
              {...formProps}
              componentClass="checkbox"
              name="public"
              checked={visibility === 'public'}
              onChange={() => setVisibility('public')}
            >
              {__('Public')}
            </FormControl>

            <FormControl
              {...formProps}
              componentClass="checkbox"
              name="private"
              checked={visibility === 'private'}
              onChange={() => setVisibility('private')}
            >
              {__('Private')}
            </FormControl>
          </FormGroup>

          {visibility === 'private' && (
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
                  template={template}
                  chartTemplates={chartTemplates}
                  selectedTemplateIndex={selectedTemplateIndex}
                  formProps={formProps}
                  handleTemplateClick={handleTemplateClick}
                  templateCharts={templateCharts}
                  setTemplateCharts={setTemplateCharts}
                />
              );
            })}
          </FormGroup>
        </FormContent>

        <FormFooter>
          <Button btnStyle="primary" onClick={() => setShowDrawer(false)}>
            Close
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
