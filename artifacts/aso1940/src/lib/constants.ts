export const ASSOCIATION_TYPES: Record<string, string> = {
  charity: "خيرية",
  sports: "رياضية",
  cultural: "ثقافية",
  scientific: "علمية",
  professional: "مهنية",
  women: "نسوية",
  youth: "شبابية",
  environmental: "بيئية",
  educational: "تعليمية",
  health: "صحية",
  social: "اجتماعية",
  religious: "دينية",
  arts: "فنية",
  humanitarian: "إنسانية",
  development: "تنموية",
  consumer: "استهلاكية",
  rural: "فلاحية",
  fishing: "صيد بحري",
  handicraft: "حرف يدوية",
  tourism: "سياحية",
  digital: "رقمية",
  media: "إعلامية",
  legal: "قانونية",
  financial: "مالية",
  engineering: "هندسية",
  medical: "طبية",
  teachers: "تعليم",
  parents: "أولياء الأمور",
  disabled: "ذوي الاحتياجات",
  elderly: "المسنين",
  other: "أخرى",
};

export const ASSOCIATION_STATUSES: Record<string, string> = {
  establishment: "تأسيس",
  renewal: "تجديد",
  suspension: "توقيف",
  warning: "إنذار",
  dissolution: "حل",
  active: "نشط",
  inactive: "غير نشط",
};

export const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  renewal: "bg-purple-100 text-purple-800 border-purple-200",
  establishment: "bg-blue-100 text-blue-800 border-blue-200",
  suspension: "bg-red-100 text-red-800 border-red-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  dissolution: "bg-gray-100 text-gray-800 border-gray-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
};

export const MEMBER_POSITIONS: Record<string, string> = {
  president: "رئيس",
  vice_president: "نائب الرئيس",
  assistant1: "مساعد 1",
  secretary: "أمين السر",
  vice_secretary: "نائب أمين السر",
  treasurer: "أمين المال",
  vice_treasurer: "نائب أمين المال",
  assistant2: "مساعد 2",
  assistant3: "مساعد 3",
  assistant4: "مساعد 4",
  member: "عضو",
  other: "أخرى",
};

export const MEMBERSHIP_TYPES: Record<string, string> = {
  executive: "منفذ",
  founder: "مؤسس",
  regular: "عادي",
};

export const MEMBER_STATUSES: Record<string, string> = {
  active: "نشط",
  frozen: "مجمد",
  resigned: "مستقيل",
  deceased: "متوفى",
  other: "أخرى",
};

export const RECEIPT_TYPES: Record<string, string> = {
  establishment: "تأسيس",
  registration: "تسجيل",
  annual_report: "تقرير سنوي",
  modification: "تعديل",
  dissolution: "حل",
};

export const WILAYAS = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة",
  "بشار", "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت",
  "تيزي وزو", "الجزائر", "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة",
  "سيدي بلعباس", "عنابة", "قالمة", "قسنطينة", "المدية", "مستغانم", "المسيلة",
  "معسكر", "ورقلة", "وهران", "البيض", "إليزي", "برج بوعريريج", "بومرداس",
  "الطارف", "تندوف", "تيسمسيلت", "الوادي", "خنشلة", "سوق أهراس",
  "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت", "غرداية",
  "غليزان", "تيميمون", "برج باجي مختار", "أولاد جلال", "بني عباس",
  "عين صالح", "عين قزام", "توقرت", "جانت", "المغير", "المنيعة",
];

export const GENDERS: Record<string, string> = {
  male: "ذكر",
  female: "أنثى",
};
