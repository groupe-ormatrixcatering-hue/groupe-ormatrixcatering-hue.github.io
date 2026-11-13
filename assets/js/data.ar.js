(function () {
  'use strict';

  var OM = window.OM = window.OM || {};

  // Photos: [file, category, alt]
  OM.PHOTOS = [
    [
      "p-oeuf-poche-epinards",
      "plats",
      "ستيك لحم مفروم وبيض مسلوق وغراتان السبانخ"
    ],
    [
      "salle-reception",
      "buffet",
      "قاعة استقبال مجهّزة"
    ],
    [
      "p-salle-table-dressee",
      "buffet",
      "مائدة مجهّزة: مقبّلات وفواكه وخبز ومشروبات"
    ],
    [
      "p-entree-saumon-avocat",
      "douceurs",
      "مقبّلات: تارتار الأفوكادو والسلمون وليمون مشوي"
    ],
    [
      "p-salade-poulet-croustillant",
      "douceurs",
      "سلطة دجاج مقرمش"
    ],
    [
      "p-table-deux-baie-vitree",
      "buffet",
      "مائدة لشخصين بجانب الواجهة الزجاجية"
    ],
    [
      "p-salle-restaurant",
      "buffet",
      "قاعة مطعم: طاولات مجهّزة"
    ],
    [
      "p-couscous-terre-cuite",
      "plats",
      "كسكس بلحم الخروف والدجاج"
    ],
    [
      "p-lunch-box-cartons",
      "lunch",
      "علبة غداء كرتونية"
    ],
    [
      "p-agneau-braise-riz",
      "plats",
      "لحم خروف مطهو ببطء مع الأرز والخضر"
    ],
    [
      "p-corbeilles-fruits",
      "douceurs",
      "سلال فواكه طازجة"
    ],
    [
      "p-poulet-roti-puree",
      "plats",
      "دجاج مشوي مع هريس البطاطس والأرز"
    ],
    [
      "p-barquettes-agneau-riz",
      "lunch",
      "صواني لحم الخروف مع أرز باللوز وفاصولياء خضراء"
    ],
    [
      "p-crevettes-sauce",
      "plats",
      "جمبري بالصلصة"
    ],
    [
      "p-seffa-fruits-secs",
      "douceurs",
      "سفة بالفواكه الجافة والعسل"
    ],
    [
      "tables-reception",
      "buffet",
      "طاولات الاستقبال"
    ],
    [
      "p-boulettes-puree",
      "plats",
      "كرات اللحم بالصلصة مع هريس البطاطس"
    ],
    [
      "p-cigares-frits",
      "buffet",
      "لفائف مقلية في طبق"
    ],
    [
      "p-barquettes-poulet-riz",
      "lunch",
      "صواني دجاج مشوي مع الأرز والخضر"
    ],
    [
      "p-sardines-frites",
      "plats",
      "سردين مقلي مع البطاطس"
    ],
    [
      "p-couscous-chorba",
      "plats",
      "كسكس وشوربة"
    ],
    [
      "salle-chapiteau",
      "buffet",
      "قاعة تحت خيمة"
    ],
    [
      "p-kefta-sauce-tomate",
      "plats",
      "كرات اللحم بصلصة الطماطم"
    ],
    [
      "p-barquettes-compartimentees",
      "lunch",
      "صواني وجبات بأقسام"
    ],
    [
      "p-souris-agneau-gratin",
      "plats",
      "ساق الخروف مع غراتان السبانخ والهريس"
    ],
    [
      "p-poulet-roti-assiettes",
      "plats",
      "دجاج مشوي مع الهريس وصلصات ملونة"
    ],
    [
      "p-plats-inox-agneau",
      "plats",
      "أطباق من الفولاذ المقاوم للصدأ: لحم خروف وأرز وخضر"
    ],
    [
      "p-couscous-agneau-oeufs",
      "plats",
      "كسكس بلحم الخروف والخضر والبيض"
    ],
    [
      "salle-tapis-rouge",
      "buffet",
      "حفل استقبال بالسجادة الحمراء"
    ]
  ];

  // Videos: [file, title]
  OM.VIDEOS = [
    [
      "bv-terrain",
      "قواعد الحياة: تهيئة أرضية الورشة"
    ],
    [
      "bv-pose-module",
      "قواعد الحياة: وضع وحدة سكنية بالرافعة"
    ],
    [
      "bv-manutention",
      "ورشة: نقل كتل خرسانية بآلية رافعة تلسكوبية"
    ],
    [
      "t-couscous",
      "الكسكس التقليدي"
    ],
    [
      "t-dressage-assiette",
      "التقديم في الأطباق"
    ],
    [
      "salle-tapis-rouge",
      "حفل استقبال وسجادة حمراء وبوفيه"
    ],
    [
      "t-lunch-box-livrer",
      "علب غداء جاهزة للتوصيل"
    ],
    [
      "t-buffet-bouchees",
      "بوفيه كوكتيل وقطع مقبّلات"
    ],
    [
      "t-couscous-authentique",
      "الكسكس الجزائري الأصيل"
    ],
    [
      "salle-chapiteau",
      "قاعة استقبال تحت خيمة"
    ],
    [
      "t-barquettes-agneau",
      "صواني لحم الخروف مع الأرز والفاصولياء الخضراء"
    ],
    [
      "t-entrees-assiettes",
      "مقبّلات مقدَّمة في الأطباق"
    ],
    [
      "tables-reception",
      "طاولات مجهّزة للحفل"
    ],
    [
      "t-plateau-fruits",
      "طبق فواكه طازجة"
    ],
    [
      "t-lunch-box-menu",
      "علبة غداء: وجبة ومشروب وحلوى"
    ],
    [
      "t-lunch-box-depart",
      "علب غداء جاهزة للانطلاق"
    ],
    [
      "t-barquettes-preparation",
      "تحضير الصواني"
    ],
    [
      "t-salle-reception",
      "قاعة استقبال جاهزة لاستقبال الضيوف"
    ],
    [
      "t-corbeilles-fruits",
      "سلال فواكه"
    ],
    [
      "t-barquettes-plats",
      "صواني أطباق مطبوخة"
    ],
    [
      "t-buffet-reception",
      "بوفيه الحفل"
    ],
    [
      "t-lunch-box-prepa",
      "تحضير علب الغداء"
    ],
    [
      "t-tables-dressees",
      "طاولات مجهّزة لضيوفكم"
    ],
    [
      "t-barquettes-repas",
      "صواني وجبات كاملة"
    ],
    [
      "t-buffet-patisseries",
      "بوفيه حلويات الحفل"
    ],
    [
      "t-reception-tapis-rouge",
      "حفل استقبال وسجادة حمراء وبوفيه"
    ],
    [
      "t-mise-en-barquettes",
      "تعبئة الوجبات في الصواني"
    ],
    [
      "t-salades-entrees",
      "سلطات ومقبّلات مزيّنة"
    ],
    [
      "t-salle-tables-rondes",
      "قاعة استقبال وطاولات مستديرة"
    ],
    [
      "t-table-ronde",
      "طاولة استقبال مجهّزة"
    ],
    [
      "t-tapis-rouge-entree",
      "مدخل بالسجادة الحمراء"
    ],
    [
      "t-cuisine-equipee",
      "المطبخ: أسطح العمل والتجهيزات"
    ],
    [
      "t-espace-production",
      "فضاء الإنتاج لدينا"
    ],
    [
      "buffet-reception",
      "بوفيه وحلويات الحفل"
    ],
    [
      "salle-drapeaux",
      "قاعة استقبال وصالونات"
    ],
    [
      "salle-reception",
      "قاعة جاهزة لاستقبال الضيوف"
    ]
  ];

  // Interface strings
  OM.I18N = {
    "filters": {
      "all": "الكل",
      "buffet": "حفلات وبوفيهات",
      "plats": "الأطباق",
      "lunch": "علب الغداء",
      "douceurs": "مقبّلات وحلويات",
      "videos": "فيديو"
    },
    "formError": "يرجى إدخال الاسم واللقب ورقم الهاتف.",
    "subject": "طلب عرض سعر: ",
    "greeting": "مرحبًا Or Matrix،",
    "lName": "الاسم: ",
    "lPhone": "الهاتف: ",
    "lEmail": "البريد الإلكتروني: ",
    "notGiven": "غير مذكور",
    "lService": "الخدمة: ",
    "lDate": "التاريخ المطلوب: ",
    "toSpecify": "يُحدَّد لاحقًا",
    "lQty": "الكمية",
    "waOpened": "يفتح واتساب مع طلبكم. ويبقى عليكم الضغط على إرسال.",
    "mailOpened": "يفتح تطبيق البريد مع الطلب جاهزًا للإرسال.",
    "menuOpen": "فتح القائمة",
    "menuClose": "إغلاق القائمة",
    "zoomPrefix": "تكبير: ",
    "playPrefix": "تشغيل الفيديو: ",
    "colon": ": "
  };
})();
