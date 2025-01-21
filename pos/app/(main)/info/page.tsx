'use client'

import { useState } from 'react'
import Image from 'next/image'
import { StaticImageData } from 'next/image'
import DOMPurify from 'dompurify'
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
          <ul class="list-disc pl-5 space-y-2 mt-2">
            <li>Захиалах нь гал тогоо руу явах үнийн дүнгийн баримт байх</li>
            <li>Түр баримт нь үйлчлүүлэгчид очих нөатгүй үнийн дүнтэй баримт байна</li>
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
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic>(helpTopics[0])
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const sanitizeDescription = (description: string) => {
    return DOMPurify.sanitize(description)
  }

  return (
    <div className="bg-gradient-to-br  min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-indigo-900 mb-8">Help Center</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <button 
            className="lg:hidden bg-indigo-600 text-white px-4 py-2 rounded-md mb-4"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}  
            aria-controls="help-topics-menu"
          >
            {isMenuOpen ? 'Close Menu' : 'Open Menu'}
          </button>

          <nav className={`lg:w-1/3 ${isMenuOpen ? 'block' : 'hidden'} lg:block`}  
              aria-label="Help topics navigation" >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ul id="help-topics-menu" className="space-y-2" role="menu">  
                {helpTopics.map((topic) => (
                  <li key={topic.id}>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200 ${
                        selectedTopic.id === topic.id
                          ? 'bg-indigo-100 text-indigo-900'
                          : 'hover:bg-indigo-50 text-gray-700 hover:text-indigo-900'
                      }`}
                      onClick={() => {
                        setSelectedTopic(topic)
                        setIsMenuOpen(false)
                      }}
                    >
                      {topic.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
          <main className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-indigo-900 mb-4">{selectedTopic.title}</h2>
              <div className="mb-6">
                <Image
                  src={selectedTopic.image || "/placeholder.svg"}
                  alt={selectedTopic.title}
                  width={1384}
                  height={477}
                  className="w-full h-auto rounded-lg shadow-md"
                  onError={(e) => {  
                    const target = e.target as HTMLImageElement;  
                    target.src = "/placeholder.svg";  
                  }}  
                />
              </div>
              <div 
                className="prose prose-indigo max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeDescription(selectedTopic.description) }}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
