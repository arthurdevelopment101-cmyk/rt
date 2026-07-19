import { Product, Review } from "./types";

export const CATEGORIES = [
  { id: "all", name: "كل المجموعات / All" },
  { id: "sheets", name: "ألواح إستانلس / Sheets" },
  { id: "pipes", name: "مواسير وأنابيب / Pipes & Tubes" },
  { id: "fittings", name: "إكسسوارات ووصلات / Fittings" },
  { id: "bars", name: "خوص وزوايا وأعمدة / Bars & Angles" },
  { id: "valves", name: "محابس وفلانشات / Valves & Flanges" }
];

export const PRODUCTS: Product[] = [
  {
    id: "ss-304-sheet-mirror",
    name: "لوح إستانلس ستيل 304 ميرور (مرآة)",
    categoryName: "ألواح إستانلس / Sheets",
    categoryId: "sheets",
    price: 4500,
    image: "images/sculpted-aurelian-ring.jpg",
    secondaryImages: [
      "images/sculpted-aurelian-ring.jpg",
      "images/sculpted-aurelian-ring-2.jpg"
    ],
    tagline: "\"بريق المرآة العاكس مع أعلى مقاومة للصدأ والتآكل للديكورات الراقية.\"",
    description: "لوح إستانلس ستيل درجة 304 بسطح مصقول فائق اللمعان كالمرايا (Mirror Gold/Silver). مناسب جداً لأعمال الديكور الداخلي، تكسية المصاعد، واللافتات الفاخرة التي تتطلب حماية تامة ومظهرًا جماليًا يدوم طويلاً.",
    materialOptions: ["#E5D5BC", "#E5E4E2", "#B76E79"], // Gold, Silver, Rose Gold
    sizeOptions: ["1.0mm x 1220 x 2440", "1.5mm x 1220 x 2440", "2.0mm x 1220 x 2440"],
    details: [
      "درجة المعدن: Stainless Steel 304 ASTM",
      "المنشأ: مستورد عالي الجودة (فنلندي/تايواني)",
      "الحماية: مغطى بطبقة ليزر واقية مزدوجة لمنع الخدوش أثناء القص والتشكيل",
      "الاستخدامات: تشطيبات الديكور، المصاعد، الواجهات الحديثة"
    ],
    craftsmanship: "يتم فحص كل لوح بدقة للتأكد من خلوه من أي تموجات أو عيوب سطحية، مع تغليفه بطبقة حماية سميكة للحفاظ على لمعان المرآة الفاخر حتى نهاية التركيب."
  },
  {
    id: "ss-316-sheet-industrial",
    name: "لوح إستانلس ستيل 316 صناعي (مات)",
    categoryName: "ألواح إستانلس / Sheets",
    categoryId: "sheets",
    price: 6200,
    image: "images/eternal-bangle.jpg",
    secondaryImages: [
      "images/eternal-bangle.jpg"
    ],
    tagline: "\"الخيار الأمثل للصناعات الغذائية والكيميائية بفضل مقاومته الفائقة للأحماض.\"",
    description: "لوح إستانلس ستيل عالي الجودة درجة 316 المقاوم للتآكل في البيئات القاسية والكلوريدات. يتميز بالمتانة العالية والعمر الافتراضي الطويل تحت الضغط ودرجات الحرارة المرتفعة.",
    materialOptions: ["#E5E4E2"], // Silver
    sizeOptions: ["2.0mm x 1220 x 2440", "3.0mm x 1220 x 2440", "4.0mm x 1220 x 2440", "5.0mm x 1500 x 3000"],
    details: [
      "درجة المعدن: SS 316 / 316L ذو محتوى منخفض الكربون",
      "مقاومة كيميائية متفوقة للملوحة والمواد الحمضية",
      "السطح: مطلي مات (صناعي 2B / No.1)",
      "متطابق مع معايير الجودة العالمية ومعايير الصناعات الغذائية"
    ]
  },
  {
    id: "ss-pipe-seamless-304",
    name: "ماسورة إستانلس ستيل 304 غير ملحومة (Seamless)",
    categoryName: "مواسير وأنابيب / Pipes & Tubes",
    categoryId: "pipes",
    price: 1850,
    image: "images/heritage-watch-4.jpg",
    secondaryImages: [
      "images/heritage-watch-4.jpg"
    ],
    tagline: "\"مواسير سيملس مصممة لتحمل الضغوط العالية ودرجات الحرارة القصوى.\"",
    description: "مواسير إستانلس ستيل درجة 304 غير ملحومة، مثالية لخطوط البخار والمياه والغازات في المصانع وخطوط الإنتاج. توفر أماناً كاملاً ضد التسريب وضغط التشغيل المرتفع.",
    materialOptions: ["#E5E4E2"],
    sizeOptions: ["1\" Schedule 40", "1.5\" Schedule 40", "2\" Schedule 40", "3\" Schedule 40"],
    details: [
      "القطر الخارجي والسمك مطلي طبقاً لمعيار ANSI/ASME B36.19",
      "المنشأ: اليابان / كوريا مع شهادات التحليل الكيميائي",
      "مقاومة عالية للضغط الهيدروليكي والحراري",
      "سهلة اللحام والتشكيل"
    ]
  },
  {
    id: "ss-pipe-decorative-gold",
    name: "ماسورة إستانلس ستيل ديكور ذهبي لامع",
    categoryName: "مواسير وأنابيب / Pipes & Tubes",
    categoryId: "pipes",
    price: 950,
    image: "images/geometric-aura.jpg",
    secondaryImages: [
      "images/geometric-aura.jpg"
    ],
    tagline: "\"اللمسة الديكورية الذهبية التي تجمع بين صلابة الفولاذ وفخامة المظهر.\"",
    description: "مواسير ديكور إستانلس ستيل درجة 304 مغطاة بطبقة PVD ذهبية لامعة ثابتة ومقاومة للتقشير أو البهتان. ممتازة لأعمال الترابزينات، الفواصل الجدارية (Partition)، والدرابزينات الفاخرة.",
    materialOptions: ["#E5D5BC", "#B76E79", "#E5E4E2"], // Gold, Rose Gold, Silver
    sizeOptions: ["DN 25 (1 inch)", "DN 38 (1.5 inch)", "DN 50 (2 inch)"],
    details: [
      "الخامة: إستانلس ستيل 304 نقي مع طلاء PVD حراري متطور",
      "طول الماسورة القياسي: 6 أمتار (ويمكن توريد أطوال مخصصة)",
      "السطح: لمعان كامل براق يدوم لسنوات دون بهتان",
      "مقاومة ممتازة للخدوش وبصمات الأصابع"
    ]
  },
  {
    id: "ss-elbow-90-degree",
    name: "كوع إستانلس ستيل 90 درجة لحام",
    categoryName: "إكسسوارات ووصلات / Fittings",
    categoryId: "fittings",
    price: 180,
    image: "images/desert-moon-hoops.jpg",
    secondaryImages: [
      "images/desert-moon-hoops.jpg"
    ],
    tagline: "\"كوع متين ومقاوم للتآكل لضمان التدفق السلس والانسيابي.\"",
    description: "كوع إستانلس ستيل لحام درجة 304 / 316 بزاوية 90 درجة وسماكة ممتازة لتحمل خطوط التوصيل ومطابقة لمقاييس التوريد الفنية والتحمل في المصانع.",
    materialOptions: ["#E5E4E2"],
    sizeOptions: ["1.5 inch", "2 inch", "3 inch", "4 inch"],
    details: [
      "نوع الوصلة: Butt-weld لحام رأس برأس",
      "الخامة: SS 304 / 304L / 316L",
      "السطح الداخلي ناعم جداً لمنع تراكم الرواسب أو التآكل الاحتكاكي",
      "مطابق للمواصفات القياسية ASTM A403"
    ]
  },
  {
    id: "ss-flat-bar-profile",
    name: "خوص وزوايا إستانلس ستيل مقصوصة ومسحوبة",
    categoryName: "خوص وزوايا وأعمدة / Bars & Angles",
    categoryId: "bars",
    price: 450,
    image: "images/artisan-watch-roll.jpg",
    secondaryImages: [
      "images/artisan-watch-roll.jpg"
    ],
    tagline: "\"خوص وزوايا إستانلس ستيل بدقة عالية تناسب الهياكل والمشغولات المعدنية.\"",
    description: "خوص وزوايا حديدية مقاومة للصدأ إستانلس ستيل 304 مدرفلة على الساخن أو مسحوبة على البارد بأسطح مستوية وزوايا قائمة تماماً. الخيار المثالي للهياكل الإنشائية وأعمال الحدادة الراقية والشبابيك والأسوار.",
    materialOptions: ["#E5E4E2"],
    sizeOptions: ["20mm x 3mm", "30mm x 3mm", "40mm x 4mm", "50mm x 5mm"],
    details: [
      "الخامة الأساسية: 304 عالية النقاء ومقاومة للرطوبة والعوامل الجوية",
      "أطوال قياسية: 6 أمتار للعود الواحد",
      "متوفرة بأسطح مطفية (مات) أو مصقولة",
      "تسامح أبعاد صارم لضمان دقة التركيب والتفصيل"
    ]
  },
  {
    id: "ss-ball-valve-316",
    name: "محبس كورة إستانلس ستيل 316 قطعتين",
    categoryName: "محابس وفلانشات / Valves & Flanges",
    categoryId: "valves",
    price: 1250,
    image: "images/baguette-solitaire.jpg",
    secondaryImages: [
      "images/baguette-solitaire.jpg"
    ],
    isNew: true,
    tagline: "\"تحكم كامل وموثوق في تدفق السوائل بقلب صلب مقاوم للأحماض.\"",
    description: "محبس كروي من الفولاذ المقاوم للصدأ درجة 316 بقرص من الستيل الصلب وجلبة تفلون مانعة للتسريب. يتحمل الضغوط العالية والمواد البترولية والمياه شديدة الملوحة.",
    materialOptions: ["#E5E4E2"],
    sizeOptions: ["1/2 inch", "3/4 inch", "1 inch", "1.5 inch", "2 inch"],
    details: [
      "تصميم من قطعتين (Two-Piece Body Design)",
      "جسم المحبس مصنوع بالكامل من الستانلس ستيل المسبوك بدقة 316 CF8M",
      "مقبض مغطى بالفينيل العازل لتسهيل الفتح والغلق اليدوي المريح",
      "ضغط التشغيل: حتى 1000 WOG (مياه، زيت، غاز)"
    ]
  },
  {
    id: "ss-decorative-strip-t",
    name: "شرائح حرف T إستانلس ستيل ديكور جدران",
    categoryName: "إكسسوارات ووصلات / Fittings",
    categoryId: "fittings",
    price: 250,
    image: "images/v-signature-bracelet.jpg",
    secondaryImages: [
      "images/v-signature-bracelet.jpg"
    ],
    isNew: true,
    tagline: "\"الشرائح العصرية لتزيين الفواصل الجدارية وبلاط السيراميك والبورسلين.\"",
    description: "شرائح إستانلس ستيل على شكل حرف T بألوان ذهبية وفضية ونحاسية مصقولة بعناية فائقة. تستخدم كفواصل أنيقة بين بلاطات السيراميك، الأخشاب، أو بدائل الرخام لتضفي لمسة عصرية وفخامة استثنائية.",
    materialOptions: ["#E5D5BC", "#E5E4E2", "#B76E79", "#5F5E5B"], // Gold, Silver, Rose Gold, Bronze
    sizeOptions: ["Width: 10mm", "Width: 15mm", "Width: 20mm"],
    details: [
      "سمك الخامة: 0.8mm إلى 1.2mm",
      "الخامة: إستانلس ستيل 304 مقاوم تمامًا للرطوبة والماء والمنظفات",
      "طول الشريحة: 2.44 متر و 3.0 متر",
      "تركيب سهل وسريع باستخدام السيليكون أو الغراء المخصص"
    ]
  }
];

