import { DocumentNode, GraphQLResolveInfo } from 'graphql';
import { merge } from 'lodash';
import {
  gql,
  createHttpLink,
  execute,
  from,
  toPromise,
  GraphQLRequest,
  FetchResult,
  ApolloLink
} from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import {
  FieldsByTypeName,
  parseResolveInfo,
  ResolveTree
} from 'graphql-parse-resolve-info';
import fetch from 'node-fetch';

function fieldPathsAsStrings(obj: { [key: string]: any }) {
  const paths = (obj = {}, head = ''): string[] => {
    return Object.entries(obj).reduce(
      (acc: string[], [key, value]: [string, any]) => {
        let fullPath = addDelimiter(head, key);
        return isObject(value)
          ? acc.concat(key, paths(value, fullPath))
          : acc.concat(fullPath);
      },
      []
    );
  };
  return paths(obj);
}

function isObject(val: any) {
  return typeof val === 'object' && !Array.isArray(val) && val !== null;
}

function addDelimiter(a: string, b: string) {
  return a ? `${a}.${b}` : b;
}

function isFieldObject(obj: any) {
  return (
    isObject(obj) &&
    obj.hasOwnProperty('args') &&
    obj.hasOwnProperty('alias') &&
    obj.hasOwnProperty('name')
  );
}

function fieldPathsAsMapFromResolveInfo(
  resolveInfo: FieldsByTypeName | ResolveTree
) {
  // Construct entries-like array of field paths their corresponding name, alias, and args
  const paths = (obj = {}, head = ''): [string, any][] => {
    return Object.entries(obj).reduce(
      (acc: [string, any][], [key, value]: [string, any]) => {
        let fullPath = addDelimiter(head, key);
        if (
          isFieldObject(value) &&
          Object.keys(value.fieldsByTypeName).length === 0
        ) {
          const { alias, args, name } = value;
          return acc.concat([[fullPath, { alias, args, name }]]);
        } else if (isFieldObject(value)) {
          const { alias, args, name } = value;
          return acc.concat(
            [[fullPath, { alias, args, name }]],
            paths(value, fullPath)
          );
        } else if (isObject(value)) {
          return acc.concat(paths(value, fullPath));
        }
        return acc.concat([[fullPath, null]]);
      },
      []
    );
  };
  const resolveInfoFields = paths(resolveInfo);
  // Filter field paths and construct an object from entries
  return Object.fromEntries(
    resolveInfoFields
      .filter(([_, options]) => options)
      .map(([path, { alias, args, name }]) => {
        const pathParts = path.split('.');
        pathParts.forEach((_part, i) => {
          if (pathParts[i - 1] === 'fieldsByTypeName') {
            pathParts.splice(i - 1, 2);
          }
        });
        let keptOptions = {
          ...(name !== alias && { alias }),
          ...(Object.keys(args).length && { args })
        };
        return [
          pathParts.join('.'),
          Object.keys(keptOptions).length ? keptOptions : null
        ];
      })
  );
}

function buildSelection(selection, pathString, pathParts, fieldPathMap, index) {
  let formattedSelection = selection;
  let options;
  let parentOptions;
  if (pathParts.length > 1 && index < pathParts.length - 1) {
    const parentPathString = pathParts.slice(0, index + 1).join('.');
    parentOptions = fieldPathMap[parentPathString];
  } else {
    options = fieldPathMap[pathString];
  }
  if (parentOptions) {
    if (parentOptions.alias) {
      formattedSelection = `${parentOptions.alias}: ${formattedSelection}`;
    }
    if (parentOptions.args) {
      // Stringify object, remove outer brackets, then remove double quotes before colon
      const formattedArgs = JSON.stringify(parentOptions.args)
        .slice(1, -1)
        .replace(/"([^"]+)":/g, '$1:');
      formattedSelection = `${formattedSelection}(${formattedArgs})`;
    }
  } else if (options) {
    if (options.alias) {
      formattedSelection = `${options.alias}: ${formattedSelection}`;
    }
    if (options.args) {
      const formattedArgs = JSON.stringify(options.args)
        .slice(1, -1)
        .replace(/"([^"]+)":/g, '$1:');
      formattedSelection = `${formattedSelection}(${formattedArgs})`;
    }
  }
  return formattedSelection;
}

