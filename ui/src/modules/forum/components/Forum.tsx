import Wrapper from 'modules/layout/components/Wrapper';

import React from 'react';

class Forum extends React.Component {
  breadcrumb() {
    const list = [{ title: 'Forum', link: '/forum' }];

    return list;
  }

  render() {
    return (
      <Wrapper
        header={
          <Wrapper.Header title={`${'Forum'}`} breadcrumb={this.breadcrumb()} />
        }
        leftSidebar={<p>leftsidebar</p>}
        transparent={true}
        content={<h1>hld</h1>}
        /* content={
          <ArticleList
            queryParams={queryParams}
            currentCategoryId={currentCategory._id}
            topicId={
              currentCategory.firstTopic && currentCategory.firstTopic._id
            }
          />
        } */
      />
    );
  }
}

export default Forum;
