import * as React from 'react';
import { IProductCategory } from '../../../types';
import Card from '../../components/common/Card';
import { AppConsumer } from '../AppContext';

type Props = {
  title: string;
  key: any;
  type: string;
  widgetColor: string;
  status?: string;
  description?: string;
  goTo?: () => void;
};

function CardContainer(props: Props) {
  return (
    <AppConsumer>
      {({ }) => {
        return <Card {...props} />;
      }}
    </AppConsumer>
  );
}

export default CardContainer;
