export const MINERAL_CATEGORIES = {
  "Силикаты": [
    "Кварц", "Аметист", "Цитрин", "Раухтопаз", "Халцедон", "Агат", "Яшма", "Сердолик", "Оникс", "Кремень",
    "Полевой шпат", "Ортоклаз", "Плагиоклаз", "Альбит", "Анортит", "Микроклин", "Лунный камень", "Амазонит", "Лабрадор",
    "Слюда", "Мусковит", "Биотит", "Флогопит", "Лепидолит",
    "Оливин", "Хризолит",
    "Пироксен", "Авгит", "Диопсид", "Энстатит", "Жadeит",
    "Амфибол", "Роговая обманка", "Нефрит",
    "Гранат", "Альмандин", "Пироп", "Спессартин", "Гроссуляр", "Андрадит", "Демантоид", "Уваровит",
    "Берилл", "Изумруд", "Аквамарин", "Морганит", "Гелиодор",
    "Топаз",
    "Циркон", "Гиацинт",
    "Турмалин", "Шерл", "Эльбаит", "Арбузный турмалин",
    "Тальк",
    "Серпентин", "Хризотил",
    "Каолинит", "Монтмориллонит",
    "Эпидот", "Везувиан", "Идокрыз", "Аксинит", "Датолит", "Пренит", "Тремолит", "Актинолит"
  ],
  "Карбонаты": [
    "Кальцит", "Исландский шпат", "Доломит", "Арагонит", "Малахит", "Азурит", "Родохрозит", "Сидерит", "Волластонит"
  ],
  "Оксиды": [
    "Корунд", "Рубин", "Сапфир", "Гематит", "Магнетит", "Рутил", "Ильменит", "Шпинель", "Хромит", 
    "Касситерит", "Пиролюзит", "Лимонит", "Гётит", "Боксит", "Кварц"
  ],
  "Сульфаты": [
    "Гипс", "Селенит", "Ангидрит", "Барит", "Целестин", "Алунит", "Мирабилит"
  ],
  "Сульфиды": [
    "Пирит", "Галенит", "Сфалерит", "Халькопирит", "Борнит", "Молибденит", "Киноварь", 
    "Антимонит", "Аргентит", "Пирротин", "Марказит", "Арсенопирит"
  ],
  "Галогениды": [
    "Галит", "Флюорит", "Сильвит", "Карналлит", "Криолит"
  ],
  "Самородные элементы": [
    "Золото", "Серебро", "Медь", "Сера", "Алмаз", "Графит", "Платина", "Висмут"
  ],
  "Фосфаты": [
    "Апатит", "Бирюза", "Варисцит", "Ванадинит", "Монацит", "Ксенотим"
  ],
  "Органические и вулканические": [
    "Янтарь", "Гагат", "Опал", "Обсидиан", "Пемза"
  ],
  "Прочие": [
    "Лазурит", "Содалит", "Нефелин", "Скаполит", "Асбест"
  ]
}

// Color mapping for each category
export const CATEGORY_COLORS = {
  "Силикаты": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300", selectedBg: "bg-blue-600", selectedText: "text-white" },
  "Карбонаты": { bg: "bg-green-100", text: "text-green-800", border: "border-green-300", selectedBg: "bg-green-600", selectedText: "text-white" },
  "Оксиды": { bg: "bg-red-100", text: "text-red-800", border: "border-red-300", selectedBg: "bg-red-600", selectedText: "text-white" },
  "Сульфаты": { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300", selectedBg: "bg-yellow-600", selectedText: "text-white" },
  "Сульфиды": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300", selectedBg: "bg-purple-600", selectedText: "text-white" },
  "Галогениды": { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-300", selectedBg: "bg-pink-600", selectedText: "text-white" },
  "Самородные элементы": { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300", selectedBg: "bg-amber-600", selectedText: "text-white" },
  "Фосфаты": { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-300", selectedBg: "bg-teal-600", selectedText: "text-white" },
  "Органические и вулканические": { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300", selectedBg: "bg-orange-600", selectedText: "text-white" },
  "Прочие": { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300", selectedBg: "bg-gray-600", selectedText: "text-white" }
}

// Helper function to get category for a mineral
export function getMineralCategory(mineralName) {
  for (const [category, minerals] of Object.entries(MINERAL_CATEGORIES)) {
    if (minerals.includes(mineralName)) {
      return category
    }
  }
  return "Прочие"
}

// Flatten all minerals for search
export const ALL_MINERALS = Object.entries(MINERAL_CATEGORIES).flatMap(([category, minerals]) =>
  minerals.map(mineral => ({ name: mineral, category }))
)

// Remove duplicates
export const UNIQUE_MINERALS = [...new Map(ALL_MINERALS.map(m => [m.name, m])).values()]
  .sort((a, b) => a.name.localeCompare(b.name, 'ru'))