import React from 'react';
import CarSection from '../components/common/CarSection';

type Props = {
  id: string;
};

const CustomerSection = ({ id }: Props) => {
  return <CarSection mainType={'company'} mainTypeId={id} />;
};

export default CustomerSection;
