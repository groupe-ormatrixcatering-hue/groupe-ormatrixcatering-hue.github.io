(function () {
  'use strict';

  var OM = window.OM = window.OM || {};

  // Photos: [file, category, alt]
  OM.PHOTOS = [
    [
      "p-oeuf-poche-epinards",
      "plats",
      "Minced beef steak, poached egg and spinach gratin"
    ],
    [
      "salle-reception",
      "buffet",
      "Reception hall set up"
    ],
    [
      "p-salle-table-dressee",
      "buffet",
      "Set table: starters, fruit, bread and drinks"
    ],
    [
      "p-entree-saumon-avocat",
      "douceurs",
      "Starter: avocado and salmon tartare, grilled lemon"
    ],
    [
      "p-salade-poulet-croustillant",
      "douceurs",
      "Crispy chicken salad"
    ],
    [
      "p-table-deux-baie-vitree",
      "buffet",
      "Table for two by the bay window"
    ],
    [
      "p-salle-restaurant",
      "buffet",
      "Restaurant hall: set tables"
    ],
    [
      "p-couscous-terre-cuite",
      "plats",
      "Couscous with lamb and chicken"
    ],
    [
      "p-lunch-box-cartons",
      "lunch",
      "Cardboard lunch box"
    ],
    [
      "p-agneau-braise-riz",
      "plats",
      "Braised lamb, rice and vegetables"
    ],
    [
      "p-corbeilles-fruits",
      "douceurs",
      "Baskets of fresh fruit"
    ],
    [
      "p-poulet-roti-puree",
      "plats",
      "Roast chicken, mashed potatoes and rice"
    ],
    [
      "p-barquettes-agneau-riz",
      "lunch",
      "Lamb trays with almond rice and green beans"
    ],
    [
      "p-crevettes-sauce",
      "plats",
      "Prawns in sauce"
    ],
    [
      "p-seffa-fruits-secs",
      "douceurs",
      "Seffa with dried fruits and honey"
    ],
    [
      "tables-reception",
      "buffet",
      "Reception tables"
    ],
    [
      "p-boulettes-puree",
      "plats",
      "Meatballs in sauce with mashed potatoes"
    ],
    [
      "p-cigares-frits",
      "buffet",
      "Fried pastry rolls on a plate"
    ],
    [
      "p-barquettes-poulet-riz",
      "lunch",
      "Roast chicken trays with rice and vegetables"
    ],
    [
      "p-sardines-frites",
      "plats",
      "Fried sardines and potatoes"
    ],
    [
      "p-couscous-chorba",
      "plats",
      "Couscous and chorba soup"
    ],
    [
      "salle-chapiteau",
      "buffet",
      "Hall under a marquee"
    ],
    [
      "p-kefta-sauce-tomate",
      "plats",
      "Meatballs in tomato sauce"
    ],
    [
      "p-barquettes-compartimentees",
      "lunch",
      "Compartment meal trays"
    ],
    [
      "p-souris-agneau-gratin",
      "plats",
      "Lamb shank, spinach gratin and mashed potatoes"
    ],
    [
      "p-poulet-roti-assiettes",
      "plats",
      "Roast chicken, mashed potatoes and colourful sauces"
    ],
    [
      "p-plats-inox-agneau",
      "plats",
      "Stainless-steel dishes: lamb, rice and vegetables"
    ],
    [
      "p-couscous-agneau-oeufs",
      "plats",
      "Couscous with lamb, vegetables and eggs"
    ],
    [
      "salle-tapis-rouge",
      "buffet",
      "Reception with red carpet"
    ]
  ];

  // Videos: [file, title]
  OM.VIDEOS = [
    [
      "bv-terrain",
      "Site camps: site ground preparation"
    ],
    [
      "bv-pose-module",
      "Site camps: placing a module with a crane"
    ],
    [
      "bv-manutention",
      "Site: handling blocks with a telehandler"
    ],
    [
      "t-couscous",
      "Traditional couscous"
    ],
    [
      "t-dressage-assiette",
      "Plating dishes"
    ],
    [
      "salle-tapis-rouge",
      "Reception, red carpet and buffet"
    ],
    [
      "t-lunch-box-livrer",
      "Lunch boxes ready for delivery"
    ],
    [
      "t-buffet-bouchees",
      "Cocktail buffet and canapés"
    ],
    [
      "t-couscous-authentique",
      "Authentic Algerian couscous"
    ],
    [
      "salle-chapiteau",
      "Reception hall under a marquee"
    ],
    [
      "t-barquettes-agneau",
      "Lamb trays with rice and green beans"
    ],
    [
      "t-entrees-assiettes",
      "Starters plated"
    ],
    [
      "tables-reception",
      "Tables set for the reception"
    ],
    [
      "t-plateau-fruits",
      "Fresh fruit platter"
    ],
    [
      "t-lunch-box-menu",
      "Lunch box: meal, drink and dessert"
    ],
    [
      "t-lunch-box-depart",
      "Lunch boxes ready to go"
    ],
    [
      "t-barquettes-preparation",
      "Preparing the trays"
    ],
    [
      "t-salle-reception",
      "Reception hall ready to welcome guests"
    ],
    [
      "t-corbeilles-fruits",
      "Fruit baskets"
    ],
    [
      "t-barquettes-plats",
      "Trays of cooked dishes"
    ],
    [
      "t-buffet-reception",
      "Reception buffet"
    ],
    [
      "t-lunch-box-prepa",
      "Preparing the lunch boxes"
    ],
    [
      "t-tables-dressees",
      "Tables set for your guests"
    ],
    [
      "t-barquettes-repas",
      "Full-meal trays"
    ],
    [
      "t-buffet-patisseries",
      "Reception pastry buffet"
    ],
    [
      "t-reception-tapis-rouge",
      "Reception, red carpet and buffet"
    ],
    [
      "t-mise-en-barquettes",
      "Packing the meals into trays"
    ],
    [
      "t-salades-entrees",
      "Decorated salads and starters"
    ],
    [
      "t-salle-tables-rondes",
      "Reception hall and round tables"
    ],
    [
      "t-table-ronde",
      "Reception table set"
    ],
    [
      "t-tapis-rouge-entree",
      "Entrance with red carpet"
    ],
    [
      "t-cuisine-equipee",
      "Kitchen: worktops and equipment"
    ],
    [
      "t-espace-production",
      "Our production area"
    ],
    [
      "buffet-reception",
      "Reception buffet and pastries"
    ],
    [
      "salle-drapeaux",
      "Reception hall and lounges"
    ],
    [
      "salle-reception",
      "Hall ready to welcome guests"
    ]
  ];

  // Interface strings
  OM.I18N = {
    "filters": {
      "all": "All",
      "buffet": "Receptions & buffets",
      "plats": "Dishes",
      "lunch": "Lunch boxes",
      "douceurs": "Starters & sweets",
      "videos": "Videos"
    },
    "formError": "Please enter your first name, last name and phone number.",
    "subject": "Quote request: ",
    "greeting": "Hello Or Matrix,",
    "lName": "Name: ",
    "lPhone": "Phone: ",
    "lEmail": "E-mail: ",
    "notGiven": "not provided",
    "lService": "Service: ",
    "lDate": "Desired date: ",
    "toSpecify": "to be specified",
    "lQty": "Quantity",
    "waOpened": "WhatsApp opens with your request. You just need to press Send.",
    "mailOpened": "Your e-mail app opens with the request ready to send.",
    "menuOpen": "Open menu",
    "menuClose": "Close menu",
    "zoomPrefix": "Enlarge: ",
    "playPrefix": "Play video: ",
    "colon": ": "
  };
})();
