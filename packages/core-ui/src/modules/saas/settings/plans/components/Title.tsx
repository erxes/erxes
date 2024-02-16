import React from 'react';
import { IOrganization } from '../types';

type Props = {
  currentOrganization: IOrganization;
};

const Title = (props: Props) => {
  const { name, plan = '', promoCodes = [] } = props.currentOrganization;

  return (
    <>
      {promoCodes.length > 0 ? (
        <b>{`${name} (${promoCodes.length})`}</b>
      ) : (
        <>
          Plan: <b>{plan === 'free' ? 'Free' : 'Growth'}</b>
        </>
      )}
    </>
  );
};

export default Title;
