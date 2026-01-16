import { Label, Separator, Textarea, TextField } from 'erxes-ui';
import { useAdjustClosingDetailWithQuery } from '../hooks/useAdjustClosingDetailWithQuery';
import { useAdjustClosingEntryEdit } from '../hooks/useAdjustClosingEdit';
import { SelectAccountField } from './TextFieldAdjustClosing';

export const AdjustClosingDetailFields = () => {
  const { adjustClosingDetail } = useAdjustClosingDetailWithQuery();
  const { adjustClosingEdit } = useAdjustClosingEntryEdit();

  if (!adjustClosingDetail) return null;

  const {
    _id,
    branchId,
    departmentId,
    entries,
    closeIntegrateTrId,
    periodGLTrId,
    description,
  } = adjustClosingDetail;

  return (
    <>
      <div className="py-8 space-y-6">
        <div className="px-8 space-y-2">
          <DataListItem label="Branch">
            <SelectAccountField
              _id={_id}
              field="branchId"
              value={branchId}
              placeholder="Select Branch"
            />
          </DataListItem>

          <DataListItem label="Department">
            <SelectAccountField
              _id={_id}
              field="departmentId"
              value={departmentId}
              placeholder="Select Department"
            />
          </DataListItem>

          <DataListItem label="Close Integrate">
            <SelectAccountField
              _id={_id}
              field="closeIntegrateTrId"
              value={closeIntegrateTrId}
              placeholder="Select Account"
            />
          </DataListItem>

          <DataListItem label="Period GL">
            <SelectAccountField
              _id={_id}
              field="periodGLTrId"
              value={periodGLTrId}
              placeholder="Select Account"
            />
          </DataListItem>

          <div className="px-8 font-medium flex flex-col gap-5">
            {entries?.map((entry, index) => (
              <div key={entry._id} className="grid grid-cols-3 gap-5">
                <DataListItem label={`Account ${index + 1}`}>
                  <SelectAccountField
                    _id={_id}
                    field={`entries.${index}.accountId`}
                    value={entry.accountId}
                    placeholder="Select Account"
                  />
                </DataListItem>
                <DataListItem label="Description">
                  <Textarea
                    value={entry.description || ''}
                    placeholder="Description"
                    onChange={(e) =>
                      adjustClosingEdit({
                        variables: {
                          _id,
                          entries: entries.map((en, i) =>
                            i === index
                              ? { ...en, description: e.target.value }
                              : en,
                          ),
                        },
                      })
                    }
                  />
                </DataListItem>
                <DataListItem label="Status">
                  <Textarea
                    value={entry.status || ''}
                    placeholder="Status"
                    onChange={(e) =>
                      adjustClosingEdit({
                        variables: {
                          _id,
                          entries: entries.map((en, i) =>
                            i === index
                              ? { ...en, status: e.target.value }
                              : en,
                          ),
                        },
                      })
                    }
                  />
                </DataListItem>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <DataListItem label="description">
          <Textarea
            value={description || ''}
            onChange={(e) => {
              adjustClosingEdit({
                variables: {
                  _id,
                  description: e.target.value,
                },
              });
            }}
          />
        </DataListItem>
      </div>
    </>
  );
};

const DataListItem = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <fieldset className="space-y-2">
      <Label asChild>
        <legend>{label}</legend>
      </Label>
      {children}
    </fieldset>
  );
};
