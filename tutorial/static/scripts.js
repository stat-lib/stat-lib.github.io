window.addEventListener('load', function () {
  const tutorialIndex = window.location.pathname.indexOf('/tutorial/');
  const homeHref =
    tutorialIndex >= 0
      ? `${window.location.origin}${window.location.pathname.slice(0, tutorialIndex)}/index.html`
      : new URL('../../index.html', window.location.href).href;

  const makeHomeLink = function (className) {
    const link = document.createElement('a');
    link.className = className;
    link.href = homeHref;
    link.textContent = 'Statlib';
    link.setAttribute('aria-label', 'Back to Statlib home');
    return link;
  };

  const headerLogo = document.querySelector('.header-logo-wrapper');
  if (headerLogo && !headerLogo.querySelector('.statlib-home-link')) {
    headerLogo.appendChild(makeHomeLink('statlib-home-link'));
  }

  document.querySelectorAll('.has-info, .warning').forEach(function (el) {
    el.classList.remove('has-info', 'warning');

    el.querySelectorAll('span.hover-container').forEach(function (hoverSpan) {
      hoverSpan.remove();
    });
  });

  document.querySelectorAll('p').forEach(function (p) {
    if (p.querySelector('img')) {
      p.setAttribute('align', 'center');
    }
  });

  document.querySelectorAll('a[href]').forEach(function (link) {
    const url = new URL(link.href, window.location.href);
    if (url.hostname !== window.location.hostname) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
});
