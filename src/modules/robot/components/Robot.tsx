import * as React from 'react';
import Onboarding from '../containers/Onboarding';
import { IEntry } from '../types';

type Props = {
  entries: IEntry[];
};

class Robot extends React.PureComponent<Props> {
  render() {
    return <Onboarding />;
  }
}

export default Robot;
