"use client"

import { Suspense } from "react"

import { CoverRecord } from "../components/cover-record"

const CoverDetailPage = () => (
  <Suspense fallback={null}>
    <CoverRecord mode="page" />
  </Suspense>
)

export default CoverDetailPage
