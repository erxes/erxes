import { Kind, parse, print } from 'graphql';

export const selectFields = (sdl: string, names: string[]): string => {
  const definition = parse(`type Root { ${sdl} }`).definitions[0];
  if (definition.kind !== Kind.OBJECT_TYPE_DEFINITION) {
    throw new Error('Expected root fields');
  }
  return (definition.fields || [])
    .filter((field) => names.includes(field.name.value))
    .map((field) => print(field))
    .join('\n');
};
