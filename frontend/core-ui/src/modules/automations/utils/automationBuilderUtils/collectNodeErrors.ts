type TNodeLike = { id?: string; label?: string };
type TWorkflowLike = TNodeLike & { actions?: TNodeLike[] };

const describeNodeError = (err: Record<string, any>) => {
  const errorKeys = Object.keys(err);

  return errorKeys.length === 1
    ? err[errorKeys[0]]?.message
    : JSON.stringify(err);
};

export const collectNodeErrors = (
  errors: any,
  {
    triggers = [],
    actions = [],
    workflows = [],
  }: {
    triggers?: TNodeLike[];
    actions?: TNodeLike[];
    workflows?: TWorkflowLike[];
  },
): Record<string, string> => {
  const nodeErrorMap: Record<string, string> = {};

  for (const { list, listErrors } of [
    { list: triggers, listErrors: errors?.triggers },
    { list: actions, listErrors: errors?.actions },
  ]) {
    if (!Array.isArray(listErrors)) {
      continue;
    }

    listErrors.forEach((err, index) => {
      const id = list[index]?.id;

      if (err && id) {
        nodeErrorMap[id] = describeNodeError(err);
      }
    });
  }

  if (Array.isArray(errors?.workflows)) {
    errors.workflows.forEach((workflowError: any, workflowIndex: number) => {
      const workflow = workflows[workflowIndex];
      const memberErrors = workflowError?.actions;

      if (!Array.isArray(memberErrors)) {
        return;
      }

      memberErrors.forEach((err: Record<string, any>, index: number) => {
        const member = (workflow?.actions || [])[index];

        if (!err || !member?.id) {
          return;
        }

        const description = describeNodeError(err);
        nodeErrorMap[member.id] = description;

        if (workflow?.id && !nodeErrorMap[workflow.id]) {
          nodeErrorMap[workflow.id] = `${
            member.label || 'Action'
          }: ${description}`;
        }
      });
    });
  }

  return nodeErrorMap;
};

/** First leaf message in a react-hook-form error tree. */
export const findFirstErrorMessage = (
  value: any,
  depth = 0,
): { message?: string; ref?: any } | undefined => {
  if (!value || typeof value !== 'object' || depth > 6) {
    return undefined;
  }

  if (typeof value.message === 'string') {
    return { message: value.message, ref: value.ref };
  }

  for (const nested of Object.values(value)) {
    const found = findFirstErrorMessage(nested, depth + 1);

    if (found) {
      return found;
    }
  }

  return undefined;
};
