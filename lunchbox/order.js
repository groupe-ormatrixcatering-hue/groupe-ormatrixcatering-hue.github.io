/* Logique pure de la commande : état, validation, récapitulatif, brouillon. Aucun accès au DOM. */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./menu.js'));
  else root.LunchOrder = factory(root.LunchMenu);
}(typeof self !== 'undefined' ? self : this, function (Menu) {
  'use strict';

  const QTY_MIN = 1;
  const QTY_MAX = 999;
  const DEFAULT_QTY = 1;
  const MAX_LINES = 15;
  const MAX_ENTREES = Menu.sections.find((s) => s.id === 'entree').max;
  /* La version change avec le format des compositions : les anciens brouillons sont laissés de côté. */
  const STORAGE_KEY = 'tahraoui-lunchbox-brouillon-v2';
  const ESTIMATE_NOTICE = 'Le total est indicatif, confirmé avec le devis.';
  const WHATSAPP_NUMBER = '213564914203';
  const ORDER_EMAIL = 'ormatrixeurl@gmail.com';
  const MAILTO_MAX_LENGTH = 1900;
  const PASTE_BODY = 'Collez ici le récapitulatif de votre commande, puis envoyez.';
  const LIMITS = Object.freeze({ societe: 60, contact: 60, telephone: 20, date: 10, lieu: 120, remarques: 300 });
  const MULTILINE_FIELD = 'remarques';
  const PHONE_PATTERN = /^0(?:[567]\d{8}|[234]\d{7})$/;

  const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const findSection = (sectionId) => Menu.sections.find((s) => s.id === sectionId);
  const sectionItems = (section) => section.groups.flatMap((g) => g.items);
  const findItem = (sectionId, itemId) => {
    const section = findSection(sectionId);
    return section ? sectionItems(section).find((i) => i.id === itemId) : undefined;
  };

  /* ---------- Composition d'une box ---------- */

  const emptyComposition = () => ({ box: null, plat: null, variant: null, entree: [], salade: null, boisson: null, dessert: null });

  /* Les plats proposés dépendent de la box choisie. */
  function availableItem(composition, section, itemId) {
    const groups = section.dependsOn
      ? section.groups.filter((g) => g.id === composition[section.dependsOn])
      : section.groups;
    return groups.flatMap((g) => g.items).find((i) => i.id === itemId);
  }

  function toggleMultiple(composition, section, itemId) {
    const current = composition[section.id];
    const isChosen = current.includes(itemId);
    if (!isChosen && current.length >= section.max) return composition;
    const wanted = isChosen ? current.filter((id) => id !== itemId) : [...current, itemId];
    const ordered = sectionItems(section).map((i) => i.id).filter((id) => wanted.includes(id));
    return { ...composition, [section.id]: ordered };
  }

  function selectOption(composition, sectionId, itemId) {
    const section = findSection(sectionId);
    const item = section && availableItem(composition, section, itemId);
    if (!item) return composition;
    if (section.multiple) return toggleMultiple(composition, section, itemId);
    const isSame = composition[sectionId] === itemId;
    if (!section.required) return { ...composition, [sectionId]: isSame ? null : itemId };
    if (isSame) return composition;
    if (sectionId === 'box') return { ...composition, box: itemId, plat: null, variant: null };
    return { ...composition, [sectionId]: itemId, variant: item.variants ? item.variants[0] : null };
  }

  function setVariant(composition, variant) {
    const dish = findItem('plat', composition.plat);
    if (!dish || !dish.variants || !dish.variants.includes(variant)) return composition;
    return { ...composition, variant };
  }

  function itemLabel(item, variant) {
    if (item.variants && variant) return `${item.name} (${variant})`;
    return item.note ? `${item.name} (${item.note})` : item.name;
  }

  function describeComposition(composition) {
    return Menu.sections.map((section) => {
      const chosen = [].concat(composition[section.id] || []);
      const labels = chosen
        .map((id) => findItem(section.id, id))
        .filter(Boolean)
        .map((item) => itemLabel(item, section.id === 'plat' ? composition.variant : null));
      return { id: section.id, label: section.label || section.title, value: labels.join(', ') };
    });
  }

  /* ---------- Prix ---------- */

  /** Prix d'une box : celui de la box (ou du plat qui le remplace), plus le supplément éventuel de la salade. */
  function unitPrice(composition) {
    const box = findItem('box', composition.box);
    if (!box) return null;
    const dish = findItem('plat', composition.plat);
    const salad = findItem('salade', composition.salade);
    return (dish?.boxPrice ?? box.price) + (salad?.extra ?? 0);
  }

  const lineSubtotal = (line) => line.quantity * unitPrice(line.composition);
  const totalPrice = (lines) => lines.reduce((sum, line) => sum + lineSubtotal(line), 0);
  const formatPrice = (amount) => `${String(amount).replace(/\B(?=(\d{3})+$)/g, '\u00a0')}\u00a0DA`;

  /* ---------- Quantités et lignes ---------- */

  function parseQuantity(value) {
    const text = typeof value === 'number' ? String(value) : value;
    if (typeof text !== 'string' || !/^\s*\d+\s*$/.test(text)) return null;
    const quantity = Number(text);
    return quantity >= QTY_MIN && quantity <= QTY_MAX ? quantity : null;
  }

  const stepQuantity = (quantity, delta) => Math.min(QTY_MAX, Math.max(QTY_MIN, quantity + delta));
  const totalBoxes = (lines) => lines.reduce((sum, line) => sum + line.quantity, 0);

  const emptyOrderMessage = (lines) => (lines.length === 0 ? 'Ajoutez au moins une box à votre commande.' : '');

  const emptyDetails = () => ({ societe: '', contact: '', telephone: '', date: '', lieu: '', remarques: '' });

  const createState = () => ({
    composition: emptyComposition(),
    quantity: DEFAULT_QTY,
    editingId: null,
    lines: [],
    nextId: 1,
    details: emptyDetails(),
  });

  const resetComposer = (state) => ({ ...state, composition: emptyComposition(), quantity: DEFAULT_QTY, editingId: null });

  /* La box d'abord : sans elle, aucun plat n'est proposé. */
  function compositionErrors(composition) {
    if (!findItem('box', composition.box)) return { box: 'Choisissez votre box.' };
    const dish = availableItem(composition, findSection('plat'), composition.plat);
    return dish ? {} : { plat: 'Choisissez un plat principal.' };
  }

  function lineErrors(state) {
    const errors = compositionErrors(state.composition);
    if (parseQuantity(state.quantity) === null) errors.quantity = `Indiquez une quantité entre ${QTY_MIN} et ${QTY_MAX}.`;
    if (state.editingId === null && state.lines.length >= MAX_LINES) {
      errors.limit = `Vous avez atteint le maximum de ${MAX_LINES} compositions. Modifiez ou supprimez-en une.`;
    }
    return errors;
  }

  /** Ajoute la composition en cours, ou enregistre celle en cours de modification. */
  function saveLine(state) {
    const errors = lineErrors(state);
    if (Object.keys(errors).length > 0) return { state, errors };
    const isEditing = state.editingId !== null;
    const line = { id: isEditing ? state.editingId : state.nextId, quantity: state.quantity, composition: state.composition };
    const lines = isEditing ? state.lines.map((l) => (l.id === line.id ? line : l)) : [...state.lines, line];
    const nextId = isEditing ? state.nextId : state.nextId + 1;
    return { state: resetComposer({ ...state, lines, nextId }), errors };
  }

  const isSameComposition = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  /** Vrai si la box en cours manquerait à l'envoi : choix pas encore ajouté, ou modification non enregistrée. */
  function hasPendingBox(state) {
    const saved = state.lines.find((l) => l.id === state.editingId);
    if (!saved) return !isSameComposition(state.composition, emptyComposition());
    return state.quantity !== saved.quantity || !isSameComposition(state.composition, saved.composition);
  }

  function editLine(state, id) {
    const line = state.lines.find((l) => l.id === id);
    if (!line) return state;
    return { ...state, composition: line.composition, quantity: line.quantity, editingId: id };
  }

  const cancelEdit = (state) => (state.editingId === null ? state : resetComposer(state));

  function removeLine(state, id) {
    const next = { ...state, lines: state.lines.filter((l) => l.id !== id) };
    return state.editingId === id ? resetComposer(next) : next;
  }

  function setLineQuantity(state, id, value) {
    const quantity = parseQuantity(value);
    if (quantity === null || !state.lines.some((l) => l.id === id)) return state;
    const lines = state.lines.map((l) => (l.id === id ? { ...l, quantity } : l));
    return { ...state, lines, quantity: state.editingId === id ? quantity : state.quantity };
  }

  /* ---------- Coordonnées ---------- */

  function cleanText(field, value) {
    const printable = value
      .replace(/\p{Cs}/gu, '')
      .replace(/\r\n?/g, '\n')
      .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '');
    const shaped = field === MULTILINE_FIELD ? printable : printable.replace(/[\t\n\u2028\u2029]+/g, ' ');
    return Array.from(shaped).slice(0, LIMITS[field]).join('');
  }

  function setDetail(state, field, value) {
    if (!Object.hasOwn(LIMITS, field) || typeof value !== 'string') return state;
    return { ...state, details: { ...state.details, [field]: cleanText(field, value) } };
  }

  const isValidPhone = (value) => PHONE_PATTERN.test(String(value).replace(/[\s.-]/g, '').replace(/^(?:\+|00)213/, '0'));

  const pad = (number) => String(number).padStart(2, '0');
  const todayIso = (now = new Date()) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  function isRealDate(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
    const parsed = new Date(`${iso}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(iso);
  }

  const formatDate = (iso) => iso.split('-').reverse().join('/');

  function dateError(date, today) {
    if (!date) return 'Indiquez la date de livraison souhaitée.';
    if (!isRealDate(date)) return 'Indiquez une date valide.';
    return date < today ? 'La date de livraison ne peut pas être dans le passé.' : '';
  }

  function phoneError(phone) {
    if (!phone.trim()) return 'Indiquez un numéro de téléphone.';
    return isValidPhone(phone) ? '' : 'Numéro non reconnu. Exemple : 05 50 12 34 56 ou 021 23 45 67.';
  }

  function validateDetails(details, today) {
    const required = (value, message) => (value.trim() ? '' : message);
    const checks = {
      societe: required(details.societe, 'Indiquez le nom de votre société.'),
      contact: required(details.contact, 'Indiquez le nom du contact.'),
      telephone: phoneError(details.telephone),
      date: dateError(details.date, today),
      lieu: required(details.lieu, 'Indiquez le lieu de livraison.'),
    };
    return Object.fromEntries(Object.entries(checks).filter(([, message]) => message));
  }

  function validateOrder(state, today) {
    const empty = emptyOrderMessage(state.lines);
    return { ...(empty ? { lines: empty } : {}), ...validateDetails(state.details, today) };
  }

  /* ---------- Récapitulatif : WhatsApp et e-mail ---------- */

  const whatsAppBold = (text) => `*${text}*`;
  const noBold = (text) => text;

  function lineBlock(line, index, bold) {
    const [box, ...others] = describeComposition(line.composition);
    return [
      '',
      bold(`Composition ${index + 1} : ${line.quantity} box, ${box.value}`),
      ...others.filter((part) => part.value).map((part) => `- ${part.label} : ${part.value}`),
      `Prix unitaire : ${formatPrice(unitPrice(line.composition))}`,
      `Sous-total : ${formatPrice(lineSubtotal(line))}`,
    ];
  }

  function composeSummary(state, bold) {
    const d = state.details;
    const notes = d.remarques.trim();
    return [
      bold('Commande de lunch box'),
      'Traiteur Tahraoui en collaboration avec Or Matrix',
      '',
      `Société : ${d.societe.trim()}`,
      `Contact : ${d.contact.trim()}`,
      `Téléphone : ${d.telephone.trim()}`,
      `Date de livraison souhaitée : ${formatDate(d.date)}`,
      `Lieu : ${d.lieu.trim()}`,
      ...state.lines.flatMap((line, index) => lineBlock(line, index, bold)),
      '',
      bold(`Total : ${totalBoxes(state.lines)} box`),
      bold(`Total indicatif : ${formatPrice(totalPrice(state.lines))}`),
      ESTIMATE_NOTICE,
      ...(notes ? ['', `Remarques : ${notes}`] : []),
    ].join('\n');
  }

  const buildMessage = (state) => composeSummary(state, whatsAppBold);
  const buildWhatsAppUrl = (state) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(state))}`;

  function buildMailtoUrl(state, body) {
    const subject = `Commande de lunch box - ${state.details.societe.trim()}`;
    return `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  /* Un lien trop long risque d'être tronqué : le récapitulatif est alors à copier (textToCopy) puis à coller. */
  function prepareEmail(state) {
    const summary = composeSummary(state, noBold);
    /* Un corps d'e-mail attend des retours à la ligne CRLF. */
    const url = buildMailtoUrl(state, summary.replace(/\n/g, '\r\n'));
    if (url.length <= MAILTO_MAX_LENGTH) return { url, textToCopy: null };
    return { url: buildMailtoUrl(state, PASTE_BODY), textToCopy: summary };
  }

  /* ---------- Brouillon : toute donnée relue est revalidée contre le menu ---------- */

  function restoreComposition(raw) {
    if (!isObject(raw)) return emptyComposition();
    const chosen = Menu.sections.reduce((composition, section) => {
      const value = raw[section.id];
      if (Array.isArray(value) !== Boolean(section.multiple)) return composition;
      return [...new Set([].concat(value))]
        .filter((id) => typeof id === 'string')
        .reduce((next, id) => selectOption(next, section.id, id), composition);
    }, emptyComposition());
    return setVariant(chosen, raw.variant);
  }

  function restoreLines(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.reduce((lines, entry) => {
      if (!isObject(entry) || lines.length >= MAX_LINES) return lines;
      const { id } = entry;
      const quantity = parseQuantity(entry.quantity);
      const composition = restoreComposition(entry.composition);
      const isNewId = Number.isSafeInteger(id) && id > 0 && !lines.some((l) => l.id === id);
      return isNewId && quantity !== null && composition.plat ? [...lines, { id, quantity, composition }] : lines;
    }, []);
  }

  function restoreState(raw) {
    const lines = restoreLines(raw.lines);
    const highestId = lines.reduce((max, line) => Math.max(max, line.id), 0);
    const storedNext = Number.isSafeInteger(raw.nextId) ? raw.nextId : 0;
    const details = isObject(raw.details) ? raw.details : {};
    const base = {
      composition: restoreComposition(raw.composition),
      quantity: parseQuantity(raw.quantity) ?? DEFAULT_QTY,
      editingId: lines.some((l) => l.id === raw.editingId) ? raw.editingId : null,
      lines,
      nextId: Math.max(storedNext, highestId + 1),
      details: emptyDetails(),
    };
    return Object.keys(LIMITS).reduce((state, field) => setDetail(state, field, details[field]), base);
  }

  const serializeDraft = (state) => JSON.stringify(state);

  function parseDraft(text) {
    if (typeof text !== 'string') return createState();
    try {
      const raw = JSON.parse(text);
      return isObject(raw) ? restoreState(raw) : createState();
    } catch (error) {
      if (error instanceof SyntaxError) return createState();
      throw error;
    }
  }

  return Object.freeze({
    QTY_MIN, QTY_MAX, DEFAULT_QTY, MAX_LINES, MAX_ENTREES, STORAGE_KEY, LIMITS, WHATSAPP_NUMBER,
    unitPrice, lineSubtotal, totalPrice, formatPrice,
    emptyComposition, selectOption, setVariant, describeComposition,
    parseQuantity, stepQuantity, totalBoxes, emptyOrderMessage,
    emptyDetails, createState, saveLine, hasPendingBox, editLine, cancelEdit, removeLine, setLineQuantity,
    setDetail, isValidPhone, todayIso, formatDate, validateDetails, validateOrder,
    buildMessage, buildWhatsAppUrl, prepareEmail, serializeDraft, parseDraft,
  });
}));
