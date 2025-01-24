'use client'

import { useState } from 'react'
import Image from 'next/image'
import { StaticImageData } from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import zahialga from "./images/zahialga.png"
import cursor from "./images/cursor.png"
import zaal from "./images/zaal.png"
import payment from "./images/payment.png"
import menu from "./images/menu.png"
import settings from "./images/settings.png"
import order from "./images/order.png"

type HelpTopic = {
  id: number
  title: string
  description: string
  image: StaticImageData 
}

const helpTopics: HelpTopic[] = [
  {
    id: 1,
    title: "Захиалах товч",
    description: `Захиалах товч дээр дарснаар
    гал тогоо руу явуулах үнэ бичигдээгүй баримт хэвлэгдэн гарч ирнэ.`,
    image: zahialga
  },
  {
    id: 2,
    title: "Захиалах товчны хажуу сум",
    description: `Захиалах товчны хажуу сум дээр байрлах сум дээр дарснаар хоёр сонголт гарч ирэх ба:
          <ul style="margin-left: 20px; list-style-type:disc">
            <li style="margin-left: 20px; "> Захиалах нь гал тогоо руу явах үнийн дүнгийн баримт байх</li>
            <li style="margin-left: 20px;"> Түр баримт нь үйлчлүүлэгчид очих нөатгүй үнийн дүнтэй баримт байна</li>
          </ul>`,
    image: cursor
  },
  {
    id: 3,
    title: "Зааланд товч",
    description: "Зааланд гэх товч дээр даран захиалгын төлөвийг өөрчлөх боломжтой",
    image: zaal
  },
  {
    id: 4,
    title: "Төлбөр  төлөх товч",
    description: "Төлбөр төлөх товч дээр дарснаар төлбөрийн хэрэгсэл сонгон баримт хэвлэж захиалгын үйлдлийг бүрэн гүйцэт дуусгах ёстой.",
    image: payment
  },
  {
    id: 5,
    title: "Төлбөр  төлөх  хажуу товч",
    description: "Төлбөр төлөхийн хажуу дахь тохиргооны товч дээр дарснаар хүргэлтийн тохиргоо хийх боломжтойгоос гадна. Гал тогоо руу орсон захиалгад цуцлалт хийх боломжтой. Зөвхөн захиалга товч дээр дарж хэвлэгдсэн захиалгад цуцлах товч гарч ирнэ.",
    image: menu
  },
  {
    id: 6,
    title: "Гал тогоо руу оруулах захиалга дан сүүлд нэмэгдсэн захиалга гарч ирэх.",
    description: "Зүүн гар талын дээд булан дахь гурван зураас мэню хэсэг  дээрх Тохиргоо хэсэг дээр дарж Зөвхөн шинэ бүтээгдэхүүн хэвлэх хэсгийг сонгосноор хуучин гал тогоо руу орсон захиалга дахин хэвлэгдэхгүй нэмэлт захиалга хэвлэгдээд явна.",
    image: settings
  },
  {
    id: 7,
    title: "Гал тогоо руу зөвхөн хоолны захиалга бэлтгэн оруулах.",
    description: "Бэлтгэх ангиллууд хэсгээс зөвхөн Хоолыг сонгосноор гал тогоо руу орох захиалгад уух зүйл гарахгүй байх боломжтой.",
    image: order
  }
]

export default function HelpCenter() {
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">Help Center</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-2xl">Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh]">
              {helpTopics.map((topic) => (
                <Button
                  key={topic.id}
                  variant={selectedTopic?.id === topic.id ? "default" : "ghost"}
                  className="w-full justify-start mb-2 text-lg"
                  onClick={() => setSelectedTopic(topic)}
                >
                  {topic.title}
                </Button>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardContent>
            {selectedTopic ? (
              <div className="space-y-4">
                <Image 
                  src={selectedTopic.image}
                  alt={selectedTopic.title}
                  width={1384}
                  height={477}
                  className="w-full object-cover h-auto rounded-lg"
                />
                <div 
                  className="text-lg text-gray-500"
                  dangerouslySetInnerHTML={{ __html: selectedTopic.description }}
                />
              </div>
            ) : (
              <CardDescription className="text-sm">Click on a topic to view more information.</CardDescription>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

