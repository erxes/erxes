import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language'; // tslint:disable-line

function jSONidentity(value: any) {
  return value;
}

function jSONparseLiteral(ast: any) {
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
        value[field.name.value] = jSONparseLiteral(field.value);
      });

      return value;
    }
    case Kind.LIST:
      return ast.values.map(jSONparseLiteral);
    default:
      return null;
  }
}

export default {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value) {
      if (value instanceof Date) {
        return value.getTime(); // Convert outgoing Date to integer for JSON
      }
      throw Error('GraphQL Date Scalar serializer expected a `Date` object');
    },
    parseValue(value) {
      if (typeof value === 'number') {
        return new Date(value); // Convert incoming integer to Date
      }
      throw new Error('GraphQL Date Scalar parser expected a `number`');
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        // Convert hard-coded AST string to integer and then to Date
        return new Date(parseInt(ast.value, 10));
      }
      // Invalid hard-coded value (not an integer)
      return null;
    },
  }),

  JSON: new GraphQLScalarType({
    name: 'JSON',
    description:
      'The `jSON` scalar type represents jSON values as specified by ' +
      '[ECMA-404](http://www.ecma-international.org/' +
      'publications/files/ECMA-ST/ECMA-404.pdf).',
    serialize: jSONidentity,
    parseValue: jSONidentity,
    parseLiteral: jSONparseLiteral
  })
};
