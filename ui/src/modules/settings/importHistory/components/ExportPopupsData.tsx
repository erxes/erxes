import Button from 'modules/common/components/Button';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __, getEnv } from 'modules/common/utils';
import { ILeadIntegration } from 'modules/leads/types';
import React from 'react';
import styled from 'styled-components';

interface IProps {
  popups: ILeadIntegration[];
}

const PopupList = styled.ul`
  margin: 0;
  padding: 0;

  li {
    color: #444;

    &: hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
`;

export default (props: IProps) => {
  const exportData = (formId: string) => {
    const { REACT_APP_API_URL } = getEnv();

    window.open(
      `${REACT_APP_API_URL}/file-export?type=customer&popupData=true&form=${formId}`,
      '_blank'
    );
  };

  const { popups } = props;

  const content = () => (
    <PopupList>
      {popups.map(popup => (
        <li key={popup._id} onClick={exportData.bind(null, popup.formId)}>
          {popup.name}
        </li>
      ))}
    </PopupList>
  );

  const trigger = (
    <Button icon="export" btnStyle="primary" size="small">
      {__(`Export Forms data`)}
    </Button>
  );

  return <ModalTrigger title="Forms" trigger={trigger} content={content} />;
};
