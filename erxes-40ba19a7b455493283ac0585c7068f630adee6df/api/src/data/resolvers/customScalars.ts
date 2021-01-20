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
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize: value => {
      if (value instanceof Date) {
        return value;
      }

      if (value.toISOString) {
        return value.toISOString();
      }

      return new Date(value);
    },

    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    }
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
