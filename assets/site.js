'use strict';

document.documentElement.classList.add('js');

const config = window.PADELBASE_CONFIG ?? {};
const menu = document.querySelector('.menu');
const nav = document.getElementById('nav-links');

if (menu && nav) {
  function setMenu(open) {
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  }
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') === 'false'));
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menu.focus();
    }
  });
  matchMedia('(max-width: 680px)').addEventListener('change', () => setMenu(false));
}

function httpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}

function addLinks(container, entries, className) {
  for (const [label, url] of entries) {
    if (!url) continue;
    const link = document.createElement('a');
    link.className = className;
    link.href = url.href;
    link.textContent = label;
    container.append(link);
    container.hidden = false;
  }
}

const apple = httpsUrl(config.appStores?.apple);
const google = httpsUrl(config.appStores?.google);
for (const container of document.querySelectorAll('[data-stores]')) {
  addLinks(container, [
    ['Download on the App Store', apple?.hostname === 'apps.apple.com' && /\/id\d+\/?$/.test(apple.pathname) ? apple : null],
    ['Get it on Google Play', google?.hostname === 'play.google.com' && google.pathname === '/store/apps/details' && google.searchParams.has('id') ? google : null]
  ], 'button ink');
}

for (const container of document.querySelectorAll('[data-social]')) {
  addLinks(container, Object.entries(config.social ?? {}).map(([label, value]) => [label, httpsUrl(value)]), '');
}

for (const phone of document.querySelectorAll('[data-screen]')) {
  const path = config.screenshots?.[phone.dataset.screen];
  if (!path) continue;
  const card = phone.closest('.screen-card');
  const screenshot = new Image();
  screenshot.alt = 'PadelBase app screenshot showing ' + card.querySelector('h3').textContent.toLowerCase();
  screenshot.decoding = 'async';
  screenshot.addEventListener('load', () => {
    phone.replaceChildren(screenshot);
    card.querySelector('[data-caption]').textContent = 'PadelBase app screenshot';
  }, { once: true });
  screenshot.src = path;
}

function downloadEnquiry(subject, body) {
  const url = URL.createObjectURL(new Blob([subject + '\n\n' + body], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'padelbase-enquiry.txt';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

for (const form of document.querySelectorAll('[data-enquiry]')) {
  const kind = form.dataset.enquiry;
  const subject = kind === 'club' ? 'PadelBase club registration enquiry' : 'PadelBase contact enquiry';
  const email = kind === 'club' ? config.clubEmail || config.contactEmail : config.contactEmail;
  const recipient = /^[^\s?&#@]+@[^\s?&#@]+\.[^\s?&#@]+$/.test(email ?? '') ? email : '';
  const endpoint = httpsUrl(config.formEndpoints?.[kind]);
  const button = form.querySelector('button');
  const status = form.querySelector('[data-form-status]');
  const deliveryNote = endpoint ? 'Your details will be sent to the configured enquiry service.' :
    recipient ? 'This opens your email app. Review and send the message there.' :
      'Online delivery will be available once a recipient is configured. You can download a copy of your enquiry below.';

  button.textContent = endpoint ? 'Send enquiry' : recipient ? 'Open email draft' : 'Download enquiry';
  button.disabled = false;
  status.textContent = deliveryNote;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const fields = new FormData(form);
    const body = Array.from(fields, ([name, value]) => name + ': ' + value).join('\n\n');
    if (endpoint) {
      button.disabled = true;
      status.textContent = 'Sending…';
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new URLSearchParams(fields)
        });
        if (!response.ok) throw new Error('Delivery failed');
        status.textContent = 'Enquiry submitted.';
        form.reset();
      } catch {
        status.textContent = 'We could not confirm delivery. Your details are still in the form.';
      } finally {
        button.disabled = false;
      }
      return;
    }
    if (recipient) {
      const draft = 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      if (draft.length <= 1900) {
        window.location.href = draft;
        status.textContent = deliveryNote;
        return;
      }
      downloadEnquiry(subject, body);
      status.textContent = 'Your enquiry is too long for an email link. Attach the downloaded file to an email to ' + recipient + '.';
      return;
    }
    downloadEnquiry(subject, body);
    status.textContent = 'Enquiry downloaded. It has not been sent.';
  });
}
