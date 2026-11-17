type Node = {
  type: string;
  name?: string;
  value?: unknown;
  object?: Node;
  property?: Node;
  callee?: Node;
};

type NodePath = { node: Node; parentPath: NodePath | null };

const LEVELS = new Set(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'log', 'child']);

const isLogger = (node: Node | undefined) =>
  node?.type === 'Identifier' && /^(log|logger|console)$|Logger$|Log$/.test(node.name ?? '');

const isLogCall = ({ node }: NodePath) =>
  node.type === 'CallExpression' &&
  node.callee?.type === 'MemberExpression' &&
  isLogger(node.callee.object) &&
  LEVELS.has(node.callee.property?.name ?? '');

const insideThrow = (path: NodePath) => {
  for (let parent = path.parentPath; parent; parent = parent.parentPath) {
    if (parent.node.type === 'ThrowStatement') return true;

    if (parent.node.type.endsWith('Function') || parent.node.type === 'FunctionExpression')
      return false;
  }

  return false;
};

const ERROR_CODE = /^[A-Z][A-Z0-9_]+$/;

const isErrorMessage = (path: NodePath) => {
  const { node } = path;

  const text =
    node.type === 'TemplateLiteral' ||
    (node.type === 'StringLiteral' && !ERROR_CODE.test(String(node.value)));

  return text && insideThrow(path);
};

const ignorer = (name: string, reason: string, matches: (path: NodePath) => boolean) => ({
  kind: 'Ignore',
  name,
  value: { shouldIgnore: (path: NodePath) => (matches(path) ? reason : undefined) },
});

export const strykerPlugins = [
  ignorer('erxes-logging', 'A log line reports what the code did; it is not behaviour.', isLogCall),
  ignorer(
    'erxes-error-messages',
    'The text of a thrown error is for people; tests check its code.',
    isErrorMessage,
  ),
];
