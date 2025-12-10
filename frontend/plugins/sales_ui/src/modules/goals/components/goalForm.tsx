import React, { useEffect } from 'react';
import { gql, useQuery, useApolloClient } from '@apollo/client';
import { useForm, Controller } from 'react-hook-form';
import { queries as pipelineQuery } from '~/modules/deals/graphql/queries/PipelinesQueries';
import { IPipelineLabel } from '~/modules/deals/types/pipelines';
import {
  Button,
  Form,
  Checkbox,
  Alert,
  DatePicker,
  useToast,
} from 'erxes-ui';
import { IGoalTypeDoc, IGoalType, GoalFormType } from '../types';
import {
  SelectTags as SelectTagsRaw,
  SelectBranches as SelectBranchesRaw,
  SelectDepartments as SelectDepartmentsRaw,
  SelectUnit as SelectUnitRaw,
  SelectMember as SelectMemberRaw,
  SelectCompany as SelectCompanyRaw,
  SelectProduct as SelectProductRaw,
} from 'ui-modules';

import { SelectSegment as SelectSegmentRaw } from 'ui-modules/modules/segments/components/SelectSegment';
import { SelectBoard } from '~/modules/deals/boards/components/SelectBoards';
import {
  ENTITY,
  GOAL_TYPE,
  CONTRIBUTION,
  GOAL_STRUCTURE,
  SPECIFIC_PERIOD_GOAL,
} from '../constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { goalFormSchema } from './goalFormSchema';

const SelectTags: any = SelectTagsRaw as any;
const SelectBranches: any = SelectBranchesRaw as any;
const SelectDepartments: any = SelectDepartmentsRaw as any;
const SelectUnit: any = SelectUnitRaw as any;
const SelectMember: any = SelectMemberRaw as any;
const SelectCompany: any = SelectCompanyRaw as any;
const SelectProduct: any = SelectProductRaw as any;
const SelectSegment: any = SelectSegmentRaw as any;

type Props = {
  renderButton: (props: any) => JSX.Element;
  goalType?: IGoalType | IGoalTypeDoc;
  closeModal: () => void;
  pipelineLabels?: IPipelineLabel[];
  segmentIds: string[] | null;
  isEdit?: boolean;
  editGoal?: any;
  addGoal?: any;
  goalId?: string;
};

