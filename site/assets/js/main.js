/*
 * Endurain landing page, progressive enhancement.
 * Handles theme toggling, the mobile nav, sticky-header state and the
 * active nav link. The page is fully usable without this file.
 */
;(function () {
  'use strict'

  const root = document.documentElement
  const THEME_KEY = 'endurain-theme'

  /* --------------------------- Theme toggle ---------------------------- */
  const themeToggle = document.getElementById('theme-toggle')

  /**
   * Persist and apply the given theme.
   * @param {'light'|'dark'} theme
   */
  function setTheme(theme) {
    root.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch (e) {
      /* storage unavailable, theme still applies for this session */
    }
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(theme === 'dark'))
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      setTheme(root.classList.contains('dark') ? 'light' : 'dark')
    })
  }

  // Follow OS changes only while the user hasn't made an explicit choice.
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', function (e) {
    let stored = null
    try {
      stored = localStorage.getItem(THEME_KEY)
    } catch (err) {
      /* ignore */
    }
    if (!stored) {
      root.classList.toggle('dark', e.matches)
    }
  })

  /* --------------------------- Mobile nav ------------------------------ */
  const navToggle = document.getElementById('nav-toggle')
  const nav = document.getElementById('site-nav')

  function closeNav() {
    if (!nav || !navToggle) return
    nav.classList.remove('open')
    navToggle.setAttribute('aria-expanded', 'false')
    navToggle.setAttribute('aria-label', 'Open menu')
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      const open = nav.classList.toggle('open')
      navToggle.setAttribute('aria-expanded', String(open))
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
      // The links come before the button in the DOM, so move focus into
      // the drop-down for keyboard users.
      const first = nav.querySelector('a')
      if (open && first) first.focus()
    })

    nav.addEventListener('click', function (e) {
      if (e.target instanceof Element && e.target.closest('a')) closeNav()
    })

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !nav.classList.contains('open')) return
      const focusWasInside = nav.contains(document.activeElement)
      closeNav()
      if (focusWasInside) navToggle.focus()
    })

    window.addEventListener('resize', fitNav)

    // The drop-down CSS only applies once the menu button works.
    const navHeader = document.querySelector('.site-header')
    if (navHeader) navHeader.classList.add('nav-ready')
  }

  /* Collapse the nav into the menu button whenever its links don't fit on
     one line. Label length varies a lot between languages, so this is
     measured rather than tied to a fixed breakpoint. */
  const siteHeader = document.querySelector('.site-header')
  const headerInner = document.querySelector('.header-inner')

  function fitNav() {
    if (!siteHeader || !headerInner || !nav) return
    if (window.innerWidth <= 760) {
      // The CSS breakpoint already shows the menu button here.
      siteHeader.classList.remove('nav-collapsed')
      return
    }
    siteHeader.classList.remove('nav-collapsed')
    const overflowing = headerInner.scrollWidth > headerInner.clientWidth + 1
    siteHeader.classList.toggle('nav-collapsed', overflowing)
    if (!overflowing) closeNav()
  }

  if (nav) {
    fitNav()
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(fitNav)
    // Fonts for other scripts (e.g. Cyrillic) can arrive later.
    if (document.fonts && document.fonts.addEventListener)
      document.fonts.addEventListener('loadingdone', fitNav)
    // Re-measure when the language switcher replaces the link labels.
    new MutationObserver(fitNav).observe(nav, {
      subtree: true,
      childList: true,
      characterData: true,
    })
  }

  /* --------------------------- Sticky header --------------------------- */
  const header = document.querySelector('.site-header')
  if (header) {
    const onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
  }

  /* --------------------------- Active nav link ------------------------- */
  const sections = document.querySelectorAll('main section[id]')
  const navLinks = nav ? nav.querySelectorAll('a[href^="#"]') : []

  if ('IntersectionObserver' in window && navLinks.length) {
    const linkFor = {}
    navLinks.forEach(function (link) {
      linkFor[link.getAttribute('href').slice(1)] = link
    })

    const spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const link = linkFor[entry.target.id]
          if (!link) return
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) {
              l.removeAttribute('aria-current')
            })
            link.setAttribute('aria-current', 'true')
          }
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach(function (s) {
      spy.observe(s)
    })
  }

  /* --------------------------- Footer year ----------------------------- */
  const yearEl = document.getElementById('year')
  if (yearEl) yearEl.textContent = String(new Date().getFullYear())
})()
