/* Shared EN/ES runtime. Filtering values, links and academic identifiers are immutable. */
(() => {
  'use strict';
  const storageKey = 'fanny-site-language';
  const valid = language => language === 'en' || language === 'es';
  let language = 'en';
  try {
    const saved = localStorage.getItem(storageKey);
    if (valid(saved)) language = saved;
  } catch { /* Storage may be disabled; switching still works for this page. */ }
  const getTranslation = (key, selected = language, visited = []) => {
    if (visited.includes(key)) return undefined;
    const value = key.split('.').reduce(
      (entry, part) => entry?.[part], window.FannyTranslations[valid(selected) ? selected : 'en'],
    );
    if (typeof value !== 'string') return value;
    // Compose institutional descriptors without replacing words in academic titles or names.
    return value.replace(/\{@(institutionalTerms\.\w+)\}/g, (reference, term) =>
      getTranslation(term, selected, [...visited, key]) ?? reference,
    );
  };
  const t = (key, params = {}, selected = language) => {
    const value = getTranslation(key, selected) ?? getTranslation(key, 'en');
    if (typeof value !== 'string') return key;
    return value.replace(/\{(\w+)\}/g, (token, name) => params[name] ?? token);
  };
  const attributes = ['placeholder', 'title', 'aria-label', 'alt', 'content',
    'data-more-label', 'data-less-label', 'data-lightbox-title', 'data-lightbox-description'];
  const paramsFor = element => {
    try { return JSON.parse(element.dataset.i18nParams || '{}'); } catch { return {}; }
  };
  const updateElement = element => {
    const params = paramsFor(element);
    if (element.dataset.i18n) element.textContent = t(element.dataset.i18n, params);
    attributes.forEach(attribute => {
      const key = element.getAttribute(`data-i18n-${attribute}`);
      if (key) element.setAttribute(attribute, t(key, params));
    });
  };
  const setText = (element, key, params = {}) => {
    if (!element) return;
    element.dataset.i18n = key;
    element.dataset.i18nParams = JSON.stringify(params);
    element.textContent = t(key, params);
  };
  const setAttribute = (element, attribute, key, params = {}) => {
    if (!element) return;
    element.setAttribute(`data-i18n-${attribute}`, key);
    element.dataset.i18nParams = JSON.stringify(params);
    element.setAttribute(attribute, t(key, params));
  };
  const publicationKeywords = (id, selected = language) =>
    (window.FannyPublicationKeywordIds?.[id] || []).map(key =>
      getTranslation(`keywordTerms.${key}`, selected),
    );
  const renderPublicationKeywords = () => {
    document.querySelectorAll('[data-publication-card]').forEach(card => {
      const keywords = publicationKeywords(card.dataset.publicationId);
      let tags = card.querySelector('.publication-tags');
      let detail = card.querySelector('[data-publication-keywords]');
      if (!keywords.length) {
        tags?.remove();
        detail?.remove();
        return;
      }
      if (!tags) {
        tags = document.createElement('div');
        tags.className = 'publication-tags';
        card.querySelector('.publication-card-copy').append(tags);
      }
      tags.replaceChildren(...keywords.map(keyword => {
        const chip = document.createElement('span');
        chip.textContent = keyword;
        return chip;
      }));
      if (!detail) {
        detail = document.createElement('p');
        detail.dataset.publicationKeywords = '';
        card.querySelector('.publication-metadata').prepend(detail);
      }
      const label = document.createElement('strong');
      label.textContent = t('content.s0488');
      const values = document.createElement('span');
      values.className = 'i18n-text';
      values.textContent = keywords.join('; ');
      detail.replaceChildren(label, values);
    });
  };
  function translatePage(selected, persist = true) {
    language = valid(selected) ? selected : 'en';
    document.documentElement.lang = language;
    document.querySelectorAll(['[data-i18n]', ...attributes.map(a => `[data-i18n-${a}]`)].join(',')).forEach(updateElement);
    renderPublicationKeywords();
    document.querySelectorAll('[data-lang]').forEach(button => {
      const active = button.dataset.lang === language;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('is-active', active);
    });
    if (persist) {
      try { localStorage.setItem(storageKey, language); } catch { /* Optional persistence. */ }
    }
    document.dispatchEvent(new CustomEvent('languagechange', {detail: {language}}));
  }
  window.FannyI18n = {
    t, getTranslation, translatePage, setText, setAttribute, publicationKeywords,
    get language() { return language; },
    formatNumber: value => new Intl.NumberFormat(language === 'es' ? 'es-CL' : 'en-US').format(value),
    formatDate: (value, options) => new Intl.DateTimeFormat(language === 'es' ? 'es-CL' : 'en-US', options).format(value),
  };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => {
      button.addEventListener('click', () => translatePage(button.dataset.lang));
    });
    translatePage(language, false);
  });
})();
