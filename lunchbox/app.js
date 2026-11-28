/* Câblage de l'interface : état, brouillon, liste de commande, coordonnées et envoi. */
(function () {
  'use strict';

  const Order = window.LunchOrder;
  const { el, setText, createSteps, createBox } = window.LunchComposer;
  const SENT_NOTICE = "WhatsApp s'ouvre avec votre commande : appuyez sur Envoyer.";
  const FIELDS = Object.keys(Order.LIMITS);

  const byId = (id) => document.getElementById(id);
  const form = byId('details');
  const quantityInput = byId('quantity');
  const lineList = byId('order-lines');

  /* Le stockage peut être refusé (navigation privée, réglages) : l'application fonctionne alors sans brouillon. */
  function readDraft() {
    try {
      return window.localStorage.getItem(Order.STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function writeDraft(draft) {
    try {
      window.localStorage.setItem(Order.STORAGE_KEY, Order.serializeDraft(draft));
      return true;
    } catch (error) {
      return false;
    }
  }

  let state = Order.parseDraft(readDraft());
  let linesSignature = '';
  let renderedQuantity = null;
  let pendingOutput = null;

  const steps = createSteps(byId('steps'), {
    onSelect(sectionId, itemId) {
      commit({ ...state, composition: Order.selectOption(state.composition, sectionId, itemId) });
      const error = byId(`${sectionId}-error`);
      if (error) setText(error, '');
    },
    onVariant(variant) {
      commit({ ...state, composition: Order.setVariant(state.composition, variant) });
    },
  });
  const box = createBox();

  /* ---------- Rendu ---------- */

  function clearNotices() {
    ['add-status', 'send-status', 'copy-status'].forEach((id) => setText(byId(id), ''));
    byId('see-order').hidden = true;
    byId('copy-manual').hidden = true;
    byId('pending').hidden = true;
  }

  function commit(next) {
    state = next;
    writeDraft(state);
    clearNotices();
    render();
  }

  function buildStepper(line, number) {
    const button = (delta, label, text) => el('button', {
      type: 'button', 'data-action': 'step', 'data-delta': delta, 'data-line': line.id, 'aria-label': `${label}, composition ${number}`, text,
    });
    const input = el('input', {
      type: 'number', inputmode: 'numeric', min: Order.QTY_MIN, max: Order.QTY_MAX, 'data-line': line.id,
      'aria-label': `Nombre de box, composition ${number}`, 'aria-describedby': `line-error-${line.id}`,
    });
    return el('div', { class: 'stepper' }, [button(-1, 'Une box de moins', '−'), input, button(1, 'Une box de plus', '+')]);
  }

  function buildLine(line, index) {
    const number = index + 1;
    /* Toute ligne enregistrée a une box et un plat : ce sont les deux premières parties. */
    const [boxPart, dish, ...rest] = Order.describeComposition(line.composition);
    const others = rest.filter((part) => part.value).map((part) => el('li', { text: `${part.label} : ${part.value}` }));
    const unit = Order.formatPrice(Order.unitPrice(line.composition));
    const action = (name, text) => el('button', {
      type: 'button', class: 'button secondary', 'data-action': name, 'data-line': line.id, 'aria-label': `${text} la composition ${number}`, text,
    });
    const isEditing = state.editingId === line.id;
    return el('li', { class: isEditing ? 'line is-editing' : 'line' }, [
      el('h3', { text: isEditing ? `Composition ${number} (en cours de modification)` : `Composition ${number}` }),
      el('p', { class: 'line-box', text: boxPart.value }),
      el('p', { class: 'line-dish', text: dish.value }),
      el('ul', { class: 'line-parts' }, others),
      el('p', { class: 'line-unit', text: `Prix unitaire : ${unit}` }),
      el('div', { class: 'line-actions' }, [buildStepper(line, number), action('edit', 'Modifier'), action('remove', 'Supprimer')]),
      el('p', { class: 'line-subtotal', 'data-subtotal': line.id }),
      el('p', { class: 'error', id: `line-error-${line.id}`, 'aria-live': 'polite' }),
    ]);
  }

  /* La liste n'est reconstruite que si les compositions changent, pour conserver le focus sur les quantités. */
  function renderLines() {
    const signature = JSON.stringify([state.editingId, state.lines.map((l) => [l.id, l.composition])]);
    if (signature !== linesSignature) {
      lineList.replaceChildren(...state.lines.map(buildLine));
      linesSignature = signature;
    }
    state.lines.forEach((line) => {
      lineList.querySelector(`input[data-line="${line.id}"]`).value = line.quantity;
      const unit = Order.formatPrice(Order.unitPrice(line.composition));
      const subtotal = Order.formatPrice(Order.lineSubtotal(line));
      setText(lineList.querySelector(`[data-subtotal="${line.id}"]`), `Sous-total : ${line.quantity} × ${unit} = ${subtotal}`);
    });
  }

  function renderTotals() {
    const total = Order.totalBoxes(state.lines);
    const minimum = byId('order-minimum');
    const message = Order.minimumMessage(state.lines);
    byId('order-empty').hidden = state.lines.length > 0;
    const hasLines = state.lines.length > 0;
    setText(byId('order-total'), hasLines ? `Total : ${total} box` : '');
    setText(byId('order-price'), hasLines ? `Total indicatif : ${Order.formatPrice(Order.totalPrice(state.lines))}` : '');
    setText(minimum, message);
    if (!message) minimum.classList.remove('is-error');
  }

  /* Le champ n'est réécrit que si la quantité change : une saisie en cours n'est jamais remplacée. */
  function renderQuantity() {
    const hasChanged = state.quantity !== renderedQuantity;
    if (hasChanged && Order.parseQuantity(quantityInput.value) !== state.quantity) quantityInput.value = state.quantity;
    renderedQuantity = state.quantity;
  }

  function render() {
    const isEditing = state.editingId !== null;
    steps.sync(state.composition);
    box.render(state.composition, Order.totalBoxes(state.lines));
    renderQuantity();
    setText(byId('add'), isEditing ? 'Enregistrer les modifications' : 'Ajouter à ma commande');
    byId('cancel-edit').hidden = !isEditing;
    renderLines();
    renderTotals();
  }

  /* ---------- Composition et quantité ---------- */

  function showQuantityError(isInvalid) {
    quantityInput.setAttribute('aria-invalid', String(isInvalid));
    setText(byId('quantity-error'), isInvalid ? `Indiquez une quantité entre ${Order.QTY_MIN} et ${Order.QTY_MAX}.` : '');
  }

  function clearComposerErrors() {
    showQuantityError(false);
    ['box-error', 'plat-error', 'limit-error'].forEach((id) => setText(byId(id), ''));
  }

  function showComposerErrors(errors) {
    setText(byId('box-error'), errors.box || '');
    setText(byId('plat-error'), errors.plat || '');
    showQuantityError(Boolean(errors.quantity));
    setText(byId('limit-error'), errors.limit || '');
    if (errors.box || errors.plat) steps.focusStep(errors.box ? 'box' : 'plat');
    else if (errors.quantity) quantityInput.focus();
    else byId('limit-error').focus();
  }

  function addComposition() {
    const quantity = Order.parseQuantity(quantityInput.value);
    const wasEditing = state.editingId !== null;
    const result = Order.saveLine({ ...state, quantity: quantity ?? 0 });
    if (Object.keys(result.errors).length > 0) {
      showComposerErrors(result.errors);
      return false;
    }
    clearComposerErrors();
    quantityInput.value = result.state.quantity;
    commit(result.state);
    const added = quantity > 1 ? `${quantity} box ajoutées à votre commande.` : '1 box ajoutée à votre commande.';
    setText(byId('add-status'), wasEditing ? 'Composition modifiée.' : added);
    byId('see-order').hidden = false;
    return true;
  }

  function goToComposer() {
    byId('composer').scrollIntoView();
    byId('composer').focus({ preventScroll: true });
  }

  function leaveEditing(next) {
    clearComposerErrors();
    quantityInput.value = next.quantity;
    commit(next);
  }

  quantityInput.addEventListener('input', () => {
    const quantity = Order.parseQuantity(quantityInput.value);
    if (quantity === null) return;
    showQuantityError(false);
    commit({ ...state, quantity });
  });
  quantityInput.addEventListener('change', () => showQuantityError(Order.parseQuantity(quantityInput.value) === null));
  document.querySelectorAll('.add-bar [data-step]').forEach((button) => button.addEventListener('click', () => {
    const current = Order.parseQuantity(quantityInput.value) ?? state.quantity;
    const quantity = Order.stepQuantity(current, Number(button.dataset.step));
    quantityInput.value = quantity;
    showQuantityError(false);
    commit({ ...state, quantity });
  }));
  byId('add').addEventListener('click', addComposition);
  byId('cancel-edit').addEventListener('click', () => {
    leaveEditing(Order.cancelEdit(state));
    goToComposer();
  });

  /* ---------- Liste de la commande ---------- */

  function onLineAction(action, id, delta) {
    const line = state.lines.find((l) => l.id === id);
    if (action === 'step') {
      setText(byId(`line-error-${id}`), '');
      commit(Order.setLineQuantity(state, id, Order.stepQuantity(line.quantity, delta)));
    } else if (action === 'edit') {
      leaveEditing(Order.editLine(state, id));
      setText(byId('add-status'), 'Ajustez vos choix, puis enregistrez les modifications.');
      goToComposer();
    } else if (action === 'remove') {
      const next = Order.removeLine(state, id);
      if (state.editingId === id) leaveEditing(next);
      else commit(next);
      byId('order-title').focus();
    }
  }

  lineList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (button) onLineAction(button.dataset.action, Number(button.dataset.line), Number(button.dataset.delta));
  });
  lineList.addEventListener('change', (event) => {
    const id = Number(event.target.dataset.line);
    const isInvalid = Order.parseQuantity(event.target.value) === null;
    const message = `Indiquez une quantité entre ${Order.QTY_MIN} et ${Order.QTY_MAX}. L'ancienne quantité est conservée.`;
    setText(byId(`line-error-${id}`), isInvalid ? message : '');
    if (isInvalid) renderLines();
    else commit(Order.setLineQuantity(state, id, event.target.value));
  });

  /* ---------- Coordonnées et envoi ---------- */

  function showFieldError(field, message) {
    const error = byId(`${field}-error`);
    if (!error) return;
    form.elements[field].setAttribute('aria-invalid', String(Boolean(message)));
    setText(error, message);
  }

  function fillForm() {
    FIELDS.forEach((field) => {
      form.elements[field].value = state.details[field];
      showFieldError(field, '');
    });
  }

  /* Relit le formulaire (saisie automatique comprise), affiche les erreurs et place le focus sur la première. */
  function checkOrder() {
    commit(FIELDS.reduce((next, field) => Order.setDetail(next, field, form.elements[field].value), state));
    const errors = Order.validateOrder(state, Order.todayIso());
    FIELDS.forEach((field) => showFieldError(field, errors[field] || ''));
    byId('order-minimum').classList.toggle('is-error', Boolean(errors.lines));
    const first = errors.lines ? byId('order-minimum') : form.elements[FIELDS.find((field) => errors[field])];
    if (first) first.focus();
    return !first;
  }

  function copyManually(text) {
    const area = byId('copy-text');
    byId('copy-manual').hidden = false;
    area.value = text;
    area.focus();
    area.select();
    const isCopied = document.execCommand('copy');
    setText(byId('copy-status'), isCopied ? 'Commande copiée.' : 'Copie automatique impossible : le texte est sélectionné, copiez-le manuellement.');
  }

  function sendOrder() {
    if (!checkOrder()) return;
    window.open(Order.buildWhatsAppUrl(state), '_blank', 'noopener,noreferrer');
    setText(byId('send-status'), SENT_NOTICE);
  }

  async function copyOrder() {
    if (!checkOrder()) return;
    const text = Order.buildMessage(state);
    try {
      await navigator.clipboard.writeText(text);
      setText(byId('copy-status'), 'Commande copiée.');
    } catch (error) {
      copyManually(text);
    }
  }

  form.addEventListener('input', (event) => {
    const { name, value } = event.target;
    if (!FIELDS.includes(name)) return;
    showFieldError(name, '');
    commit(Order.setDetail(state, name, value));
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    requestOutput('send');
  });
  byId('copy').addEventListener('click', () => requestOutput('copy'));

  /* ---------- Box en cours, pas encore dans la commande ---------- */

  const OUTPUTS = Object.freeze({
    send: {
      run: sendOrder, button: form.querySelector('.send'), anchor: form.querySelector('.send'),
      status: 'send-status', skipLabel: 'Envoyer sans cette box', nextStep: 'envoyer',
    },
    copy: {
      run: copyOrder, button: byId('copy'), anchor: form.querySelector('.fallback-actions'),
      status: 'copy-status', skipLabel: 'Copier sans cette box', nextStep: 'copier',
    },
  });

  /* Rien ne part tant que le sort de la box en cours n'a pas été choisi explicitement. */
  function requestOutput(kind) {
    const quantity = Order.parseQuantity(quantityInput.value) ?? 0;
    if (!Order.hasPendingBox({ ...state, quantity })) {
      OUTPUTS[kind].run();
      return;
    }
    pendingOutput = OUTPUTS[kind];
    clearNotices();
    const block = byId('pending');
    pendingOutput.anchor.after(block);
    setText(byId('pending-add'), state.editingId === null ? "L'ajouter à la commande" : 'Enregistrer la modification');
    setText(byId('pending-skip'), pendingOutput.skipLabel);
    block.hidden = false;
    block.focus();
  }

  byId('pending-add').addEventListener('click', () => {
    const done = state.editingId === null ? 'Box ajoutée à votre commande.' : 'Modification enregistrée.';
    byId('pending').hidden = true;
    if (!addComposition()) return;
    setText(byId(pendingOutput.status), `${done} Vous pouvez maintenant ${pendingOutput.nextStep} la commande.`);
    pendingOutput.button.focus();
  });
  byId('pending-skip').addEventListener('click', () => {
    byId('pending').hidden = true;
    pendingOutput.run();
  });
  byId('new-order').addEventListener('click', () => {
    if (!window.confirm('Commencer une nouvelle commande ? Vos compositions et vos coordonnées seront effacées.')) return;
    leaveEditing(Order.createState());
    fillForm();
    byId('order-minimum').classList.remove('is-error');
    goToComposer();
  });

  const setMinimumDate = () => { form.elements.date.min = Order.todayIso(); };
  form.elements.date.addEventListener('focus', setMinimumDate);

  setMinimumDate();
  fillForm();
  quantityInput.value = state.quantity;
  render();
}());
