"use client"

import { useState } from "react"
import Select from "react-select"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { useUsers } from "../hooks/useUsers"

const SelectUsers = ({
  form,
  userIds,
  onChange,
}: {
  form: any
  onChange: (userIds: string[]) => void
  userIds: string[]
}) => {
  const [reload, setReload] = useState(false)

  const [searchValue, setSearchValue] = useState("")

  const { userOptions, loading } = useUsers({ userIds, reload, searchValue })

  const onChangeMultiValue = (datas: any) => {
    const ids = datas.map((data: any) => data.value)

    onChange(ids)
  }

  return (
    <>
      <FormField
        control={form.control}
        name="userIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select users</FormLabel>
            <FormControl>
              {loading && !reload && !searchValue ? (
                <Input disabled={true} placeholder="Loading..." />
              ) : (
                <Select
                  onMenuClose={() => setReload(false)}
                  onMenuOpen={() => setReload(true)}
                  isMulti={true}
                  options={userOptions}
                  defaultValue={userOptions?.filter((userOption) =>
                    userIds?.includes(userOption?.value)
                  )}
                  placeholder="Select users"
                  isSearchable={true}
                  onInputChange={setSearchValue}
                  onChange={(data) => {
                    onChangeMultiValue(data)
                    field.onChange(data)
                  }}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}

export default SelectUsers
