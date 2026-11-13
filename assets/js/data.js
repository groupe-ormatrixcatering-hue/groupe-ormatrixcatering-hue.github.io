(function () {
  'use strict';

  var OM = window.OM = window.OM || {};

  // Photos: [file, category, alt]
  OM.PHOTOS = [
    [
      "p-oeuf-poche-epinards",
      "plats",
      "Steak haché, œuf poché et gratin d’épinards"
    ],
    [
      "salle-reception",
      "buffet",
      "Salle de réception dressée"
    ],
    [
      "p-salle-table-dressee",
      "buffet",
      "Table dressée : entrées, fruits, pain et boissons"
    ],
    [
      "p-entree-saumon-avocat",
      "douceurs",
      "Entrée : tartare d’avocat et saumon, citron grillé"
    ],
    [
      "p-salade-poulet-croustillant",
      "douceurs",
      "Salade au poulet croustillant"
    ],
    [
      "p-table-deux-baie-vitree",
      "buffet",
      "Table pour deux près de la baie vitrée"
    ],
    [
      "p-salle-restaurant",
      "buffet",
      "Salle de restaurant : tables dressées"
    ],
    [
      "p-couscous-terre-cuite",
      "plats",
      "Couscous à l’agneau et au poulet"
    ],
    [
      "p-lunch-box-cartons",
      "lunch",
      "Lunch box en carton"
    ],
    [
      "p-agneau-braise-riz",
      "plats",
      "Agneau braisé, riz et légumes"
    ],
    [
      "p-corbeilles-fruits",
      "douceurs",
      "Corbeilles de fruits frais"
    ],
    [
      "p-poulet-roti-puree",
      "plats",
      "Poulet rôti, purée et riz"
    ],
    [
      "p-barquettes-agneau-riz",
      "lunch",
      "Barquettes d’agneau, riz aux amandes et haricots verts"
    ],
    [
      "p-crevettes-sauce",
      "plats",
      "Crevettes en sauce"
    ],
    [
      "p-seffa-fruits-secs",
      "douceurs",
      "Seffa aux fruits secs et au miel"
    ],
    [
      "tables-reception",
      "buffet",
      "Tables de réception"
    ],
    [
      "p-boulettes-puree",
      "plats",
      "Boulettes en sauce et purée"
    ],
    [
      "p-cigares-frits",
      "buffet",
      "Cigares frits en assiette"
    ],
    [
      "p-barquettes-poulet-riz",
      "lunch",
      "Barquettes de poulet rôti, riz et légumes"
    ],
    [
      "p-sardines-frites",
      "plats",
      "Sardines frites et pommes de terre"
    ],
    [
      "p-couscous-chorba",
      "plats",
      "Couscous et chorba"
    ],
    [
      "salle-chapiteau",
      "buffet",
      "Salle sous chapiteau"
    ],
    [
      "p-kefta-sauce-tomate",
      "plats",
      "Boulettes en sauce tomate"
    ],
    [
      "p-barquettes-compartimentees",
      "lunch",
      "Barquettes repas compartimentées"
    ],
    [
      "p-souris-agneau-gratin",
      "plats",
      "Souris d’agneau, gratin d’épinards et purée"
    ],
    [
      "p-poulet-roti-assiettes",
      "plats",
      "Poulet rôti, purée et sauces colorées"
    ],
    [
      "p-plats-inox-agneau",
      "plats",
      "Plats en inox : agneau, riz et légumes"
    ],
    [
      "p-couscous-agneau-oeufs",
      "plats",
      "Couscous à l’agneau, légumes et œufs"
    ],
    [
      "salle-tapis-rouge",
      "buffet",
      "Réception avec tapis rouge"
    ]
  ];

  // Videos: [file, title]
  OM.VIDEOS = [
    [
      "bv-terrain",
      "Bases de vie : préparation du terrain de chantier"
    ],
    [
      "bv-pose-module",
      "Bases de vie : pose d’un module à la grue"
    ],
    [
      "bv-manutention",
      "Chantier : manutention de blocs avec un chariot télescopique"
    ],
    [
      "t-couscous",
      "Couscous traditionnel"
    ],
    [
      "t-dressage-assiette",
      "Dressage à l'assiette"
    ],
    [
      "salle-tapis-rouge",
      "Réception, tapis rouge et buffet"
    ],
    [
      "t-lunch-box-livrer",
      "Lunch box prêtes à livrer"
    ],
    [
      "t-buffet-bouchees",
      "Buffet cocktail et bouchées"
    ],
    [
      "t-couscous-authentique",
      "Le couscous algérien authentique"
    ],
    [
      "salle-chapiteau",
      "Salle de réception sous chapiteau"
    ],
    [
      "t-barquettes-agneau",
      "Barquettes d’agneau, riz et haricots verts"
    ],
    [
      "t-entrees-assiettes",
      "Entrées dressées à l’assiette"
    ],
    [
      "tables-reception",
      "Tables dressées pour la réception"
    ],
    [
      "t-plateau-fruits",
      "Plateau de fruits frais"
    ],
    [
      "t-lunch-box-menu",
      "Lunch box : repas, boisson et dessert"
    ],
    [
      "t-lunch-box-depart",
      "Lunch box prêtes à partir"
    ],
    [
      "t-barquettes-preparation",
      "Préparation des barquettes"
    ],
    [
      "t-salle-reception",
      "Salle de réception prête à accueillir les invités"
    ],
    [
      "t-corbeilles-fruits",
      "Corbeilles de fruits"
    ],
    [
      "t-barquettes-plats",
      "Barquettes de plats cuisinés"
    ],
    [
      "t-buffet-reception",
      "Buffet de réception"
    ],
    [
      "t-lunch-box-prepa",
      "Préparation des lunch box"
    ],
    [
      "t-tables-dressees",
      "Tables dressées pour vos invités"
    ],
    [
      "t-barquettes-repas",
      "Barquettes repas complets"
    ],
    [
      "t-buffet-patisseries",
      "Buffet de pâtisseries de réception"
    ],
    [
      "t-reception-tapis-rouge",
      "Réception, tapis rouge et buffet"
    ],
    [
      "t-mise-en-barquettes",
      "Mise en barquettes des repas"
    ],
    [
      "t-salades-entrees",
      "Salades et entrées décorées"
    ],
    [
      "t-salle-tables-rondes",
      "Salle de réception et tables rondes"
    ],
    [
      "t-table-ronde",
      "Table de réception dressée"
    ],
    [
      "t-tapis-rouge-entree",
      "Entrée avec tapis rouge"
    ],
    [
      "t-cuisine-equipee",
      "Cuisine : plans de travail et équipements"
    ],
    [
      "t-espace-production",
      "Notre espace de production"
    ],
    [
      "buffet-reception",
      "Buffet et pâtisseries de réception"
    ],
    [
      "salle-drapeaux",
      "Salle de réception et salons"
    ],
    [
      "salle-reception",
      "Salle prête à accueillir les invités"
    ]
  ];

  // Interface strings
  OM.I18N = {
    "filters": {
      "all": "Tout",
      "buffet": "Réceptions & buffets",
      "plats": "Plats",
      "lunch": "Lunch box",
      "douceurs": "Entrées & douceurs",
      "videos": "Vidéos"
    },
    "formError": "Merci de renseigner votre prénom, votre nom et votre téléphone.",
    "subject": "Demande de devis : ",
    "greeting": "Bonjour Or Matrix,",
    "lName": "Nom : ",
    "lPhone": "Téléphone : ",
    "lEmail": "E-mail : ",
    "notGiven": "non renseigné",
    "lService": "Service : ",
    "lDate": "Date souhaitée : ",
    "toSpecify": "à préciser",
    "lQty": "Quantité",
    "waOpened": "WhatsApp s'ouvre avec votre demande. Il vous reste à appuyer sur Envoyer.",
    "mailOpened": "Votre messagerie s'ouvre avec la demande prête à envoyer.",
    "menuOpen": "Ouvrir le menu",
    "menuClose": "Fermer le menu",
    "zoomPrefix": "Agrandir : ",
    "playPrefix": "Lire la vidéo : ",
    "colon": " : "
  };
})();
