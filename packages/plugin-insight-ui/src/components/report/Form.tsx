import React, { useState, useEffect } from 'react';

import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Button from '@erxes/ui/src/components/Button';
import Alert from '@erxes/ui/src/utils/Alert/index';
import { Form as CommonForm } from '@erxes/ui/src/components/form';
import { IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/index';

import ReportTemplate from '../template/Report';
import SelectMembersForm from '../utils/SelectMembersForm';
import SelectSections from '../../containers/utils/SelectSections';
import { FormFooter, FormContent } from '../../styles';
import { IReport, IReportTemplate } from '../../types';
import { getService } from '../../utils';

type Props = {
  queryParams: any;
  history: any;

  report?: IReport;
  reportTemplates: IReportTemplate[];

  closeDrawer: () => void;
  handleMutation(values: any): void;
};

const Form = (props: Props) => {
  const { report, reportTemplates, handleMutation, closeDrawer } = props;

  const [name, setName] = useState(report?.name || '');
  const [userIds, setUserIds] = useState(report?.assignedUserIds || []);
  const [sectionId, setSectionId] = useState<string>(report?.sectionId || '');
  const [departmentIds, setDepartmentIds] = useState(
    report?.assignedDepartmentIds || [],
  );
  const [visibility, setVisibility] = useState(report?.visibility || 'public');
  const [serviceType, setServiceType] = useState<string>(
    report?.serviceType || '',
  );
  const [templateCharts, setTemplateCharts] = useState<string[]>([]);
  const [serviceName, setServiceName] = useState<string>(
    report?.serviceName || '',
  );

  useEffect(() => {
    if (report && report.charts && report.charts.length) {
      const { serviceType, serviceName } = getService(report.charts[0]);

      if (!report.serviceType) {
        setServiceType(serviceType);
      }

      if (!report.serviceName) {
        setServiceName(serviceName);
      }
    }
  }, []);

  const handleSubmit = () => {
    if (!name || !serviceName || !sectionId) {
      return Alert.warning(__('Please fill the required fields'));
    }

    handleMutation({
      name,
      sectionId,
      visibility,
      assignedUserIds: userIds,
      assignedDepartmentIds: departmentIds,
      charts: Array.from([...new Set(templateCharts)]),
      reportTemplateType: serviceType,
      serviceName,
    });
  };

  const handleTemplateClick = (template) => {
    const { serviceType: templateType, serviceName, title } = template;
    setTemplateCharts([]);

    const isTemplateSelected = serviceType.includes(templateType);
    const isNameDefault = reportTemplates.some(
      (report) => report.title === name,
    );

    if (!isTemplateSelected) {
      setServiceName(serviceName);
      setServiceType(templateType);

      if (!name || isNameDefault) {
        setName(title);
      }
    } else if (!serviceType) {
      setServiceName('');
      setServiceType('');

      if (name && isNameDefault) {
        setName('');
      }
    }
  };

  const handleUserChange = (_userIds) => {
    setUserIds(_userIds);
  };

  const handleDepartmentChange = (_departmentIds) => {
    setDepartmentIds(_departmentIds);
  };

  const renderReportTemplates = () => {
    const templates = report
      ? reportTemplates.filter((template) =>
          template.serviceType.includes(serviceType || ''),
        )
      : reportTemplates;

    return templates.map((template, index) => {
      return (
        <ReportTemplate
          key={index}
          report={report}
          template={template}
          selectedTemplateType={serviceType}
          handleTemplateClick={handleTemplateClick}
          templateCharts={templateCharts}
          setTemplateCharts={setTemplateCharts}
        />
      );
    });
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
            <ControlLabel required={true}>{__('Choose Section')}</ControlLabel>
            <SelectSections
              sectionId={sectionId}
              setSectionId={setSectionId}
              type="report"
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

            {renderReportTemplates()}
          </FormGroup>
        </FormContent>

        <FormFooter>
          <Button btnStyle="simple" onClick={closeDrawer}>
            Cancel
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
