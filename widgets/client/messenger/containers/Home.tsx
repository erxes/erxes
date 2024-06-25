import * as React from 'react';
import { IUser } from '../../types';
import WidgetHome from '../components/Home';
import { useAppContext } from './AppContext';

type Props = {
  supporters: IUser[];
  color?: string;
  isOnline?: boolean;
  activeSupport?: boolean;
};

const Home = (props: Props) => {
  const { getColor, getMessengerData } = useAppContext();

  return (
    <WidgetHome
      {...props}
      messengerData={getMessengerData()}
      color={getColor()}
    />
  );
};

export default Home;
