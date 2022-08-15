import React from 'react';
import { DefaultWrapper } from '../../common/utils';
import AnswersComponent from '../components/List';

class Answers extends React.Component {
  render() {
    const updatedProps = {
      title: 'Assessment Category',
      content: <AnswersComponent />,
    };
    return <DefaultWrapper {...updatedProps} />;
  }
}
export default Answers;
