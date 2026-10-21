import { Button, Sheet } from 'erxes-ui';
import { CredentialMetadata } from '../types';
import { CredentialConsumerAccess } from './CredentialConsumerAccess';

export function CredentialDetail({
  credential,
  canManage,
  canManageGrants,
  onClose,
  onEdit,
  onDelete,
}: {
  credential: CredentialMetadata;
  canManage: boolean;
  canManageGrants: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <Sheet.View
        className="p-0 sm:max-w-lg"
        aria-describedby="credential-detail-description"
      >
        <Sheet.Header>
          <Sheet.Title>Credential details</Sheet.Title>
          <Sheet.Close aria-label="Close credential details" />
        </Sheet.Header>
        <Sheet.Content className="space-y-5 overflow-y-auto p-5">
          <div>
            <h2 className="text-lg font-semibold break-words">
              {credential.name}
            </h2>
            <p
              id="credential-detail-description"
              className="text-sm text-muted-foreground mt-1 break-words"
            >
              {credential.description ||
                'Credential metadata. Stored values cannot be viewed.'}
            </p>
          </div>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">
                Stable reference
              </dt>
              <dd className="mt-1 font-mono text-xs break-all">
                {credential.reference}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Template</dt>
              <dd className="mt-1">{credential.templateId}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Category</dt>
              <dd className="mt-1 break-words">{credential.category}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Created</dt>
              <dd className="mt-1">
                {new Date(credential.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Updated</dt>
              <dd className="mt-1">
                {new Date(credential.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
          <section className="space-y-3 border-t pt-5">
            <h3 className="text-sm font-semibold">Fields</h3>
            <p className="text-xs text-muted-foreground">
              Only presence is visible, never the saved value.
            </p>
            <dl className="divide-y rounded-md border">
              {credential.fields.map((field) => (
                <div
                  key={field.key}
                  className="flex justify-between gap-3 p-3 text-sm"
                >
                  <dt className="min-w-0 break-words">
                    {field.label || field.key}
                    <span className="block text-xs text-muted-foreground">
                      {field.type}
                      {field.secret ? ' · Sensitive' : ''}
                      {field.required ? ' · Required' : ''}
                    </span>
                  </dt>
                  <dd className="shrink-0 text-muted-foreground">
                    {field.hasValue ? 'Value stored' : 'Empty'}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          <CredentialConsumerAccess
            credentialId={credential._id}
            canManage={canManageGrants}
          />
        </Sheet.Content>
        {canManage && (
          <Sheet.Footer className="justify-between">
            <Button variant="destructive" onClick={onDelete}>
              Delete
            </Button>
            <Button onClick={onEdit}>Edit credential</Button>
          </Sheet.Footer>
        )}
      </Sheet.View>
    </Sheet>
  );
}
