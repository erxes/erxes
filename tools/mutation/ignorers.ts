type Node = {
  type: string;
  name?: string;
  value?: unknown;
  object?: Node;
  property?: Node;
  callee?: Node;
  expression?: Node;
};

type NodePath = { node: Node; parentPath: NodePath | null };

const LEVELS = new Set(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'log', 'child']);

const LOGGER = /^(log|logger|console)$|Logger$|Log$/;

const isLogger = (node: Node | undefined): boolean =>
  (node?.type === 'Identifier' && LOGGER.test(node.name ?? '')) ||
  (node?.type === 'MemberExpression' && isLogger(node.property));

const isLogCallNode = (node: Node | undefined) =>
  node?.type === 'CallExpression' &&
  node.callee?.type === 'MemberExpression' &&
  isLogger(node.callee.object) &&
  LEVELS.has(node.callee.property?.name ?? '');

const isLogCall = ({ node }: NodePath) =>
  isLogCallNode(node) || (node.type === 'ExpressionStatement' && isLogCallNode(node.expression));

const insideThrow = (path: NodePath) => {
  for (let parent = path.parentPath; parent; parent = parent.parentPath) {
    if (parent.node.type === 'ThrowStatement') return true;

    if (/Function|Method/.test(parent.node.type)) return false;
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
