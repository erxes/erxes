import React from 'react';
import queries from '../../graphql/queries';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

import Spinner from '@erxes/ui/src/components/Spinner';
import VendorSection from './VendorSection';
import ClientSection from './ClientSection';

type Props = {
  mainType: string;
  mainTypeId: string;
};

const Container = (props: Props) => {
  return (
    <>
      <VendorSection {...props} />
      <ClientSection {...props} />
    </>
  );
};

export default Container;
