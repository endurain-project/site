/*
 * Endurain landing page, progressive enhancement.
 * Handles theme toggling, the mobile nav, sticky-header state, and
 * scroll-reveal animations. The page is fully usable without this file.
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
    })

    nav.addEventListener('click', function (e) {
      if (e.target instanceof Element && e.target.closest('a')) closeNav()
    })

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav()
    })

    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) closeNav()
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

  /* --------------------------- Scroll reveal --------------------------- */
  const revealables = document.querySelectorAll('.reveal')

  if (!('IntersectionObserver' in window) || revealables.length === 0) {
    revealables.forEach(function (el) {
      el.classList.add('in')
    })
  } else {
    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            obs.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    revealables.forEach(function (el) {
      observer.observe(el)
    })
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
