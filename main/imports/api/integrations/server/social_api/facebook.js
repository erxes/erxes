import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import graph from 'fbgraph';

/*
 * get list of pages that authorized user owns
 */
export const getPageList = (accessToken) => {
  graph.setAccessToken('EAACEdEose0cBAGqTGcfqsIGsBZCcOz5tPXL3zvM454u3CYpuhQWCBiwbZCL8lJfm8il8pnMlqJUpAwAnZCuiswrvCRM4hhQLcwA1MyywvYz7QpSCAvOXd7a6ZAJjrmNU9LyiwNy09V5MEPQBZAV1oP1TP74p3PCz6hkquFe0QMAZDZD');

  const wrappedGraphGet = Meteor.wrapAsync(graph.get, graph);

  try {
    const response = wrappedGraphGet('/me/accounts');
    const pages = [];

    // collect only some fields
    _.each(response.data, (page) => {
      pages.push({
        accessToken: page.access_token,
        id: page.id,
        name: page.name,
      });
    });

    return {
      status: 'ok',
      pages,
    };

  // catch session expired or some other error
  } catch (e) {
    return {
      status: 'error',
      message: e.message,
    };
  }
};
