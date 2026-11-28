/* Mode intégré (?integre=1) : l'application s'affiche dans une page du site, à travers une iframe de même origine. */
(function () {
  'use strict';

  if (new URLSearchParams(window.location.search).get('integre') !== '1') return;
  const root = document.documentElement;
  root.classList.add('integre');

  /* La hauteur de l'iframe suit le contenu : seule la page hôte défile. */
  function followHeight(frame) {
    const fit = () => {
      frame.style.height = `${Math.ceil(document.body.getBoundingClientRect().height)}px`;
      if (window.scrollY === 0) return;
      /* Un focus posé avant l'ajustement a fait défiler l'iframe : on rend le défilement à la page hôte. */
      window.scrollTo(0, 0);
      if (document.activeElement !== document.body) document.activeElement.scrollIntoView({ block: 'nearest' });
    };
    root.classList.add('hauteur-suivie');
    new ResizeObserver(fit).observe(document.body);
    window.addEventListener('scroll', fit);
    fit();
  }

  document.addEventListener('DOMContentLoaded', () => {
    /* La box rejoint le flux, juste avant la quantité et le bouton d'ajout. */
    document.querySelector('.add-bar').before(document.getElementById('box-panel'));
    document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').forEach((link) => link.setAttribute('target', '_top'));
    /* null hors iframe ou si la page hôte est d'une autre origine : l'iframe garde alors son défilement. */
    if (window.frameElement) followHeight(window.frameElement);
  });
}());
