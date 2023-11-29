export const PRELIMINARY_REPORT_COLUMNS = [
  '№',
  'Ажилтаны код',
  'Овог',
  'Нэр',
  'Албан тушаал',
  'Ажиллавал зохих хоног',
  'Ажилласан хоног',
  'Тайлбар'
];
export const FINAL_REPORT_COLUMNS = [
  [[''], ['Д/Д']],
  [[''], ['Салбар']],
  [['Хүнтэй холбоотой мэдээлэл'], ['Овог нэр', 'Ажилтаны код', 'Албан тушаал']],
  [[''], ['Ажилвал зохих цаг']],
  [[''], ['Ажилласан цаг ']],
  [['Хүсэлт'], ['Ээлжийн амралт', 'Чөлөөтэй цаг', 'Өвчтэй']],
  [[''], ['Ажлаас гарсан, дикрит авсан ']],
  [['Нэмэгдэл'], ['Цалинтай', 'Захирал нэрэмжит']],
  [
    ['Суутгал'],
    [
      'Бүртгэл дутуу',
      'Б/Д мөнгө',
      'Үр дүн хасалт',
      'Хоцорсон миниут',
      'Хоцролтын мөнгө',
      'Үр дүн хасалт',
      'Суутгал нэгдсэн'
    ]
  ],

  [[''], ['Тайлбар']]
];

export const PIVOT_REPORT_COLUMNS = [
  [
    ['Хүнтэй холбоотой мэдээлэл'],
    ['№', 'Ажилтаны код', 'Овог', 'Нэр', 'Албан тушаал']
  ],
  [['Хугацаа'], ['Өдөр']],
  [['Төлөвлөгөө'], ['Эхлэх', 'Дуусах', 'Нийт төлөвлөсөн']],
  [
    ['Performance'],
    [
      'Check In',
      'In Device',
      'Check Out',
      'Out Device',
      'Байршил',
      'Нийт ажилласан',
      'Илүү цаг',
      'Шөнийн цаг',
      'Хоцролт'
    ]
  ]
];

export const TIMECLOCK_EXPORT_COLUMNS = [
  [[''], ['Д/Д']],
  [[''], ['Овог нэр']],
  [[''], ['Ажилтаны код']]
];

export const SALARY_FIELDS = [
  'employeeId',
  'totalWorkHours',
  'totalWorkedHours',
  'mainSalary',
  'adequateSalary',
  'kpi',
  'onAddition',
  'bonus',
  'vacation',
  'addition',
  'totalAddition',
  'lateHoursDeduction',
  'resultDeduction',
  'totalDeduction',
  'totalSalary',
  'preliminarySalary',
  'kpiDeduction',
  'onDeduction',
  'bonusDeduction',
  'vacationDeduction',
  'ndsh',
  'hhoat',
  'mainDeduction',
  'salaryOnHand',
  'receivable',
  'biSan',
  'toSendBank'
];
