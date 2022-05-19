import React from 'react';
import Home from '../components/Home';

type Props = {
  queryParams: any;
};

export default function HomeContainer(props: Props) {
  return <Home {...props} />;
}
