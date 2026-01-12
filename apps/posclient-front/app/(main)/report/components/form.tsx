"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reportEndDateAtom, reportStartDateAtom } from "@/store";
import { LazyQueryExecFunction, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue, useSetAtom } from "jotai";
import { SearchIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { FacetedFilter } from "@/components/ui/faceted-filter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { currentUserAtom } from "@/store/config.store";
import type { Customer } from "@/types/customer.types";
import { queries } from "../graphql";
import { combineDateTime } from "../utils/date";
import { TimePicker } from "./timePicker";

interface DailyReportResponse {
  dailyReport: {
    report: string;
  };
}

const FormSchema = z
  .object({
    posUserIds: z.array(z.string()).optional(),
    dateType: z.string().optional(),
    startDate: z
      .date({
        required_error: "Тайлан шүүх өдрөө сонгоно уу",
      }),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
    endDate: z
      .date({
        required_error: "Тайлан шүүх өдрөө сонгоно уу",
      }),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  })
  .superRefine((data, ctx) => {
    if (!data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "Тайлан шүүх өдрөө сонгоно уу",
      });
      return;
    }
    if (!data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Тайлан шүүх өдрөө сонгоно уу",
      });
      return;
    }
  });

type FormValues = z.infer<typeof FormSchema>;

interface ReportVariables {
  posUserIds?: string[];
  dateType?: string;
  startDate: Date;
  endDate: Date;
}

interface ReportFormProps {
  getReport: LazyQueryExecFunction<DailyReportResponse, ReportVariables>;
  loading: boolean;
}

const LOADING_TEXT = "Уншиж байна...";

const ReportForm = ({ getReport, loading }: ReportFormProps) => {
  const setReportStartDate = useSetAtom(reportStartDateAtom);
  const setReportEndDate = useSetAtom(reportEndDateAtom);
  const currentUser = useAtomValue(currentUserAtom);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      posUserIds: currentUser?._id && [currentUser?._id] || [],
      dateType: 'paid',
      startDate: new Date(),
      startTime: "00:00",
      endDate: new Date(),
      endTime: "23:59",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (!data.startDate) {
        form.setError("startDate", {
          type: "manual",
          message: "Тайлан шүүх өдрөө сонгоно уу",
        });
        return;
      }

      if (!data.endDate) {
        form.setError("endDate", {
          type: "manual",
          message: "Тайлан шүүх өдрөө сонгоно уу",
        });
        return;
      }

      const combinedBDate = combineDateTime(data.startDate, data.startTime);
      if (!combinedBDate) {
        form.setError("startTime", {
          type: "manual",
          message: "Invalid date-time combination",
        });
        return;
      }
      const combinedEDate = combineDateTime(data.endDate, data.endTime);
      if (!combinedEDate) {
        form.setError("endTime", {
          type: "manual",
          message: "Invalid date-time combination",
        });
        return;
      }

      const result = await getReport({
        variables: {
          posUserIds: data.posUserIds || [],
          dateType: data.dateType,
          startDate: combinedBDate,
          endDate: combinedEDate,
        },
      });

      if (result.data) {
        if (!Number.isNaN(combinedBDate.getTime())) {
          setReportStartDate(combinedBDate);
        }
        if (!Number.isNaN(combinedEDate.getTime())) {
          setReportEndDate(combinedEDate);
        }
      } else {
        console.error("No data returned from the report query");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      form.setError("root", {
        type: "manual",
        message: error instanceof Error ? error.message : "An error occurred while generating the report",
      });
    }
  };

  const {
    data: userData,
    loading: loadingUsers,
    error: usersError,
  } = useQuery<{ posUsers: Customer[] }>(queries.users);

  if (usersError) {
    console.error("Error loading users:", usersError);
    return <div>Ажилчдын мэдээллийг ачааллахад алдаа гарлаа. Дараа дахин оролдоно уу.</div>;
  }

  const posUsers = userData?.posUsers || [];
  const posUserOptions = posUsers.map((user) => ({
    label: user.email || "Unknown",
    value: user._id,
  }));

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3 w-full md:w-1/3 print:hidden"
      >
        <FormField
          control={form.control}
          name="posUserIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ажилчид</FormLabel>
              <FormControl>
                {loadingUsers ? (
                  <Input disabled placeholder={LOADING_TEXT} />
                ) : (
                  <FacetedFilter
                    options={posUserOptions}
                    title="Ажилчид"
                    values={field.value}
                    onSelect={field.onChange}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Огнооны төрөл</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Ангилал сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">
                      Төлсөн | Paid
                    </SelectItem>
                    <SelectItem value="created">
                      Үүсгэсэн | Created
                    </SelectItem>
                    <SelectItem value="modified">
                      Сүүлд өөрчилсөн | Modified
                    </SelectItem>
                    <SelectItem value="due">
                      Гүйцэтгэх | Due
                    </SelectItem>
                    <SelectItem value="close">
                      Хаагдсан | Close
                    </SelectItem>
                    <SelectItem value="return">
                      Буцаасан | Return
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-2 items-end gap-y-3 gap-x-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block">Эхлэл - Oгноо</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                    toDate={new Date()}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block">Цаг</FormLabel>
                <FormControl>
                  <TimePicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid md:grid-cols-2 items-end gap-y-3 gap-x-2">
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block">Төгсгөл - Oгноо</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                    toDate={new Date()}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block">Цаг</FormLabel>
                <FormControl>
                  <TimePicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          size="sm"
          disabled={loading}
          aria-label="Тайлан шүүх"
        >
          {!loading && <SearchIcon className="h-4 w-4 mr-1" aria-hidden="true" />}
          Тайлан шүүх
        </Button>
      </form>
    </Form>
  );
};

export default ReportForm;