import React, { useState } from 'react';
import moment from 'moment';
import Box from '@erxes/ui/src/components/Box';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import {
  Button,
  ControlLabel,
  DataWithLoader,
  EmptyState,
  ErrorMsg,
  ModalTrigger,
  Spinner
} from '@erxes/ui/src/components';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';

import { ButtonRelated, ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import Select from 'react-select';
import { IOperation } from '../types';
import { Footer } from '@erxes/ui/src/styles/chooser';
import Table from '@erxes/ui/src/components/table';

type Props = {
  xypData: any;
  loading: any;
  error?: string;
};

function SidebarView({
  xypData,
  error,
  loading,
}: Props) {
  const [params, setParams] = useState({});
  const [operation, setOperation] = useState<IOperation>({
    orgName: '',
    wsOperationDetail: '',
    wsOperationName: '',
    wsVersion: '',
    wsWsdlEndpoint: '',
    input: [],
    output: []
  });

  const relServiceTrigger = (
    <ButtonRelated>
      <span>{__('Fetch data...')}</span>
    </ButtonRelated>
  );

  const modalContent = (d: any) => {
  };

  const renderServiceName = (value: string) => {
    return value;
  };

  const content = () => {
    return (
      <>
        <SidebarList className="no-link">
          {loading && <DataWithLoader data="This is data" loading objective />}
          {xypData?.data?.map((d, index) => (
            <ModalTrigger
              title={d?.serviceDescription}
              trigger={
                <li key={index}>
                  {(d?.serviceDescription || '').replace('дамжуулах сервис', '')}
                </li>
              }
              size="xl"
              content={() => modalContent(d)}
              key={d?.serviceName}
            />
          ))}
        </SidebarList>
        {xypData === null && <EmptyState icon="building" text="No data" />}
      </>
    );
  };

  return (
    <Box title="Xyp" name="xyp" isOpen={true}>
      {content()}
    </Box>
  );
}

export default SidebarView;
