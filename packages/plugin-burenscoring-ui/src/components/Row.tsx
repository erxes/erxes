import { Button, ModalTrigger } from '@erxes/ui/src';
import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const BurenscoringWrapper = styledTS<{ space: number }>(
  styled.div
)`padding-left: ${props => props.space * 20}px;
  display:inline-flex;
  justify-content:flex-start;
  align-items: center;
`;

type Props = {
  burenScoring: any;
};

export default function Row(props: Props) {
    const { burenScoring } = props

    const addConfig = (
      <Button
        btnStyle="success"
        block={true}
        uppercase={false}
        icon="eye"
      >
       detail
      </Button>
    );
    const renderSidebarHeader = () => {

  
      const formContent = (formProps) => <Form {...formProps} />;
  
      return (
          <ModalTrigger
            size="sm"
            title="Score detail"
            trigger={addConfig}
            enforceFocus={false}
            content={formContent}
          />
      );
    };
  
    return (
      <tr>
        <th>{burenScoring.keyword}</th>
        <th>{burenScoring?.score}</th>
        <th>{burenScoring.reportPurpose}</th>
        <th>{burenScoring?.createdAt}</th>
        <th><Button size="small" btnStyle="primary">Detail</Button></th>
      </tr>
    );
  
}


