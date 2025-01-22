"use client";

import { reportDateAtom } from "@/store";
import { LazyQueryExecFunction, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isFuture } from "date-fns";
import { useSetAtom } from "jotai";
import { SearchIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { combineDateTime } from "../utils/date";

import type { Customer } from "@/types/customer.types";
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
import { queries } from "../graphql";
import { TimePicker } from "./timePicker";

const FormSchema = z
  .object({
    posUserIds: z.array(z.string()).optional(),
    posNumber: z
      .date({
        required_error: "Тайлан шүүх өдрөө сонгоно уу",
      })
      .nullable(),
    time: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  })
  .superRefine((data, ctx) => {
    const combinedDate = combineDateTime(data.posNumber, data.time);
    if (combinedDate && isFuture(combinedDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["posNumber", "time"],
        message: "Ирээдүйн цаг оруулах боломжгүй",
      });
    }
  });

type FormValues = z.infer<typeof FormSchema>;

interface ReportVariables {
  posUserIds?: string[];
  posNumber: string;
}

interface ReportFormProps {
  getReport: LazyQueryExecFunction<{ report: Report }, ReportVariables>;
  loading: boolean;
}

const ReportForm = ({ getReport, loading }: ReportFormProps) => {
  const setReportDate = useSetAtom(reportDateAtom);
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      posNumber: new Date(), 
      time: "00:00",
    },
  });

  const onSubmit = (data: FormValues) => {
    try {
      const combinedDate = combineDateTime(data.posNumber, data.time);
      if (!combinedDate) {
        form.setError("time", {
                  type: "manual",
                  message: "Invalid date-time combination"
                });
                return;
      }

      getReport({
        variables: {
          posUserIds: data.posUserIds,
          posNumber: format(combinedDate, "yyyyMMddHHmm"),
        },
      });
      setReportDate(combinedDate);
    } catch (error) {
      console.error("Error processing date-time:", error);
      form.setError("root", {
              type: "manual",
              message: "An error occurred while generating the report"
            });
    }
  };

  const {
    data: userData,
    loading: loadingUsers,
    error: usersError,
  } = useQuery<{ posUsers: Customer[] }>(queries.users);

  const posUsers = userData?.posUsers || [];

  if (usersError) {
    return <div>Error loading users. Please try again later.</div>;
  }

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
                  <Input disabled placeholder="Уншиж байна..." />
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
          name="posNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block">Oгноо</FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value || new Date()}
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
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Цаг</FormLabel>
              <FormControl>
                <TimePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" size="sm" disabled={loading}>
          {!loading && <SearchIcon className="h-4 w-4 mr-1" />}
          Тайлан шүүх
        </Button>
      </form>
    </Form>
  );
};

export default ReportForm;
