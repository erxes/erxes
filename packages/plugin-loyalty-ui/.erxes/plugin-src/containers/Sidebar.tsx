import React from 'react';
import LoyaltySectionContainer from '../loyalties/containers/LoyaltySection';

type Props = {
  id: string;
}

class CustomerSection extends React.Component<Props> {
  constructor (props){
    super(props);
  }
  
  render (){
    const { id } = this.props;
    return (<>
      <LoyaltySectionContainer ownerId={id} ownerType='customer'/>
    </>)
  }
}
 export default CustomerSection;