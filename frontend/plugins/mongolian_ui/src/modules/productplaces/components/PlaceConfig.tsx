import { Button, Card, Input, Label } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IconPlus } from '@tabler/icons-react';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { PlaceConditionUI } from '../types';
import { useBoardPipelineStage } from '../hooks/useBoardPipelineStage';
import { useConditions } from '../hooks/useConditions';
import { useMnConfig } from '../hooks/useMnConfig';
import ConfigFooter from './shared/ConfigFooter';
import ConfigHeader from './shared/ConfigHeader';
import SavedConfigsList from './shared/SavedConfigsList';
import PerConditions from './PerConditions';

export interface PlaceConfigData {
  _id?: string;
  subId?: string;
  title: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  checkPricing: boolean;
  conditions: PlaceConditionUI[];
}

const emptyForm: PlaceConfigData = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  checkPricing: false,
  conditions: [],
};

const PlaceConfig: React.FC = () => {
  const { t } = useTranslation('mongolian');
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
  } = useMnConfig<PlaceConfigData>({
    code: 'dealsProductsDataPlaces',
    emptyForm,
    getSubId: (f) => f.stageId,
  });

  const { handleBoardChange, handlePipelineChange } =
    useBoardPipelineStage(setFormData);

  const { addCondition, updateCondition, removeCondition } =
    useConditions(setFormData);

  return (
    <div className="w-full flex justify-center overflow-y-auto">
      <div className="w-full max-w-6xl px-6 py-6 space-y-8">
        <ConfigHeader
          title={t('product-places-config')}
          onNew={reset}
          disabled={loading}
        />

        <SavedConfigsList
          configs={savedConfigs}
          activeIndex={activeIndex}
          onSelect={setActiveIndex}
        />

        <Card>
          <Card.Content className="space-y-6">
            <div className="space-y-2 pt-4">
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

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
                  {t('select-board')}
                </Label>
                <SelectBoard
                  mode="single"
                  value={formData.boardId}
                  onValueChange={(v) => handleBoardChange(v as string)}
                  placeholder={t('choose-board')}
                />
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
                  {t('select-pipeline')}
                </Label>
                <SelectPipeline
                  mode="single"
                  boardId={formData.boardId}
                  value={formData.pipelineId}
                  onValueChange={(v) => handlePipelineChange(v as string)}
                  placeholder={t('choose-pipeline')}
                />
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
                  {t('select-stage')}
                </Label>
                <SelectStage
                  mode="single"
                  pipelineId={formData.pipelineId}
                  value={formData.stageId}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, stageId: v as string }))
                  }
                  placeholder={t('choose-stage')}
                />
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>{t('conditions', { count: formData.conditions.length })}</Card.Title>
          </Card.Header>

          <Card.Content>
            {formData.conditions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-4">
                <p className="text-sm">
                  {t('no-conditions-yet')}
                </p>
                <Button onClick={addCondition} variant="outline" className="text-xs">
                  <IconPlus /> {t('add-condition')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.conditions.map((c, index) => (
                  <PerConditions
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
          onSave={() => handleSave()}
          onDelete={() => handleDelete()}
        />
      </div>
    </div>
  );
};

export default PlaceConfig;
