import React from 'react';
import Appearance from '../components/Appearance';

type Props = {
  exm: any;
  edit: (variables: any) => void;
};

export default function GeneralContainer(props: Props) {
  return <Appearance {...props} />;
}
