import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language'; // tslint:disable-line

const jsonIdentity = (value: any) => {
  return value;
};

const jsonParseLiteral = (ast: any) => {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT: {
      const value = Object.create(null);

      ast.fields.forEach((field: any) => {
        value[field.name.value] = jsonParseLiteral(field.value);
      });

      return value;
    }
    case Kind.LIST:
      return ast.values.map(jsonParseLiteral);
    default:
      return null;
  }
};

export const apolloCustomScalars = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value: any) {
      return new Date(value); // value from the client
    },
    serialize: (value: any) => {
      if (value instanceof Date) {
        return value.toISOString();
      }

      if (value.toISOString) {
        return value.toISOString();
      }

      return new Date(value).toISOString();
    },

    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(parseInt(ast.value, 10)); // ast value is always in string format
      }
      return null;
    },
  }),

  JSON: new GraphQLScalarType({
    name: 'JSON',
    description:
      'The `jSON` scalar type represents jSON values as specified by ' +
      '[ECMA-404](http://www.ecma-international.org/' +
      'publications/files/ECMA-ST/ECMA-404.pdf).',
    serialize: jsonIdentity,
    parseValue: jsonIdentity,
    parseLiteral: jsonParseLiteral,
  }),
};
