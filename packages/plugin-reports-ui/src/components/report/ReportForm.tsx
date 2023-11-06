import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { FlexRow } from '@erxes/ui-settings/src/styles';
import { Button, FormControl } from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import {
  BoxContainer,
  FlexColumn,
  FormContentWrapper,
  ReportsSearchSection,
  ReportsTemplatesSection
} from '../../styles';
import { FlexCenter } from '../../styles';
import ReportFormModal from './ReportFormModal';

type Props = {
  history: any;
  queryParams: any;
};

const templates = [
  {
    name: 'Chat overview',
    description: `Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries, but
                  also the leap into electronic typesetting, remaining
                  essentially unchanged. It was popularised in the 1960s with
                  the release of Letraset sheets containing Lorem Ipsum
                  passages, and more recently with desktop publishing software
                  like Aldus PageMaker including versions of Lorem Ipsum.`
  },
  {
    name: 'Email overview',
    description: `Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries, but
                  also the leap into electronic typesetting, remaining
                  essentially unchanged. It was popularised in the 1960s with
                  the release of Letraset sheets containing Lorem Ipsum
                  passages, and more recently with desktop publishing software
                  like Aldus PageMaker including versions of Lorem Ipsum.`
  },
  {
    name: 'Sales',
    description: `Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries, but
                  also the leap into electronic typesetting, remaining
                  essentially unchanged. It was popularised in the 1960s with
                  the release of Letraset sheets containing Lorem Ipsum
                  passages, and more recently with desktop publishing software
                  like Aldus PageMaker including versions of Lorem Ipsum.`
  }
];
const ReportForm = (props: Props) => {
  // show report templates list
  // set visibility

  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReportFormModal />
        </Modal.Body>
        <FlexCenter>
          <Button btnStyle="primary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button btnStyle="success">Save Changes</Button>
        </FlexCenter>
      </Modal>

      <FormContentWrapper>
        <ReportsTemplatesSection>
          <FlexColumn style={{ gap: '20px' }}>
            <BoxContainer onClick={() => setShowModal(true)}>
              <div>
                <h5> + Create a report from scratch</h5>
              </div>
            </BoxContainer>

            <h3>Create reports from templates</h3>

            {templates.map((template, index) => (
              <BoxContainer key={index}>
                <FlexRow>
                  <div></div>
                  <FlexColumn>
                    <h3>{template.name}</h3>
                    <p>{template.description}</p>
                  </FlexColumn>
                </FlexRow>
              </BoxContainer>
            ))}
          </FlexColumn>
        </ReportsTemplatesSection>

        <ReportsSearchSection>
          <FormControl
            type="text"
            placeholder={__('Search report templates')}
            // onChange={search}
            // value={searchValue}
            // autoFocus={true}
            // onFocus={moveCursorAtTheEnd}
          />
        </ReportsSearchSection>
      </FormContentWrapper>
    </>
  );
};

export default ReportForm;
