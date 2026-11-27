"use client"

import { Filter, FilterSelectBar, FilterSelectView } from "@/modules/filter"
import { CalendarIcon, CircleDotIcon } from "lucide-react"

import { useMultiQueryState } from "@/lib/useQueryState"
import { Command, CommandList } from "@/components/ui/command"

import {
  COVERS_FILTER_ID,
  COVERS_FILTER_QUERY_KEYS,
  CoversFilterQueries,
} from "../hooks/useCoversVariables"
import { COVER_STATUS_OPTIONS } from "./cover-status"

const LABELS = { created: "Огнооны хүрээ", status: "Төлөв" }

const CoversFilterPopover = () => {
  const [queries] = useMultiQueryState<CoversFilterQueries>(
    COVERS_FILTER_QUERY_KEYS
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
                <Filter.Item
                  value="status"
                  label={LABELS.status}
                  active={queries.status !== null}
                >
                  <CircleDotIcon />
                  {LABELS.status}
                </Filter.Item>
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
            queryKey="status"
            options={COVER_STATUS_OPTIONS}
            placeholder={`${LABELS.status} хайх`}
          />
          <Filter.View filterKey="created">
            <Filter.DateView filterKey="created" label={LABELS.created} />
          </Filter.View>
        </Filter.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="created" inDialog>
          <Filter.DialogDateView filterKey="created" label={LABELS.created} />
        </Filter.View>
      </Filter.Dialog>
    </>
  )
}

export const CoversFilter = ({ children }: { children?: React.ReactNode }) => (
  <Filter id={COVERS_FILTER_ID}>
    <Filter.Bar>
      <CoversFilterPopover />
      <Filter.BarItem queryKey="status">
        <Filter.BarName>
          <CircleDotIcon />
          {LABELS.status}
        </Filter.BarName>
        <FilterSelectBar
          queryKey="status"
          options={COVER_STATUS_OPTIONS}
          placeholder={`${LABELS.status} хайх`}
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
