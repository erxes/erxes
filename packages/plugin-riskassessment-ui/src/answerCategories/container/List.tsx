import React from 'react';
import { DefaultWrapper } from '../../common/utils';
import AnswerCategoriesComponent from '../components/List';
class AnswerCategories extends React.Component {
  render() {
    const updatedProps = {
      title: 'Assessment Category',
      content: <AnswerCategoriesComponent />,
    };
    return <DefaultWrapper {...updatedProps} />;
  }
}
export default AnswerCategories;
