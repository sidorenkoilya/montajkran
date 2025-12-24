// ===== бургер =====
const burger = document.getElementById('burger');
const nav = document.getElementById('main-nav');

if (burger && nav) {
  burger.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

// ===== активный пункт меню при скролле =====
const links = Array.from(document.querySelectorAll('.nav-link'));
const sections = links
  .map(l => document.querySelector(l.getAttribute('href')))
  .filter(Boolean);

const setActive = (id) => {
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
};

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible?.target?.id) setActive(visible.target.id);
  }, { threshold: [0.25, 0.45, 0.6] });

  sections.forEach(s => io.observe(s));
}

// ===== форма: почта + WhatsApp =====
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');

// 0964150145 -> международный формат для wa.me
const DUTY_PHONE = "380964150145";

if (form && statusEl) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const name = (fd.get('name') || '').toString().trim();
    const contacts = (fd.get('contacts') || '').toString().trim();
    const msg = (fd.get('message') || '').toString().trim();

    // 1) отправка на почту через PHP
    try {
      const res = await fetch('send.php', { method: 'POST', body: fd });
      const text = (await res.text()).trim();

      if (text === 'OK') {
        statusEl.textContent = "Заявка відправлена на пошту ✅";
        statusEl.style.color = "#22c55e";
      } else {
        statusEl.textContent = "Пошта не відправилась (хостинг/PHP).";
        statusEl.style.color = "#ef4444";
      }
    } catch {
      statusEl.textContent = "Помилка: немає доступу до send.php.";
      statusEl.style.color = "#ef4444";
    }

    // 2) дубль в WhatsApp
    const waText =
      `Нова заявка з сайту:%0A` +
      `Ім’я: ${encodeURIComponent(name)}%0A` +
      `Контакти: ${encodeURIComponent(contacts)}%0A` +
      `Повідомлення: ${encodeURIComponent(msg)}`;

    const waUrl = `https://wa.me/${DUTY_PHONE}?text=${waText}`;
    window.open(waUrl, '_blank');

    form.reset();
  });
}
