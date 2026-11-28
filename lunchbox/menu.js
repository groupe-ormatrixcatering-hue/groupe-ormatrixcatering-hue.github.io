/* Données du menu lunch box (Traiteur Tahraoui). Prix en dinars ; les calculs sont dans order.js. */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LunchMenu = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const ON_REQUEST = 'sur commande';

  const item = (id, name, extra) => Object.freeze({ id, name, ...extra });
  const group = (id, title, items) => Object.freeze({ id, title, items: Object.freeze(items) });
  const section = (props) => Object.freeze({ ...props, groups: Object.freeze(props.groups) });
  const variants = (...values) => ({ variants: Object.freeze(values) });

  /* L'identifiant de chaque box est aussi celui de son groupe de plats. */
  const boxes = [
    item('volaille', 'Box Volaille', { price: 1500 }),
    item('viande-rouge', 'Box Viande rouge', { price: 2200 }),
    item('poisson', 'Box Poisson', { price: 2500 }),
    item('traditionnel', 'Box Traditionnel', { price: 1500 }),
  ];

  const entrees = [
    item('hmiss', 'Hmiss'),
    item('bourek', 'Bourek'),
    item('chorba-frik', 'Chorba frik'),
    item('harira', 'Harira oranaise'),
    item('soupe-poisson', 'Soupe de poisson'),
  ];

  const salades = [
    item('salade-variee', 'Salade variée'),
    item('salade-algerienne', 'Salade algérienne'),
    item('salade-cesar', 'Salade César'),
    item('salade-chou', 'Salade de chou'),
    item('macedoine', 'Macédoine'),
    item('salade-traiteur', 'Salade spéciale traiteur', { note: '+200 DA', extra: 200 }),
  ];

  const volaille = [
    item('poulet-roti', 'Poulet rôti'),
    item('poulet-creme', 'Poulet à la crème'),
    item('poulet-farci', 'Poulet farci'),
    item('poulet-pane', 'Poulet pané'),
    item('escalope-grillee', 'Escalope grillée'),
    item('cuisse-desossee', 'Cuisse de poulet désossée'),
    item('cordon-bleu', 'Cordon bleu'),
    item('supreme-poulet', 'Suprême de poulet', { note: ON_REQUEST }),
  ];

  const viandeRouge = [
    item('mchwi-agneau', "M'chwi d'agneau", { note: '3 800 DA', boxPrice: 3800 }),
    item('steak-hache', 'Steak haché'),
    item('cote-agneau', "Côte d'agneau"),
    item('roti-veau', 'Rôti de veau'),
    item('entrecote-creme', 'Entrecôte grillée à la crème'),
    item('filet-grille', 'Filet grillé'),
    item('kabda', 'Kabda mcharmla'),
    item('mixte-viandes', 'Mixte de viandes'),
  ];

  const poisson = [
    item('seiche-sauce', 'Seiche en sauce'),
    item('poisson-pane', 'Filet de poisson pané'),
    item('dorade', 'Dorade grillée'),
    item('calamar', 'Calamar', variants('En sauce', 'Grillé')),
    item('paella', 'Paella', variants('En sauce', 'Grillée')),
    item('crevettes', 'Crevettes', variants('En sauce', 'Grillées')),
    item('espadon', 'Espadon'),
  ];

  const traditionnel = [
    item('couscous', 'Couscous', variants('Viande', 'Poulet')),
    item('rechta', 'Rechta au poulet'),
    item('djelbana', 'Djelbana aux boulettes de viande hachée'),
    item('chtitha-lham', 'Chtitha lham avec frites'),
    item('chtitha-djadj', 'Chtitha djadj avec frites'),
    item('dolma-crombit', 'Dolma crombit'),
    item('chakhchoukha', 'Chakhchoukha'),
    item('mtewem', 'Mtewem'),
    item('3dja-merguez', '3dja merguez'),
    item('3dja-viande', '3dja viande hachée'),
    item('tadjine-chwa', 'Tadjine chwa'),
  ];

  const boissons = [
    item('jus', 'Jus'),
    item('gazouz', 'Gazouz'),
    item('jus-naturel', 'Jus naturel'),
  ];

  const desserts = [
    item('fruits-saison', 'Fruits de saison'),
    item('salade-fruits', 'Salade de fruits'),
    item('mousse-chocolat', 'Mousse au chocolat'),
    item('flan-caramel', 'Flan caramel'),
    item('tiramisu', 'Tiramisu', { note: ON_REQUEST }),
    item('creme-brulee', 'Crème brûlée', { note: ON_REQUEST }),
  ];

  const single = (id, title, items, extra) => section({
    id, title, hint: 'Un choix, facultatif', groups: [group(`${id}s`, title, items)], ...extra,
  });

  const sections = Object.freeze([
    section({
      id: 'box',
      title: 'Choisissez votre box',
      label: 'Box',
      hint: 'Un choix, obligatoire',
      required: true,
      groups: [group('boxes', 'Box', boxes)],
    }),
    section({
      id: 'plat',
      title: 'Plat principal',
      hint: 'Un choix, obligatoire',
      required: true,
      dependsOn: 'box',
      groups: [
        group('volaille', 'Volaille', volaille),
        group('viande-rouge', 'Viande rouge', viandeRouge),
        group('poisson', 'Poisson', poisson),
        group('traditionnel', 'Traditionnel', traditionnel),
      ],
    }),
    section({
      id: 'entree',
      title: 'Entrées',
      hint: 'Jusqu’à 3 choix, facultatif',
      multiple: true,
      max: 3,
      maxMessage: '3 entrées maximum',
      groups: [group('entrees', 'Entrées', entrees)],
    }),
    single('salade', 'Salade', salades),
    single('boisson', 'Boisson', boissons, { included: "Une bouteille d'eau est comprise dans chaque box." }),
    single('dessert', 'Dessert', desserts),
  ]);

  return Object.freeze({ sections });
}));
