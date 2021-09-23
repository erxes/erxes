import * as React from 'react';
import { Intro } from '../containers';
import { IBooking } from '../types';

type Props = {
  activeRoute: string;
  booking: IBooking;
};

function App(props: Props) {
  const renderContent = () => {
    const { activeRoute } = props;

    if (activeRoute === 'INTRO') {
      return <Intro />;
    }

    return null;
  };

  return (
    <div id="erxes-container" className="erxes-content">
      {renderContent()}
    </div>
  );
}

export default App;
