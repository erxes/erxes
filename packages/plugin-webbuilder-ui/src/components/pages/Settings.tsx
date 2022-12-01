import 'grapesjs/dist/css/grapes.min.css';

import { IPageDoc } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import { List } from './styles';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  page: IPageDoc;
};

class PageSettings extends React.Component<Props> {
  render() {
    const { page } = this.props;
    console.log('aaa', page);
    return <List>efefewffefwefwefwe</List>;
  }
}

export default PageSettings;
