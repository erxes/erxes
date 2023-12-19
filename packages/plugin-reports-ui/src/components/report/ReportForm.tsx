import { FlexRow } from '@erxes/ui-settings/src/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import ReportFormModal from '../../containers/report/ReportFormModal';
import {
  BoxContainer,
  FlexColumn,
  FormContentWrapper,
  ReportsTemplatesSection
} from '../../styles';

type Props = {
  history: any;
  queryParams: any;

  reportTemplates: any[];
};

const ReportForm = (props: Props) => {
  // show report templates list
  // set visibility

  const { reportTemplates } = props;

  const [showModal, setShowModal] = useState(false);
  const [charts, setCharts] = useState<string[]>([]);
  const [emptyReport, setEmptyReport] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [reportName, setReportName] = useState('');
  const [reportTemplateType, setReportTemplateType] = useState(null);
  const [reportTemplateDescription, setReportTemplateDescription] = useState(
    ''
  );

  const onModalTrigger = (template: any) => {
    setShowModal(true);
    setCharts(template.charts);
    setServiceName(template.serviceName);
    setReportTemplateType(template.serviceType);
    setReportName(template.title);
    setReportTemplateDescription(template.description);
  };

  return (
    <>
      <Wrapper.Header
        breadcrumb={[
          { title: __('Reports'), link: '/reports' },
          { title: __('Create a report') }
        ]}
        title={__('Create a report')}
      />
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header>
          <Modal.Title>{reportTemplateDescription}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReportFormModal
            {...props}
            reportName={reportName}
            reportTemplateType={reportTemplateType}
            emptyReport={emptyReport}
            charts={charts}
            serviceName={serviceName}
            setShowModal={setShowModal}
          />
        </Modal.Body>
      </Modal>

      <FormContentWrapper>
        <ReportsTemplatesSection>
          <FlexColumn style={{ gap: '20px' }}>
            <BoxContainer
              onClick={() => {
                setEmptyReport(true);
                setShowModal(true);
              }}
            >
              <div>
                <h5> + Create a report from scratch</h5>
              </div>
            </BoxContainer>

            <h3>Create reports from templates</h3>

            {reportTemplates.map((template, index) => (
              <BoxContainer
                key={index}
                onClick={() => onModalTrigger(template)}
              >
                <FlexRow>
                  <div>
                    <img src={template.img} width="500px" />
                  </div>
                  <FlexColumn>
                    <h3>{template.title}</h3>
                    <p>{template.description}</p>
                  </FlexColumn>
                </FlexRow>
              </BoxContainer>
            ))}
          </FlexColumn>
        </ReportsTemplatesSection>

        {/* <ReportsSearchSection>
          <FormControl
            type="text"
            placeholder={__('Search report templates')}
            // onChange={search}
            // value={searchValue}
            // autoFocus={true}
            // onFocus={moveCursorAtTheEnd}
          />
        </ReportsSearchSection> */}
      </FormContentWrapper>
    </>
  );
};

export default ReportForm;
