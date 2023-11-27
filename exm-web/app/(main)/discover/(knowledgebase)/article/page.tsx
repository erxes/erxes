import dynamic from "next/dynamic"

const ArticleDetail = dynamic(
  () =>
    import("@/modules/discover/components/knowledgebase/article/ArticleDetail")
)

export default function IndexPage() {
  return <ArticleDetail />
}
