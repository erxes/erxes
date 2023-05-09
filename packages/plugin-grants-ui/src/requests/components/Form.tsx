import React from 'react';
import { IGrantRequest, IGrantResponse } from '../../common/type';

type Props = {
  detail: { responses: IGrantResponse[] } & IGrantRequest;
};

class DetailForm extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    return <>dsadas</>;
  }
}

export default DetailForm;
