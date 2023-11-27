import dynamic from "next/dynamic"

const CategoryDetail = dynamic(
  () =>
    import(
      "@/modules/discover/components/knowledgebase/category/CategoryDetail"
    )
)

export default function IndexPage() {
  return <CategoryDetail />
}
