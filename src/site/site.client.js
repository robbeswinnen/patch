(function () {
	var root = document.documentElement;
	root.classList.add('motion-ready');
	var header = document.querySelector('.site-header');
	var navToggle = document.querySelector('.nav-toggle');
	var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
	var themeToggle = document.querySelector('.theme-toggle');
	var themeColor = document.querySelector('meta[name=theme-color]');
	var commandTabs = Array.prototype.slice.call(document.querySelectorAll('.command-tab'));
	var commandPanels = Array.prototype.slice.call(document.querySelectorAll('.command-panel'));
	var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	function preferredTheme() {
		try {
			var saved = localStorage.getItem('patch-theme');
			if (saved === 'light' || saved === 'dark') {
				return saved;
			}
		} catch (error) {
			// Storage may be unavailable in strict/private browsing contexts.
		}
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	function applyTheme(theme, persist) {
		root.dataset.theme = theme;
		if (themeColor) {
			themeColor.setAttribute('content', theme === 'dark' ? '#071f38' : '#75d3e4');
		}
		if (themeToggle) {
			themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
		}
		if (persist) {
			try {
				localStorage.setItem('patch-theme', theme);
			} catch (error) {
				// Theme still works for this page view when storage is unavailable.
			}
		}
	}

	function closeNavigation() {
		if (!header || !navToggle) {
			return;
		}
		header.classList.remove('is-open');
		navToggle.setAttribute('aria-expanded', 'false');
		navToggle.setAttribute('aria-label', 'Open navigation');
	}

	applyTheme(preferredTheme(), false);

	if (themeToggle) {
		themeToggle.addEventListener('click', function () {
			applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
		});
	}

	if (header && navToggle) {
		navToggle.addEventListener('click', function () {
			var open = !header.classList.contains('is-open');
			header.classList.toggle('is-open', open);
			navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
		});
		navLinks.forEach(function (link) {
			link.addEventListener('click', closeNavigation);
		});
	}

	commandTabs.forEach(function (tab) {
		tab.addEventListener('click', function () {
			var selected = tab.getAttribute('data-command');
			commandTabs.forEach(function (candidate) {
				candidate.setAttribute('aria-selected', candidate === tab ? 'true' : 'false');
			});
			commandPanels.forEach(function (panel) {
				panel.hidden = panel.getAttribute('data-command-panel') !== selected;
			});
		});
	});

	var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
	if (reducedMotion.matches || !('IntersectionObserver' in window)) {
		reveals.forEach(function (element) {
			element.classList.add('is-visible');
		});
	} else {
		var observer = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						observer.unobserve(entry.target);
					}
				});
			},
			{ rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
		);
		reveals.forEach(function (element) {
			observer.observe(element);
		});
	}

	var year = document.querySelector('[data-current-year]');
	if (year) {
		year.textContent = String(new Date().getFullYear());
	}
})();
