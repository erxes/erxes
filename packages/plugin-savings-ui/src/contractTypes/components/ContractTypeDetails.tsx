import { Wrapper } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import React from 'react';

import { IContractTypeDetail } from '../types';
import DetailInfo from './ContractTypeDetailInfo';
import JournalsSettings from './JournalsSettings';

type Props = {
  contractType: IContractTypeDetail;
  saveItem: (doc: IContractTypeDetail, callback?: (item) => void) => void;
};

const ContractDetails = (props: Props) => {
  const { contractType, saveItem } = props;

  const title = contractType.name || 'Unknown';

  const breadcrumb = [
    {
      title: __('Contract types'),
      link: '/erxes-plugin-saving/contract-types',
    },
    { title },
  ];

  const content = () => {
    return <JournalsSettings contractType={contractType} saveItem={saveItem} />;
  };

  return (
    <Wrapper
      header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
      leftSidebar={<DetailInfo {...props} />}
      content={content()}
      transparent={true}
    />
  );
};

export default ContractDetails;
