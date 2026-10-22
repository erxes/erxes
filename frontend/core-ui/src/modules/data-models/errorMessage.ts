export const dataModelErrorMessage = (error: Error | string): string => {
  const message = typeof error === 'string' ? error : error.message;
  if (/access denied|not authorized|permission denied/i.test(message))
    return 'You do not have permission to view or change this information. Ask a workspace administrator for access.';
  if (/related model is archived/i.test(message))
    return 'The related object is archived. Restore it in Data Models to use these links again.';
  if (/active relation field not found/i.test(message))
    return 'This relation has changed or was archived. Reopen the record to load its current fields.';
  if (/failed to fetch|network request failed|networkerror/i.test(message))
    return 'Could not reach the server. Check your connection and try again.';
  if (/forward or reverse field name already exists/i.test(message))
    return 'A field with this name already exists on one of the objects. Choose another relation name, or change “Name on related object” under More settings.';
  if (
    /field with this GraphQL name already exists|name belongs to an existing multi-object relation|relation name is already in use/i.test(
      message,
    )
  )
    return 'This object already has a field with that name. Choose another name, or restore the existing field from Archived fields.';
  if (/reverse field name is reserved/i.test(message))
    return 'The related object already uses this field name. Change “Name on related object” under More settings.';
  if (/field name is reserved|name is reserved by the model/i.test(message))
    return 'This name is already used by a built-in field. Choose another name.';
  if (/Model changed/i.test(message))
    return 'Someone changed this object while you were editing it. Close this form and open it again to load the latest changes.';
  if (/Field changed|Relation changed/i.test(message))
    return 'Someone changed this field while you were editing it. Close this form and open it again to load the latest changes.';
  if (/Record fields changed|Record changed/i.test(message))
    return 'This record has changed. Close the editor, refresh the record, and try again.';
  if (/cannot include its source object with other destinations/i.test(message))
    return 'To link this object to itself, select it as the only destination.';
  if (/model name is reserved/i.test(message))
    return 'A built-in object already uses this name. Choose another object name.';
  if (/model with this name already exists/i.test(message))
    return 'An object with this name already exists. Choose another name, or restore it from Archived models.';
  return message;
};
