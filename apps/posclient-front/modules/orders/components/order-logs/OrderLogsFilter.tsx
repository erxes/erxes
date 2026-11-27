"use client"

import authQueries from "@/modules/auth/graphql/queries"
import {
  Filter,
  FilterOption,
  FilterSelectBar,
  FilterSelectView,
} from "@/modules/filter"
import { useQuery } from "@apollo/client"
import { CalendarIcon, LayersIcon, UserIcon } from "lucide-react"

import { useMultiQueryState } from "@/lib/useQueryState"
import { Command, CommandList, CommandSeparator } from "@/components/ui/command"

import { ORDER_LOG_SOURCES } from "./orderLogUtils"
import {
  ORDER_LOGS_FILTER_ID,
  ORDER_LOGS_FILTER_QUERY_KEYS,
  OrderLogsFilterQueries,
} from "./useOrderLogsVariables"

type PosUser = {
  _id: string
  email?: string
  firstName?: string
  lastName?: string
}

const LABELS = { source: "Эх үүсвэр", user: "Хэрэглэгч", created: "Огноо" }

const SOURCE_OPTIONS: FilterOption[] = Object.entries(ORDER_LOG_SOURCES).map(
  ([value, { label }]) => ({ value, label })
)

const useUserOptions = (): FilterOption[] => {
  const { data } = useQuery<{ posUsers: PosUser[] }>(authQueries.posUsers)
  return (data?.posUsers || []).map((user) => ({
    value: user._id,
    label:
      user.email ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user._id,
  }))
}

const OrderLogsFilterPopover = ({ users }: { users: FilterOption[] }) => {
  const [queries] = useMultiQueryState<OrderLogsFilterQueries>(
    ORDER_LOGS_FILTER_QUERY_KEYS
  )
  const hasFilters = Object.values(queries).some((value) => value !== null)

  return (
    <>
      <Filter.Popover>
        <Filter.Trigger isFiltered={hasFilters} />
        <Filter.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder="Шүүлтүүр" />
              <CommandList className="m-1 max-h-none">
                <Filter.SearchValueTrigger />
                <Filter.Item
                  value="source"
                  label={LABELS.source}
                  active={queries.source !== null}
                >
                  <LayersIcon />
                  {LABELS.source}
                </Filter.Item>
                <Filter.Item
                  value="user"
                  label={LABELS.user}
                  active={queries.user !== null}
                >
                  <UserIcon />
                  {LABELS.user}
                </Filter.Item>
                <CommandSeparator className="my-1" />
                <Filter.Item
                  value="created"
                  label={LABELS.created}
                  active={queries.created !== null}
                >
                  <CalendarIcon />
                  {LABELS.created}
                </Filter.Item>
              </CommandList>
            </Command>
          </Filter.View>
          <FilterSelectView
            queryKey="source"
            options={SOURCE_OPTIONS}
            placeholder={`${LABELS.source} хайх`}
          />
          <FilterSelectView
            queryKey="user"
            options={users}
            placeholder={`${LABELS.user} хайх`}
          />
          <Filter.View filterKey="created">
            <Filter.DateView filterKey="created" label={LABELS.created} />
          </Filter.View>
        </Filter.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView
            filterKey="searchValue"
            label="Захиалгын дугаар"
          />
        </Filter.View>
        <Filter.View filterKey="created" inDialog>
          <Filter.DialogDateView filterKey="created" label={LABELS.created} />
        </Filter.View>
      </Filter.Dialog>
    </>
  )
}

export const OrderLogsFilter = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const users = useUserOptions()

  return (
    <Filter id={ORDER_LOGS_FILTER_ID}>
      <Filter.Bar>
        <OrderLogsFilterPopover users={users} />
        <Filter.SearchValueBarItem />
        <Filter.BarItem queryKey="source">
          <Filter.BarName>
            <LayersIcon />
            {LABELS.source}
          </Filter.BarName>
          <FilterSelectBar
            queryKey="source"
            options={SOURCE_OPTIONS}
            placeholder={`${LABELS.source} хайх`}
          />
        </Filter.BarItem>
        <Filter.BarItem queryKey="user">
          <Filter.BarName>
            <UserIcon />
            {LABELS.user}
          </Filter.BarName>
          <FilterSelectBar
            queryKey="user"
            options={users}
            placeholder={`${LABELS.user} хайх`}
          />
        </Filter.BarItem>
        <Filter.BarItem queryKey="created">
          <Filter.BarName>
            <CalendarIcon />
            {LABELS.created}
          </Filter.BarName>
          <Filter.Date filterKey="created" label={LABELS.created} />
        </Filter.BarItem>
        {children}
      </Filter.Bar>
    </Filter>
  )
}
