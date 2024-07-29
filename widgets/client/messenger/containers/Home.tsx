import * as React from 'react';
import { IUser } from '../../types';
import WidgetHome from '../components/Home';
import { getColor, getMessengerData } from '../utils/util';

type Props = {
  supporters: IUser[];
  color?: string;
  isOnline?: boolean;
  activeSupport?: boolean;
};

const Home = (props: Props) => {
  return (
    <WidgetHome
      {...props}
      messengerData={getMessengerData()}
      color={getColor()}
    />
  );
};

export default Home;