export const STORIES = [
  {
    title: "فلسفة الجودة والصلابة / Steel Quality",
    quote: "منتجاتنا وخاماتنا ليست مجرد معادن، بل هي الأساس المتين لمشروعاتكم وصناعاتكم. نحن نختار درجات الستانلس ستيل (304، 316) بدقة لضمان أعلى درجات المتانة ومقاومة الصدأ ومقاومة الأحماض والتآكل.",
    image: "images/story-luxury.jpg"
  },
  {
    title: "دقة الأبعاد والقص / Engineering Precision",
    quote: "في فيرو، نؤمن بأن المليمتر الواحد يصنع فارقاً كبيراً في التجهيزات الهندسية والديكورية. نعتمد على تكنولوجيا الليزر الحديثة والمقصات والمكابس المبرمجة لتسليم خامات ومواسير خالية من أي انحرافات هندسية.",
    image: "images/sculpted-aurelian-ring-4.jpg"
  },
  {
    title: "شركاء النجاح الصناعي / Dynamic Partners",
    quote: "نسعى دائمًا لأن نكون الشريك الموثوق لجميع الورش، المصانع، والمصممين من خلال توفير الإمدادات بصفة مستمرة، ومزامنة كتالوج المنتجات بشكل حي وفعال مع تيسير عمليات الطلب والتوزيع بأسعار عادلة وتنافسية.",
    image: "images/story-eco.jpg"
  }
];

export const REVIEWS: Review[] = [
  {
    id: "rev-1",
    author: "المهندس كريم محمود",
    rating: 5,
    date: "July 12, 2026",
    comment: "ألواح الإستانلس الـ 304 ميرور الذهبي خامتها ممتازة والدرجة مظبوطة تماماً ولا يوجد بها أي تموجات أو خدوش. طبقة الليزر الحامية ممتازة جداً أثناء الشغل."
  },
  {
    id: "rev-2",
    author: "أبو أحمد لأعمال الديكور والستانلس",
    rating: 5,
    date: "June 28, 2026",
    comment: "مواسير الديكور الذهبي ممتازة في اللحام والتشكيل، ولمعان طلاء الـ PVD عالي الجودة والزبائن معجبة جداً بالتشطيب النهائي للدرابزينات."
  }
];
