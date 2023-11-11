"use client"

import dynamic from "next/dynamic"
import RightNavbar from "@/modules/navbar/component/RightNavbar"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const List = dynamic(() => import("@/modules/team-member/component/List"))
const Company = dynamic(() => import("@/modules/company/component/Company"))

const Feed = () => {
  const style =
    "text-[#A1A1A1] data-[state=active]:text-primary data-[state=active]:border-[#5629B6] data-[state=active]:border-b-2 h-16 hover:font-medium hover:text-[#A1A1A1]"

  return (
    <div className="w-5/6 shrink-0">
      <Tabs defaultValue="teamMembers">
        <TabsList className="border-b border-[#eee]">
          <div className="flex justify-between">
            <div className="w-[50%] items-center flex mr-auto h-[2.5rem] my-3 ml-[25px]">
              <TabsTrigger className={style} value="teamMembers">
                Team members
              </TabsTrigger>
              <TabsTrigger className={style} value="structure">
                Structure
              </TabsTrigger>
              <TabsTrigger className={style} value="company">
                Company
              </TabsTrigger>
            </div>
            <RightNavbar />
          </div>
        </TabsList>

        <TabsContent value={"teamMembers"} className="bg-[#F8F9FA]">
          <List />
        </TabsContent>
        <TabsContent
          value={"structure"}
          className="bg-[#F8F9FA] h-[calc(100vh-70px)] p-6 overflow-auto"
        >
          <Company type="structure" />
        </TabsContent>
        <TabsContent
          value={"company"}
          className="bg-[#F8F9FA] h-[calc(100vh-70px)] p-6 overflow-auto"
        >
          <Company type="vision" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Feed
