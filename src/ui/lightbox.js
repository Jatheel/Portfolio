// @ts-check
/** Lab gallery lightbox. Without JS each thumbnail simply links to the full-size image. */
export function initLightbox() {
  const dialog = document.querySelector('[data-lightbox-dialog]');
  const figure = document.querySelector('[data-lightbox-figure]');
  const gallery = document.querySelector('[data-gallery]');
  if (!(dialog instanceof HTMLDialogElement) || !figure || !gallery) return;
  /** @type {HTMLElement | null} */ let opener = null;

  gallery.addEventListener('click', (e) => {
    const link = /** @type {HTMLElement} */ (e.target).closest('[data-lightbox]');
    if (!(link instanceof HTMLAnchorElement)) return;
    e.preventDefault();
    opener = link;
    const caption = link.closest('figure')?.querySelector('figcaption')?.textContent ?? '';
    const img = document.createElement('img');
    img.src = link.href;
    img.alt = caption;
    const cap = document.createElement('figcaption');
    cap.textContent = caption;
    figure.replaceChildren(img, cap);
    dialog.setAttribute('aria-label', caption || 'Photo');
    dialog.showModal();
  });

  dialog.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    figure.replaceChildren();
    opener?.focus();
    opener = null;
  });
}
