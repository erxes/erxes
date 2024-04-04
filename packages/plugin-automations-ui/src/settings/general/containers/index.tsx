import React from 'react';
import * as compose from 'lodash.flowright';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import Component from '../components';
type Props = {} & IRouterProps;

type FinalProps = {} & Props;

function GeneralSettings({}: FinalProps) {
  return <Component />;
}

export default withProps<Props>(compose()(GeneralSettings));
