/* Interface de composition : étapes du menu et box vue de dessus. Le texte passe uniquement par textContent. */
(function (root) {
  'use strict';

  const Menu = root.LunchMenu;
  const Order = root.LunchOrder;

  /* Compartiments de la box, dans l'ordre de lecture. L'eau est toujours comprise. */
  const COMPARTMENTS = Object.freeze([
    { id: 'entree', label: 'Entrées' },
    { id: 'salade', label: 'Salade' },
    { id: 'plat', label: 'Plat' },
    { id: 'boisson', label: 'Boisson' },
    { id: 'eau', label: 'Eau', fixed: '1 bouteille' },
    { id: 'dessert', label: 'Dessert' },
  ]);

  function el(tag, attributes = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attributes).forEach(([name, value]) => {
      if (name === 'text') node.textContent = value;
      else node.setAttribute(name, value);
    });
    node.append(...children);
    return node;
  }

  function setText(node, text) {
    if (node.textContent !== text) node.textContent = text;
  }

  /* ---------- Construction des étapes ---------- */

  function buildVariants(item) {
    const options = item.variants.map((value) => el('label', { class: 'variant' }, [
      el('input', { type: 'radio', name: `variant-${item.id}`, value, 'data-variant': item.id }),
      el('span', { text: value }),
    ]));
    const group = el('div', { class: 'variants', role: 'radiogroup', 'aria-label': `Préparation : ${item.name}`, 'data-variants': item.id }, options);
    group.hidden = true;
    return group;
  }

  function buildChoice(section, group, item) {
    const input = el('input', {
      type: section.multiple ? 'checkbox' : 'radio',
      name: `${section.id}-${group.id}`,
      value: item.id,
      'data-section': section.id,
    });
    const text = el('span', { class: 'choice-text' }, [el('span', { text: item.name })]);
    const note = item.price ? Order.formatPrice(item.price) : item.note;
    if (note) text.append(el('span', { class: 'choice-note', text: note }));
    const parts = [el('label', { class: 'choice' }, [input, text])];
    if (item.variants) parts.push(buildVariants(item));
    return el('li', {}, parts);
  }

  const buildOptions = (section, group) => el(
    'ul',
    { class: 'options', 'data-group': group.id },
    group.items.map((item) => buildChoice(section, group, item)),
  );

  function buildBody(section) {
    const lists = section.groups.map((group) => buildOptions(section, group));
    const before = [];
    const after = [];
    if (section.required) before.push(el('p', { class: 'error', id: `${section.id}-error`, 'aria-live': 'polite' }));
    if (section.dependsOn) before.push(el('p', { class: 'prompt', 'data-prompt': section.id, text: "Choisissez d'abord votre box." }));
    if (section.max) after.push(el('p', { class: 'limit', id: `${section.id}-limit`, 'aria-live': 'polite' }));
    if (section.included) after.push(el('p', { class: 'included', text: section.included }));
    return [...before, ...lists, ...after];
  }

  function buildStep(section, index) {
    const legend = el('legend', {}, [
      el('span', { class: 'step-number', text: String(index + 1) }),
      el('span', { class: 'step-title', text: section.title }),
      el('span', { class: 'step-hint', text: section.hint }),
    ]);
    const attributes = { class: 'step', id: `step-${section.id}` };
    if (section.required) attributes['aria-describedby'] = `${section.id}-error`;
    return el('fieldset', attributes, [legend, ...buildBody(section)]);
  }

  /* ---------- Comportement des étapes ---------- */

  /* Espace sur un choix facultatif déjà coché : le navigateur ne signale pas toujours ce second appui. */
  function onSpaceKey(event, onSelect) {
    const input = event.target;
    if (event.key !== ' ' || !input.matches('input[type="radio"][data-section]') || !input.checked) return;
    event.preventDefault();
    if (event.type === 'keyup') onSelect(input.dataset.section, input.value);
  }

  function bindEvents(container, { onSelect, onVariant }) {
    container.addEventListener('click', (event) => {
      if (event.target.matches('input[data-section]')) onSelect(event.target.dataset.section, event.target.value);
    });
    container.addEventListener('change', (event) => {
      if (event.target.matches('input[data-variant]')) onVariant(event.target.value);
    });
    container.addEventListener('keydown', (event) => onSpaceKey(event, onSelect));
    container.addEventListener('keyup', (event) => onSpaceKey(event, onSelect));
  }

  /* Une fois le maximum atteint, les autres cases sont désactivées et le texte l'explique. */
  function syncLimit(container, section, composition) {
    const isFull = composition[section.id].length >= section.max;
    const limit = container.querySelector(`#${section.id}-limit`);
    setText(limit, isFull ? section.maxMessage : '');
    container.querySelectorAll(`input[data-section="${section.id}"]`).forEach((input) => {
      input.disabled = isFull && !input.checked;
      input.closest('.choice').classList.toggle('is-disabled', input.disabled);
      if (input.disabled) input.setAttribute('aria-describedby', limit.id);
      else input.removeAttribute('aria-describedby');
    });
  }

  /* Seuls les plats de la box choisie sont affichés. */
  function syncDependentGroups(container, section, composition) {
    const chosen = composition[section.dependsOn];
    container.querySelector(`[data-prompt="${section.id}"]`).hidden = Boolean(chosen);
    container.querySelectorAll(`#step-${section.id} [data-group]`).forEach((list) => {
      list.hidden = list.dataset.group !== chosen;
    });
  }

  function syncChoices(container, composition) {
    container.querySelectorAll('input[data-section]').forEach((input) => {
      const chosen = [].concat(composition[input.dataset.section] || []);
      input.checked = chosen.includes(input.value);
      input.closest('.choice').classList.toggle('is-selected', input.checked);
    });
    container.querySelectorAll('[data-variants]').forEach((block) => {
      block.hidden = block.dataset.variants !== composition.plat;
      block.querySelectorAll('input').forEach((input) => {
        input.checked = !block.hidden && input.value === composition.variant;
      });
    });
    Menu.sections.forEach((section) => {
      if (section.max) syncLimit(container, section, composition);
      if (section.dependsOn) syncDependentGroups(container, section, composition);
    });
  }

  function createSteps(container, handlers) {
    container.replaceChildren(...Menu.sections.map(buildStep));
    bindEvents(container, handlers);
    return Object.freeze({
      sync: (composition) => syncChoices(container, composition),
      focusStep(sectionId) {
        const step = container.querySelector(`#step-${sectionId}`);
        const inputs = [...step.querySelectorAll('input[data-section]')].filter((input) => !input.closest('[hidden]'));
        step.scrollIntoView();
        (inputs.find((input) => input.checked) || inputs[0]).focus({ preventScroll: true });
      },
    });
  }

  /* ---------- Box vue de dessus ---------- */

  function buildCompartment({ id, label, fixed }) {
    return el('li', { class: fixed ? 'compartment is-filled' : 'compartment', 'data-slot': id }, [
      el('span', { class: 'compartment-label', text: label }),
      el('span', { class: 'compartment-value', text: fixed || '' }),
    ]);
  }

  function bindToggle(panel, toggle, action) {
    const setOpen = (isOpen) => {
      panel.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      action.textContent = isOpen ? 'Fermer' : 'Voir';
    };
    toggle.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !panel.classList.contains('is-open')) return;
      setOpen(false);
      toggle.focus();
    });
    document.addEventListener('focusin', (event) => {
      if (!panel.contains(event.target)) setOpen(false);
    });
  }

  function summary(boxName, dishName, price) {
    if (!boxName) return 'Choisissez votre box';
    return dishName ? `${boxName}, ${Order.formatPrice(price)}` : `${boxName} : choisissez votre plat`;
  }

  function createBox() {
    const byId = (id) => document.getElementById(id);
    const list = byId('box');
    const meter = byId('box-meter');
    const chosenByCustomer = COMPARTMENTS.filter((compartment) => !compartment.fixed);
    const name = el('li', { class: 'box-name' });
    list.replaceChildren(name, ...COMPARTMENTS.map(buildCompartment));
    meter.replaceChildren(...chosenByCustomer.map(() => el('i')));
    bindToggle(byId('box-panel'), byId('box-toggle'), byId('box-action'));

    return Object.freeze({
      render(composition, total) {
        const values = Object.fromEntries(Order.describeComposition(composition).map((part) => [part.id, part.value]));
        const price = Order.unitPrice(composition);
        chosenByCustomer.forEach(({ id }, index) => {
          const compartment = list.querySelector(`[data-slot="${id}"]`);
          compartment.classList.toggle('is-filled', Boolean(values[id]));
          meter.children[index].classList.toggle('is-filled', Boolean(values[id]));
          setText(compartment.lastElementChild, values[id] || (id === 'plat' ? 'À choisir' : 'Au choix'));
        });
        const filled = chosenByCustomer.filter(({ id }) => values[id]).length;
        setText(name, values.box || 'Choisissez votre box');
        setText(byId('box-progress'), `Votre box : ${filled} sur ${chosenByCustomer.length}`);
        setText(byId('box-summary'), summary(values.box, values.plat, price));
        setText(byId('box-price'), price === null ? '' : `Prix de la box : ${Order.formatPrice(price)}`);
        setText(byId('box-total'), total > 0 ? `Dans votre commande : ${total} box` : '');
      },
    });
  }

  root.LunchComposer = Object.freeze({ el, setText, createSteps, createBox });
}(window));
