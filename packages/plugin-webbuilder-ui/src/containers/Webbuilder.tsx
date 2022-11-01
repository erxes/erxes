import React from 'react';
import Webbuilder from '../components/Builder';

type Props = {
  //   queryParams: any;
  //   type: string;
  //   selectedSite: string;
};

function WebbuilderContainer(props: Props) {
  return <Webbuilder {...props} />;
}

export default WebbuilderContainer;
