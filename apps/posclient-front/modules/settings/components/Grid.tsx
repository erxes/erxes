"use client"

import { configAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"
import { DownloadCloudIcon, ExternalLinkIcon, SendIcon } from "lucide-react"

import DeleteOrders from "../DeleteOrders"
import FetchRemainders from "../FetchRemainders"
import SendData from "../SendData"
import SyncConfig from "../SyncConfig"
import SyncOrders from "../SyncOrders"
import ErxesLink from "./ErxesLink"
import { SettingsRow, SettingsSection } from "./SettingsSection"

const Action = ({ children }: { children: React.ReactNode }) => (
  <div className="w-32 [&_button]:h-7 [&_a]:h-7 [&_button]:text-xs [&_a]:text-xs">
    {children}
  </div>
)

const Grid = () => {
  const { branchId, departmentId, ebarimtConfig, saveRemainder } =
    useAtomValue(configAtom) || {}
  const hasWarehouse = !!branchId && !!departmentId

  return (
    <>
      <SettingsSection
        title="erxes-ээс татах"
        description="erxes дээр өөрчилсөн мэдээллийг энэ касс руу шинэчилнэ"
        icon={DownloadCloudIcon}
      >
        <SettingsRow
          title="ПОС тохиргоо"
          description="Кассын тохиргоо, төлбөрийн төрлүүд"
          control={
            <Action>
              <SyncConfig configType="config">Тохиргоо татах</SyncConfig>
            </Action>
          }
        />
        <SettingsRow
          title="Бараа"
          description="Бараа, ангилал, үнэ"
          control={
            <Action>
              <SyncConfig configType="products">Бараа татах</SyncConfig>
            </Action>
          }
        />
        <SettingsRow
          title="Ширээ"
          description="Ширээ, байрлал"
          control={
            <Action>
              <SyncConfig configType="slots">Ширээ татах</SyncConfig>
            </Action>
          }
        />
        {saveRemainder && (
          <SettingsRow
            title="Үлдэгдэл"
            description="Агуулахын барааны үлдэгдэл"
            control={
              <Action>
                <FetchRemainders />
              </Action>
            }
          />
        )}
      </SettingsSection>

      <SettingsSection
        title="Захиалга"
        description="Энэ кассын захиалгыг erxes болон И-баримт руу илгээнэ"
        icon={SendIcon}
      >
        <SettingsRow
          title="erxes руу илгээх"
          description="Илгээгдээгүй захиалгуудыг erxes руу илгээнэ"
          control={
            <Action>
              <SyncOrders />
            </Action>
          }
        />
        {!!ebarimtConfig && (
          <SettingsRow
            title="И-баримт"
            description="Хадгалагдсан баримтуудыг И-баримт руу илгээнэ"
            control={
              <Action>
                <SendData />
              </Action>
            }
          />
        )}
        <SettingsRow
          title="Захиалга цэвэрлэх"
          description="Энэ касс дээрх захиалгуудыг цэвэрлэнэ"
          control={
            <Action>
              <DeleteOrders />
            </Action>
          }
        />
      </SettingsSection>

      {hasWarehouse && (
        <SettingsSection
          title="erxes дээр нээх"
          description="Энэ салбар, хэлтсийн агуулахын мэдээлэл шинэ цонхонд"
          icon={ExternalLinkIcon}
        >
          <SettingsRow
            title="Safe Remainder"
            control={
              <Action>
                <ErxesLink
                  href={`/inventories/safe-remainders?branchId=${branchId}&departmentId=${departmentId}`}
                >
                  Нээх
                </ErxesLink>
              </Action>
            }
          />
          <SettingsRow
            title="Live Remainder"
            control={
              <Action>
                <ErxesLink
                  href={`/inventories/remainders?branchId=${branchId}&departmentId=${departmentId}`}
                >
                  Нээх
                </ErxesLink>
              </Action>
            }
          />
          <SettingsRow
            title="Performances"
            control={
              <Action>
                <ErxesLink
                  href={`/processes/performanceList?inBranchId=${branchId}&inDepartmentId=${departmentId}&outBranchId=${branchId}&outDepartmentId=${departmentId}`}
                >
                  Нээх
                </ErxesLink>
              </Action>
            }
          />
        </SettingsSection>
      )}
    </>
  )
}

export default Grid