function buildNonPayloadSelections(
  payload,
  info
): { selections: string; resolveInfo: ResolveTree | FieldsByTypeName } {
  const resolveInfo = parseResolveInfo(info);
  if (!resolveInfo) {
    throw new Error('Cannot parse graphql resolve info');
  }

  const payloadFieldPaths = fieldPathsAsStrings(
    payload[resolveInfo?.name as string]
  );
  const operationFields = resolveInfo
    ? fieldPathsAsMapFromResolveInfo(resolveInfo)
    : {};
  const operationFieldPaths = Object.keys(operationFields);
  const selections = operationFieldPaths
    .filter(path => !payloadFieldPaths.includes(path))
    .reduce((acc, curr, i, arr) => {
      const pathParts = curr.split('.');
      let selections = '';
      pathParts.forEach((part, j) => {
        // Is this a top-level field that will be accounted for when nested
        // children are added to the selection?
        const hasSubFields = !!arr.slice(i + 1).find(item => {
          const itemParts = item.split('.');
          itemParts.pop();
          const rejoinedItem = itemParts.join('.');
          return rejoinedItem === curr;
        });
        if (hasSubFields) {
          return;
        }
        const sel = buildSelection(part, curr, pathParts, operationFields, j);
        if (j === 0) {
          selections = `${sel} `;
        } else if (j === 1) {
          selections = `${selections}{ ${sel} } `;
        } else {
          const char = -(j - 2) - j;
          selections = `${selections.slice(
            0,
            char
          )}{ ${sel} } ${selections.slice(char)}`;
        }
      });
      return acc + selections;
    }, '');

  return { selections, resolveInfo };
}

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(graphqlError =>
      console.error(`[GraphQL error]: ${graphqlError.message}`)
    );
  }
  if (networkError) {
    console.log(`[Network Error]: ${networkError}`);
  }
});

export default class SubscriptionResolver {
  private apolloLink!: ApolloLink;

  constructor(gatewayURL: string, context: any) {
    const contextLink = setContext((_request, previousContext) => {
      const cookie = context.extra?.request?.headers?.cookie;
      if (cookie) {
        if (!previousContext) {
          previousContext = {};
        }
        if (!previousContext.headers) {
          previousContext.headers = {};
        }
        previousContext.headers.cookie = context.extra.request.headers.cookie;
      }
      return previousContext;
    });

    const httpLink = createHttpLink({ fetch, uri: gatewayURL });

    this.apolloLink = from([errorLink, contextLink, httpLink]);
  }

  public async queryAndMergeMissingData({
    payload,
    queryVariables,
    info,
    buildQueryUsingSelections
  }: {
    payload: any;
    queryVariables: object;
    info: GraphQLResolveInfo;
    buildQueryUsingSelections: (selections: any) => string;
  }): Promise<any> {
    const { selections, resolveInfo } = buildNonPayloadSelections(
      payload,
      info
    );

    const payloadData =
      typeof resolveInfo?.name === 'string'
        ? payload[resolveInfo.name]
        : Object.values(payload)[0];

    if (!selections) {
      return payloadData;
    }

    const query = buildQueryUsingSelections(selections);

    const documentNode: DocumentNode = gql(query);

    try {
      const response = await this.query({
        query: documentNode,
        variables: queryVariables
      });

      if (response.data) {
        return merge(payloadData, Object.values(response.data)[0]);
      }
    } catch (error) {
      console.error(
        '----------------- subscription resolver request error ---------------------------'
      );
      console.error('query', query);
      console.error('error', error);
      console.error(
        '---------------------------------------------------------------------------------'
      );
    }
  }

  private async query(graphqlRequest: GraphQLRequest): Promise<FetchResult> {
    const response = await toPromise(execute(this.apolloLink, graphqlRequest));
    return response;
  }
}
