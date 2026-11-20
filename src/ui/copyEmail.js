// @ts-check
/** "Copy email" button; hidden without JS or without the Clipboard API. */
export function initCopyEmail() {
  const btn = document.querySelector('[data-copy-email]');
  const status = document.querySelector('[data-copy-status]');
  if (!(btn instanceof HTMLButtonElement) || !navigator.clipboard) return;
  const label = btn.querySelector('[data-copy-label]');
  btn.hidden = false;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer;

  btn.addEventListener('click', async () => {
    let message = 'Copied';
    try {
      await navigator.clipboard.writeText(btn.dataset.copyEmail ?? '');
    } catch {
      message = 'Copy failed — select the address instead';
    }
    if (label) label.textContent = message;
    if (status) status.textContent = message === 'Copied' ? 'Email address copied' : message;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (label) label.textContent = 'Copy email';
      if (status) status.textContent = '';
    }, 2400);
  });
}
