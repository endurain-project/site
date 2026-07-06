/*
 * Endurain landing page, lightweight i18n.
 *
 * English is the canonical copy and ships directly in index.html, so the page
 * is fully readable with no JavaScript and no network request. Selecting any
 * other language fetches assets/i18n/<lang>.json and swaps text/attributes in
 * place. Missing keys fall back to the English baseline cached from the DOM.
 *
 * Translation strings are trusted, first-party static assets and are applied
 * with textContent / setAttribute only (never innerHTML), so there is no XSS
 * surface here.
 */
;(function () {
  'use strict'

  var STORAGE_KEY = 'endurain-lang'
  var DEFAULT_LANG = 'en'

  // Must match the folders under frontend/src/i18n/locales and the menu markup.
  var SUPPORTED = [
    'en',
    'bg',
    'ca',
    'cs',
    'da',
    'de',
    'el',
    'es',
    'et',
    'fi',
    'fr',
    'gl',
    'hr',
    'hu',
    'it',
    'lt',
    'lv',
    'nb',
    'nl',
    'pl',
    'pt-PT',
    'ro',
    'sk',
    'sl',
    'sr',
    'sv',
    'tr',
    'uk',
    'zh-Hans',
    'zh-Hant',
  ]

  var dictCache = { en: null }
  var root = document.documentElement

  // Cache the English baseline straight from the rendered DOM.
  var textTargets = Array.prototype.map.call(
    document.querySelectorAll('[data-i18n]'),
    function (el) {
      return { el: el, key: el.getAttribute('data-i18n'), orig: el.textContent }
    },
  )

  var attrTargets = Array.prototype.map.call(
    document.querySelectorAll('[data-i18n-attr]'),
    function (el) {
      var pairs = el
        .getAttribute('data-i18n-attr')
        .split(';')
        .map(function (raw) {
          var part = raw.trim()
          if (!part) return null
          var idx = part.indexOf(':')
          if (idx === -1) return null
          var attr = part.slice(0, idx).trim()
          var key = part.slice(idx + 1).trim()
          return { attr: attr, key: key, orig: el.getAttribute(attr) }
        })
        .filter(Boolean)
      return { el: el, pairs: pairs }
    },
  )

  /**
   * Resolve a dotted key (e.g. "hero.title1") against a nested dictionary.
   * @returns {string|null}
   */
  function lookup(dict, key) {
    if (!dict) return null
    var value = key.split('.').reduce(function (acc, part) {
      return acc && typeof acc === 'object' ? acc[part] : undefined
    }, dict)
    return typeof value === 'string' ? value : null
  }

  /**
   * Best-effort match of a browser language tag to a supported locale.
   * @returns {string}
   */
  function matchBrowserLang() {
    var tags =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || DEFAULT_LANG]

    var lowerSupported = SUPPORTED.map(function (s) {
      return s.toLowerCase()
    })

    for (var i = 0; i < tags.length; i++) {
      var tag = String(tags[i] || '').toLowerCase()
      if (!tag) continue

      // Chinese script handling.
      if (tag.indexOf('zh') === 0) {
        if (/hant|tw|hk|mo/.test(tag)) return 'zh-Hant'
        return 'zh-Hans'
      }

      var exact = lowerSupported.indexOf(tag)
      if (exact !== -1) return SUPPORTED[exact]

      var base = tag.split('-')[0]
      for (var j = 0; j < SUPPORTED.length; j++) {
        if (SUPPORTED[j].toLowerCase().split('-')[0] === base)
          return SUPPORTED[j]
      }
    }
    return DEFAULT_LANG
  }

  function initialLang() {
    var stored
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch (e) {
      stored = null
    }
    if (stored && SUPPORTED.indexOf(stored) !== -1) return stored
    return matchBrowserLang()
  }

  function loadDict(lang) {
    if (lang === DEFAULT_LANG) return Promise.resolve(null)
    if (dictCache[lang]) return Promise.resolve(dictCache[lang])
    return fetch('assets/i18n/' + lang + '.json', { cache: 'default' })
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status)
        return resp.json()
      })
      .then(function (json) {
        dictCache[lang] = json
        return json
      })
      .catch(function () {
        // Fall back to English silently if a locale file is unavailable.
        return null
      })
  }

  function applyDict(dict) {
    textTargets.forEach(function (t) {
      var value = dict ? lookup(dict, t.key) : null
      t.el.textContent = value != null ? value : t.orig
    })
    attrTargets.forEach(function (t) {
      t.pairs.forEach(function (p) {
        var value = dict ? lookup(dict, p.key) : null
        t.el.setAttribute(p.attr, value != null ? value : p.orig)
      })
    })
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG
    loadDict(lang).then(function (dict) {
      applyDict(dict)
      root.setAttribute('lang', lang)
      try {
        localStorage.setItem(STORAGE_KEY, lang)
      } catch (e) {
        /* storage unavailable, selection still applies for this session */
      }
      markSelected(lang)
    })
  }

  /* ------------------------------ Menu UI ------------------------------- */
  var toggle = document.getElementById('lang-toggle')
  var menu = document.getElementById('lang-menu')
  var options = menu
    ? Array.prototype.slice.call(menu.querySelectorAll('[data-lang]'))
    : []

  options.forEach(function (li) {
    li.setAttribute('tabindex', '-1')
  })

  function markSelected(lang) {
    options.forEach(function (li) {
      li.setAttribute(
        'aria-selected',
        String(li.getAttribute('data-lang') === lang),
      )
    })
  }

  function openMenu() {
    if (!menu || !toggle) return
    menu.hidden = false
    toggle.setAttribute('aria-expanded', 'true')
    var current = menu.querySelector('[aria-selected="true"]') || options[0]
    if (current) current.focus()
  }

  function closeMenu(focusToggle) {
    if (!menu || !toggle) return
    menu.hidden = true
    toggle.setAttribute('aria-expanded', 'false')
    if (focusToggle) toggle.focus()
  }

  function isOpen() {
    return menu && !menu.hidden
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation()
      if (isOpen()) closeMenu(false)
      else openMenu()
    })

    options.forEach(function (li, index) {
      li.addEventListener('click', function () {
        setLang(li.getAttribute('data-lang'))
        closeMenu(true)
      })
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setLang(li.getAttribute('data-lang'))
          closeMenu(true)
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          ;(options[index + 1] || options[0]).focus()
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          ;(options[index - 1] || options[options.length - 1]).focus()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          closeMenu(true)
        }
      })
    })

    document.addEventListener('click', function (e) {
      if (
        isOpen() &&
        e.target instanceof Node &&
        !menu.contains(e.target) &&
        e.target !== toggle
      ) {
        closeMenu(false)
      }
    })

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) closeMenu(true)
    })
  }

  /* ------------------------------ Bootstrap ----------------------------- */
  setLang(initialLang())
})()
