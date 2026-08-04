import { Button, Card, Input, Label, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectPipeline } from '../selects/SelectPipeline';
import { SelectSalesBoard } from '../selects/SelectSalesBoard';
import { SelectStage } from '../selects/SelectStage';
import { Condition } from '../types';
import { useBoardPipelineStage } from '../hooks/useBoardPipelineStage';
import { useConditions } from '../hooks/useConditions';
import { useMnConfig } from '../hooks/useMnConfig';
import ConfigFooter from './shared/ConfigFooter';
import ConfigHeader from './shared/ConfigHeader';
import SavedConfigsList from './shared/SavedConfigsList';
import PerPrintConditions from './PerPrintConditions';

export interface PrintConfigData {
  _id?: string;
  subId?: string;
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  conditions: Condition[];
}

const emptyForm: PrintConfigData = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  conditions: [],
};

const PrintConfig: React.FC = () => {
  const { t } = useTranslation('mongolian');
  const { toast } = useToast();

  const {
    savedConfigs,
    activeIndex,
    setActiveIndex,
    formData,
    setFormData,
    loading,
    reset,
    handleSave,
    handleDelete,
  } = useMnConfig<PrintConfigData>({
    code: 'dealsProductsDataPrint',
    emptyForm,
    getSubId: (f) => f.stageId,
  });

  const { handleBoardChange, handlePipelineChange } =
    useBoardPipelineStage(setFormData);

  const { addCondition, updateCondition, removeCondition } =
    useConditions(setFormData);

  const onSave = () =>
    handleSave(
      () => toast({ title: t('success'), description: t('configuration-saved') }),
      (e) =>
        toast({
          title: t('error'),
          description: e?.message || t('failed-to-save-configuration'),
          variant: 'destructive',
        }),
    );

  const onDelete = () =>
    handleDelete(
      () => toast({ title: t('success'), description: t('configuration-deleted') }),
      (e) =>
        toast({
          title: t('error'),
          description: e?.message || t('failed-to-delete-configuration'),
          variant: 'destructive',
        }),
    );

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-6 py-8 space-y-8">
        <ConfigHeader
          title={t('print-configuration')}
          onNew={reset}
          disabled={loading}
        />

        <SavedConfigsList
          configs={savedConfigs}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />

        <Card>
          <Card.Content className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                {t('title')}
              </Label>
              <Input
                placeholder={t('enter-configuration-title')}
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  {t('board')}
                </Label>
                <SelectSalesBoard
                  variant="form"
                  value={formData.boardId || ''}
                  onValueChange={handleBoardChange}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  {t('pipeline')}
                </Label>
                <SelectPipeline
                  variant="form"
                  boardId={formData.boardId || ''}
                  value={formData.pipelineId || ''}
                  onValueChange={handlePipelineChange}
                  disabled={!formData.boardId}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  {t('stage')}
                </Label>
                <SelectStage
                  id="print-stage"
                  variant="form"
                  pipelineId={formData.pipelineId || ''}
                  value={formData.stageId || ''}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, stageId: v }))
                  }
                  disabled={!formData.pipelineId}
                />
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>{t('conditions', { count: formData.conditions.length })}</Card.Title>
              <Button onClick={addCondition} variant="outline" className="text-xs">
                + {t('add-condition')}
              </Button>
            </div>
          </Card.Header>

          <Card.Content>
            {formData.conditions.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <p className="text-sm">
                  {t('no-conditions-yet')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.conditions.map((c, index) => (
                  <PerPrintConditions
                    key={c.id}
                    condition={c}
                    onChange={updateCondition}
                    onRemove={removeCondition}
                    onAddCondition={
                      index === formData.conditions.length - 1
                        ? addCondition
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </Card.Content>
        </Card>

        <ConfigFooter
          activeIndex={activeIndex}
          loading={loading}
          onClear={reset}
          onSave={onSave}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default PrintConfig;
