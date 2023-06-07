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
  [
    ['Хүнтэй холбоотой мэдээлэл'],
    ['№', 'Ажилтаны код', 'Албан тушаал', 'Овог', 'Нэр']
  ],

  [['Хуанлийн өдөр'], ['Амралтын өдөр']],

  [['Ажиллах ёстой цаг'], ['Хоног', 'Цаг']],

  [
    ['Цалин бодох мэдээлэл'],
    ['Ажилласан хоног', 'Ажилласан цаг', 'Гадуур ажилласан цаг', 'Илүү цаг']
  ],

  [['Хоцролт'], ['Минут']]
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