const GoalForm: React.FC<Props> = ({
  goalType,
  closeModal,
  renderButton,
  isEdit,
  editGoal,
  addGoal,
  goalId,
}) => {
  
  const client = useApolloClient();
  const { toast } = useToast();
  
  const form = useForm<GoalFormType>({
    resolver: zodResolver(goalFormSchema, undefined, { mode: 'async' }),
    defaultValues: {
      name: '',
      entity: 'deal',
      contributionType: 'person',
      metric: 'Value',
      goalTypeChoose: 'Added',
      contribution: [],
      department: [],
      unit: [],
      branch: [],
      segmentIds: [],
      productIds: [],
      companyIds: [],
      tagsIds: [],
      specificPeriodGoals: [],
      stageRadio: false,
      segmentRadio: false,
      periodGoal: 'Monthly',
      teamGoalType: '',
      segmentCount: 0,
      pipelineLabels: [],
      selectedLabelIds: [],
      ...(goalType as any),
    },
  });
 
  
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState,
  } = form;

  // Keep form reset in sync with `goalType` prop
  useEffect(() => {
    if (goalType) {
      reset({ ...goalFormSchema.safeParse({}), ...(goalType as any) });
    }
  }, [goalType, reset]);

  const watchedPipelineId = watch('pipelineId');
  const watchedStartDate = watch('startDate');
  const watchedEndDate = watch('endDate');

  const { data: labelsData, loading: labelsLoading, error: labelsError } = useQuery(
    pipelineQuery.pipelineLabels,
    {
      variables: { pipelineId: watchedPipelineId },
      skip: !watchedPipelineId,
      fetchPolicy: 'network-only',
    },
  );

  useEffect(() => {
    if (labelsError) {
      toast({
        variant: 'destructive',
        title: 'Error loading pipeline labels',
        description: (labelsError as any).message,
      });
    }
  }, [labelsError, toast]);

  useEffect(() => {
    if (!labelsLoading && labelsData?.pipelineLabels) {
      const fetchedLabels: IPipelineLabel[] = labelsData.pipelineLabels;
      setValue('pipelineLabels', fetchedLabels);

      const initialSelected = (goalType?.pipelineLabels || []).map((l: any) => l._id);
      if (initialSelected.length) setValue('selectedLabelIds', initialSelected);
    }
  }, [labelsLoading, labelsData, setValue, goalType]);

  // Helper: produce final payload
  const generateDoc = (values?: Partial<GoalFormType>) => {
  const v = values || getValues();
  const finalId = (goalType as any)?._id || v._id;

  const doc = {
    _id: finalId,
    name: v.name || '',
    entity: v.entity || '',
    stageId: v.stageId || null,
    pipelineId: v.pipelineId || null,
    boardId: v.boardId || null,
    contributionType: v.contributionType || '', // Provide default
    metric: v.metric || '',
    goalTypeChoose: v.goalTypeChoose || '',
    contribution: v.contribution || [], // Ensure array
    department: v.department || [],
    unit: v.unit || [], // Ensure array
    branch: v.branch || [],
    specificPeriodGoals: (v.specificPeriodGoals || []).map((p) => ({
      _id: p._id,
      addMonthly: p.addMonthly,
      addTarget: p.addTarget,
      progress: (p as any).progress ?? '0',
      current: (p as any).current ?? '0',
    })),
    startDate: v.startDate,
    endDate: v.endDate,
    segmentCount: v.segmentCount || 0,
    pipelineLabels: v.pipelineLabels || [],
    productIds: v.productIds || [],
    companyIds: v.companyIds || [],
    tagsIds: v.tagsIds || [],
    segmentIds: v.segmentIds || [],
    periodGoal: v.periodGoal || '',
    segmentRadio: !!v.segmentRadio, // Ensure boolean
    stageRadio: !!v.stageRadio, // Ensure boolean
    teamGoalType: v.teamGoalType || '', // Provide default
  };
  
  return doc as IGoalTypeDoc & { _id?: string };
};

  const onChangeStartDate = (value: Date | null) => {
    setValue('startDate', value);
  };

  const onChangeEndDate = (value: Date | null) => {
    const currentPeriodGoal = watch('periodGoal') || 'Weekly';
    setValue('endDate', value);
    setValue('periodGoal', currentPeriodGoal);
  };

  const onChangeBranchId = (value: string[] | string) => {
    setValue('branch', Array.isArray(value) ? value : [value]);
  };

  const onChangePipelineLabel = (
    newValue: Array<{ value: string; label: string }>,
  ) => {
    const ids = newValue?.map((o) => o.value) ?? [];
    setValue('selectedLabelIds', ids);
  };

  const onChangeDepartments = (value: string[] | string) => {
    setValue('department', Array.isArray(value) ? value : [value]);
  };

  const onChangeCompanies = (value: string[] | string) => {
    setValue('companyIds', Array.isArray(value) ? value : [value]);
  };

  const onChangeTags = (value: string[] | string) => {
    setValue('tagsIds', Array.isArray(value) ? value : [value]);
  };

  const onChangeProduct = (value: string[] | string) => {
    setValue('productIds', Array.isArray(value) ? value : [value]);
  };

  const onChangeUnites = (value: string[] | string) => {
    setValue('unit', Array.isArray(value) ? value : [value]);
  };

  const onChangeStage = (stageId: string) => {
    setValue('stageId', stageId);
  };

  const onChangePipeline = async (pipelineId: string) => {
    try {
      const { data } = await client.query({
        query: pipelineQuery.pipelineLabels,
        fetchPolicy: 'network-only',
        variables: { pipelineId },
      });

      setValue('pipelineLabels', data?.pipelineLabels ?? []);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e.message || String(e),
      });
    }

    setValue('pipelineId', pipelineId);
  };

  const onChangeBoard = (boardId: string) => {
    setValue('boardId', boardId);
  };

  const onChangeField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setValue(name as keyof GoalFormType, type === 'checkbox' ? checked : value);
  };

  const onUserChange = (userId: string) => {
  setValue("contribution", [userId]);
};


  const onChangeSegments = (values: string[] | string) => {
    setValue('segmentIds', Array.isArray(values) ? values : [values]);
  };

  const onChangeTarget = (
    date: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(event.target.value, 10);
    const { startDate, endDate, specificPeriodGoals, periodGoal } = getValues();

    let updatedGoals =
      specificPeriodGoals?.map((goal) =>
        goal.addMonthly === date ? { ...goal, addTarget: value } : goal,
      ) ?? [];

    const periods =
      periodGoal === 'Monthly'
        ? mapMonths(startDate, endDate)
        : mapWeeks(startDate, endDate);

    periods.forEach((period) => {
      const exists = updatedGoals.some((g) => g.addMonthly === period);
      if (!exists) {
        updatedGoals.push({
            _id: Math.random().toString(),
            addMonthly: period,
            addTarget: value || 0,
            progress: "0",     
            current: "0",      
        });
      }
    });

    const filteredGoals = updatedGoals.filter(
      (goal) =>
        (periodGoal === 'Monthly' && goal.addMonthly.includes('Month')) ||
        (periodGoal === 'Weekly' && goal.addMonthly.includes('Week')),
    );

    setValue('specificPeriodGoals', filteredGoals);
  };

  const mapMonths = (startDate?: Date | null, endDate?: Date | null): string[] => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months: string[] = [];
    const monthNames = [
      'January','February','March','April','May','June','July','August','September','October','November','December',
    ];

    for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
      const startM = y === start.getFullYear() ? start.getMonth() : 0;
      const endM = y === end.getFullYear() ? end.getMonth() : 11;
      for (let m = startM; m <= endM; m++) {
        months.push(`Month of ${monthNames[m]} ${y}`);
      }
    }
    return months;
  };

  const mapWeeks = (startDate?: Date | null, endDate?: Date | null): string[] => {
    if (!startDate || !endDate) return [];
    const weeks: string[] = [];
    const s = new Date(startDate);
    const e = new Date(endDate);
    const cur = new Date(s);
    while (cur <= e) {
      const ws = new Date(cur);
      const we = new Date(cur);
      we.setDate(we.getDate() + 6);
      weeks.push(`Week of ${ws.toDateString()} - ${we.toDateString()}`);
      cur.setDate(cur.getDate() + 7);
    }
    return weeks;
  };

  const months = mapMonths(watchedStartDate, watchedEndDate);
  const weeks = mapWeeks(watchedStartDate, watchedEndDate);

  const onSubmit = async (data: GoalFormType) => {
    try {
      console.log('Form data before submission:', data);
      console.log('Generated doc:', generateDoc(data));

      if (isEdit) {
        await editGoal({
          variables: {
            id: goalId,
            ...generateDoc(data),
          },
        });

        toast({
          title: 'Success',
          description: 'Goal updated successfully',
        });
      } else {
        await addGoal({
          variables: generateDoc(data),
        });

        toast({
          title: 'Success',
          description: 'Goal created successfully',
        });
      }

      // ✅ Reset & close after successful mutation
      reset();
      closeModal();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to save goal',
        description: error.message || String(error),
      });
    }
  };
 

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col h-full overflow-hidden"
      >
        <div className="form-wrapper">
          {/* ================= LEFT COLUMN ================= */}
          <div className="form-column">
            {/* NAME */}
            <Form.Item>
              <Form.Label>{'Name'}</Form.Label>
              <Form.Control>
                <input
                  {...register('name')}
                  className="w-full"
                  placeholder={'Goal name'}
                />
              </Form.Control>
            </Form.Item>

            {/* ENTITY */}
            <Form.Item>
              <Form.Label>{'Choose Entity'}</Form.Label>
              <Form.Control>
                <select
                  {...register('entity')}
                  className="w-full border rounded-md px-3 py-2"
                >
                  {ENTITY.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Form.Control>
            </Form.Item>

            {/* STAGE RADIO */}
            <Form.Item className="flex items-center gap-2">
              <Controller
                control={control}
                name="stageRadio"
                render={({ field }) => (
                  <>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(c: any) => field.onChange(!!c)}
                    />
                    <span>{'Stage'}</span>
                  </>
                )}
              />
            </Form.Item>

            {/* SEGMENT RADIO */}
            <Form.Item className="flex items-center gap-2">
              <Controller
                control={control}
                name="segmentRadio"
                render={({ field }) => (
                  <>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(c: any) => field.onChange(!!c)}
                    />
                    <span>{'Segment'}</span>
                  </>
                )}
              />
            </Form.Item>

            {/* SEGMENTS */}
            {watch('segmentRadio') && (
              <Form.Item>
                <Form.Label>{'Segments'}</Form.Label>
                <Controller
                  name="segmentIds"
                  control={control}
                  render={({ field }) => (
                    <SelectSegment
                      value={field.value}
                      onChange={(ids: string[]) => {
                        field.onChange(ids);
                      }}
                    />
                  )}
                />
              </Form.Item>
            )}

            {/* BOARD SELECT */}
            {watch('stageRadio') && (
              <Form.Item>
                <Form.Label>Board</Form.Label>
                <Form.Control>
                  <SelectBoard.FormItem
                    mode="single"
                    value={watch('boardId') || ''}
                    onValueChange={(v) => setValue('boardId', v as string)}
                    placeholder="Select board"
                  />
                </Form.Control>
              </Form.Item>
            )}

            {/* START DATE */}
            <Form.Item>
              <Form.Label>{'Start duration'}</Form.Label>
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value ?? undefined}
                    onChange={(v: any) => {
                      field.onChange(v ?? null);
                      onChangeStartDate(
                        Array.isArray(v) ? (v[0] as Date) : (v as Date | null),
                      );
                    }}
                    withPresent={false}
                  />
                )}
              />
            </Form.Item>

            {/* END DATE */}
            <Form.Item>
              <Form.Label>{'End duration'}</Form.Label>
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <DatePicker
                    value={field.value ?? undefined}
                    onChange={(v: any) => {
                      field.onChange(v ?? null);
                      onChangeEndDate(
                        Array.isArray(v) ? (v[0] as Date) : (v as Date | null),
                      );
                    }}
                    withPresent={false}
                  />
                )}
              />
            </Form.Item>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="form-column">
            {/* GOAL TYPE */}
            <Form.Item>
              <Form.Label>{'Choose goal type'}</Form.Label>
              <Form.Control>
                <select
                  {...register('goalTypeChoose')}
                  className="w-full border rounded-md px-3 py-2"
                >
                  {GOAL_TYPE.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Form.Control>
            </Form.Item>

            {/* CONTRIBUTION TYPE */}
            <Form.Item>
              <Form.Label>{'Contribution type'}</Form.Label>
              <Controller
                control={control}
                name="contributionType"
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    {CONTRIBUTION.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </Form.Item>

            {/* PERSON CONTRIBUTION */}
            {watch('contributionType') === 'person' && (
              <Form.Item>
                <Form.Label>{'Contribution'}</Form.Label>
                <Controller
                  control={control}
                  name="contribution"
                  render={({ field }) => (
                    <SelectMember
                      label="Choose users"
                      name="userId"
                      customOption={{ label: 'Choose user', value: '' }}
                      initialValue={field.value}
                      onSelect={(v: any) => field.onChange(v)}
                      multi={false}
                    />
                  )}
                />
              </Form.Item>
            )}

            {/* TEAM GOAL TYPE */}
            {watch('contributionType') === 'team' && (
              <Form.Item>
                <Form.Label>{'Choose Structure'}</Form.Label>
                <Form.Control>
                  <select
                    {...register('teamGoalType')}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    {GOAL_STRUCTURE.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Form.Control>
              </Form.Item>
            )}

            {/* COMPANIES */}
            {watch('teamGoalType') === 'Companies' &&
              watch('contributionType') === 'team' && (
                <Form.Item>
                  <Form.Label>{'Companies'}</Form.Label>
                  <Controller
                    control={control}
                    name="companyIds"
                    render={({ field }) => (
                      <SelectCompany
                        label={'Choose Companies'}
                        name="companyIds"
                        initialValue={field.value}
                        onSelect={(v: any) => field.onChange(v)}
                        multi={true}
                      />
                    )}
                  />
                </Form.Item>
              )}

            {/* METRIC */}
            <Form.Item>
              <Form.Label>{'Metric'}</Form.Label>
              <Form.Control>
                <select
                  {...register('metric')}
                  className="w-full border rounded-md px-3 py-2"
                >
                  {['Value', 'Count'].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Form.Control>
            </Form.Item>

            {/* TAGS */}
            <Form.Item>
              <Form.Label>{'Tags'}</Form.Label>
              <Controller
                control={control}
                name="tagsIds"
                render={({ field }) => (
                  <SelectTags
                    tagsType={
                      watch('entity') === 'deal'
                        ? `sales:${watch('entity')}`
                        : `${watch('entity')}s:${watch('entity')}`
                    }
                    label={'Choose Tags'}
                    name="tagsIds"
                    initialValue={field.value}
                    onSelect={(v: any) => field.onChange(v)}
                    multi={true}
                  />
                )}
              />
            </Form.Item>

            {/* PRODUCTS */}
            <Form.Item>
              <Form.Label>{'Products'}</Form.Label>
              <Controller
                control={control}
                name="productIds"
                render={({ field }) => (
                  <SelectProduct
                    label={'Choose products'}
                    name="productIds"
                    initialValue={field.value}
                    onSelect={(v: any) => field.onChange(v)}
                    multi={true}
                  />
                )}
              />
            </Form.Item>

            {/* PERIOD GOAL */}
            <Form.Item>
              <Form.Label>{'Choose specific period goal'}</Form.Label>
              <Form.Control>
                <select
                  {...register('periodGoal')}
                  className="w-full border rounded-md px-3 py-2"
                >
                  {SPECIFIC_PERIOD_GOAL.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Form.Control>
            </Form.Item>
          </div>
        </div>

        {/* Monthly/Weekly period goals sections */}
        {watch('periodGoal') === 'Monthly' && (
          <div>
            {months.map((month) => {
              const target = watch('specificPeriodGoals')?.find(
                (g) => g.addMonthly === month,
              )?.addTarget;

              return (
                <div className="form-wrapper" key={month}>
                  <div className="form-column">
                    <Form.Item>
                      <Form.Label>{'Period (Monthly)'}</Form.Label>
                      <Form.Control>
                        <div className="px-3 py-2 border rounded-md">{month}</div>
                      </Form.Control>
                    </Form.Item>
                  </div>

                  <div className="form-column">
                    <Form.Item>
                      <Form.Label>{'Target'}</Form.Label>
                      <Form.Control>
                        <input
                          type="number"
                          className="w-full border rounded-md px-3 py-2"
                          value={target ?? ''}
                          onChange={(e) =>
                            onChangeTarget(
                              month,
                              e as React.ChangeEvent<HTMLInputElement>,
                            )
                          }
                        />
                      </Form.Control>
                    </Form.Item>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {watch('periodGoal') === 'Weekly' && (
          <div>
            {weeks.map((week) => {
              const target = watch('specificPeriodGoals')?.find(
                (g) => g.addMonthly === week,
              )?.addTarget;

              return (
                <div className="form-wrapper" key={week}>
                  <div className="form-column">
                    <Form.Item>
                      <Form.Label>{'Period (Weekly)'}</Form.Label>
                      <Form.Control>
                        <div className="px-3 py-2 border rounded-md">{week}</div>
                      </Form.Control>
                    </Form.Item>
                  </div>

                  <div className="form-column">
                    <Form.Item>
                      <Form.Label>{'Target'}</Form.Label>
                      <Form.Control>
                        <input
                          type="number"
                          className="w-full border rounded-md px-3 py-2"
                          value={target ?? ''}
                          onChange={(e) =>
                            onChangeTarget(
                              week,
                              e as React.ChangeEvent<HTMLInputElement>,
                            )
                          }
                        />
                      </Form.Control>
                    </Form.Item>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={closeModal}>
            {'Close'}
          </Button>

          {renderButton({
            name: 'goalType',
            values: generateDoc(getValues()),
            isSubmitted: formState.isSubmitted,
            object: goalType,
          })}
        </div>
      </form>
    </Form>
  );
};

export default GoalForm;