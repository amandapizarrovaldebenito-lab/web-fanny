const i18n = window.FannyI18n;
const t = i18n.t;

// Resolve generated assets from this shared script, regardless of page depth.
const siteRoot = new URL('../../', document.currentScript.src);
const siteAsset = path => new URL(path, siteRoot).href;

function enableLocalFileNavigation() {
  if (window.location.protocol !== 'file:') return;
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(href)) return;
    const [, pathname, suffix = ''] = href.match(/^([^?#]*)(.*)$/);
    if (pathname.endsWith('/')) link.setAttribute('href', `${pathname}index.html${suffix}`);
  });
}

enableLocalFileNavigation();

const menuButton = document.querySelector("[data-menu-toggle]");
const mainNav = document.querySelector("[data-main-nav]");

if (menuButton && mainNav) {
  const closeMainMenu = (restoreFocus = false) => {
    menuButton.setAttribute("aria-expanded", "false");
    i18n.setAttribute(menuButton, "aria-label", "ui.openMenu");
    mainNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    mainNav.querySelectorAll("[data-nav-dropdown]").forEach((dropdown) => {
      dropdown.classList.remove("is-open");
      dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
    });
    if (restoreFocus) menuButton.focus();
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMainMenu();
    } else {
      menuButton.setAttribute("aria-expanded", "true");
      i18n.setAttribute(menuButton, "aria-label", "ui.closeMenu");
      mainNav.classList.add("is-open");
      document.body.classList.add("menu-open");
    }
  });

  mainNav.addEventListener("click", (event) => {
    if (event.target.closest("a") && window.innerWidth <= 1050) {
      closeMainMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      window.innerWidth <= 1050 &&
      mainNav.classList.contains("is-open") &&
      !event.target.closest(".site-header")
    ) {
      closeMainMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNav.classList.contains("is-open")) {
      closeMainMenu(true);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1050) {
      closeMainMenu();
    }
  });
}

const navDropdowns = [...document.querySelectorAll("[data-nav-dropdown]")];

const closeNavDropdown = (dropdown, restoreFocus = false) => {
  const toggle = dropdown.querySelector(".nav-dropdown-toggle");
  dropdown.classList.remove("is-open");
  toggle?.setAttribute("aria-expanded", "false");
  if (restoreFocus) toggle?.focus();
};

const openNavDropdown = (dropdown) => {
  navDropdowns.forEach((item) => {
    if (item !== dropdown) closeNavDropdown(item);
  });
  dropdown.classList.add("is-open");
  dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "true");
};

navDropdowns.forEach((dropdown) => {
  const toggle = dropdown.querySelector(".nav-dropdown-toggle");
  const menu = dropdown.querySelector(".nav-dropdown-menu");
  const links = menu ? [...menu.querySelectorAll("a")] : [];

  toggle?.setAttribute("aria-haspopup", "true");

  toggle?.addEventListener("click", () => {
    const isOpen = dropdown.classList.contains("is-open");
    if (isOpen) closeNavDropdown(dropdown);
    else openNavDropdown(dropdown);
  });

  toggle?.addEventListener("keydown", (event) => {
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && links.length) {
      event.preventDefault();
      openNavDropdown(dropdown);
      links[event.key === "ArrowDown" ? 0 : links.length - 1].focus();
    }
  });

  menu?.addEventListener("keydown", (event) => {
    const currentIndex = links.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      closeNavDropdown(dropdown, true);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (currentIndex + direction + links.length) % links.length;
      links[nextIndex].focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      links[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      links[links.length - 1]?.focus();
    }
  });
});

document.addEventListener("click", (event) => {
  navDropdowns.forEach((dropdown) => {
    if (!dropdown.contains(event.target)) closeNavDropdown(dropdown);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    navDropdowns.forEach((dropdown) => {
      if (dropdown.classList.contains("is-open")) closeNavDropdown(dropdown, true);
    });
  }
});

document.querySelectorAll("[data-accordion-trigger]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!expanded));
    if (panel) panel.hidden = expanded;

    if (!expanded && trigger.closest(".detail-output-accordion")) {
      document
        .querySelectorAll(`.detail-deliverable-tabs [href="#${panel?.id}"]`)
        .forEach((activeTab) => {
          const tabs = activeTab.closest(".detail-deliverable-tabs");
          tabs?.querySelectorAll("[data-deliverable-tab]").forEach((tab) => {
            const active = tab === activeTab;
            tab.classList.toggle("is-active", active);
            if (active) tab.setAttribute("aria-current", "true");
            else tab.removeAttribute("aria-current");
          });
        });
    }
  });
});

document.querySelectorAll(".detail-deliverable-tabs").forEach((tabList) => {
  const tabs = [...tabList.querySelectorAll("[data-deliverable-tab]")];
  const accordion = tabList.nextElementSibling;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const panelId = tab.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      const item = panel?.closest(".accordion-item");
      const trigger = item?.querySelector("[data-accordion-trigger]");

      accordion?.querySelectorAll(".accordion-item").forEach((accordionItem) => {
        const itemTrigger = accordionItem.querySelector("[data-accordion-trigger]");
        const itemPanel = document.getElementById(
          itemTrigger?.getAttribute("aria-controls") || "",
        );
        const isTarget = accordionItem === item;
        itemTrigger?.setAttribute("aria-expanded", String(isTarget));
        if (itemPanel) itemPanel.hidden = !isTarget;
      });

      if (trigger && panel) {
        trigger.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }

      tabs.forEach((itemTab) => {
        const active = itemTab === tab;
        itemTab.classList.toggle("is-active", active);
        if (active) itemTab.setAttribute("aria-current", "true");
        else itemTab.removeAttribute("aria-current");
      });
    });
  });
});

document.querySelectorAll("[data-filter-group]").forEach((group) => {
  const buttons = group.querySelectorAll("[data-filter]");
  const targetSelector = group.dataset.filterTarget;
  const targets = document.querySelectorAll(targetSelector);

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      const yearToggle = group.querySelector("[data-year-filter-toggle]");
      const yearDropdown = group.querySelector("[data-year-filter]");

      if (yearToggle) {
        yearToggle.classList.remove("is-active");
        yearToggle.setAttribute("aria-expanded", "false");
        i18n.setText(yearToggle, "ui.year");
      }
      yearDropdown?.classList.remove("is-open");

      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      targets.forEach((target) => {
        const categories = (target.dataset.category || "").split(" ");
        target.hidden = filter !== "all" && !categories.includes(filter);
      });
    });
  });
});

document.querySelectorAll("[data-year-filter]").forEach((dropdown) => {
  const toggle = dropdown.querySelector("[data-year-filter-toggle]");
  const yearButtons = [...dropdown.querySelectorAll("[data-project-year]")];
  const filterGroup = dropdown.closest("[data-filter-group]");
  const targetSelector = filterGroup?.dataset.filterTarget;
  const targets = targetSelector ? [...document.querySelectorAll(targetSelector)] : [];

  const close = () => {
    dropdown.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  };

  toggle?.addEventListener("click", () => {
    const willOpen = !dropdown.classList.contains("is-open");
    dropdown.classList.toggle("is-open", willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
  });

  toggle?.addEventListener("keydown", (event) => {
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && yearButtons.length) {
      event.preventDefault();
      dropdown.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      yearButtons[event.key === "ArrowDown" ? 0 : yearButtons.length - 1].focus();
    }
  });

  yearButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const year = button.dataset.projectYear;
      filterGroup?.querySelectorAll("[data-filter]").forEach((filterButton) => {
        filterButton.classList.remove("is-active");
        filterButton.setAttribute("aria-pressed", "false");
      });
      toggle?.classList.add("is-active");
      if (toggle) i18n.setText(toggle, "ui.yearValue", {year});
      targets.forEach((target) => {
        target.hidden = !(target.dataset.years || "").split(" ").includes(year);
      });
      close();
    });

    button.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        toggle?.focus();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        yearButtons[(index + direction + yearButtons.length) % yearButtons.length].focus();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) close();
  });
});

document.querySelectorAll("[data-thesis-filters]").forEach((filters) => {
  const section = filters.closest(".network-students");
  const cards = [...(section?.querySelectorAll("[data-thesis-student]") || [])];
  const groups = [...(section?.querySelectorAll("[data-thesis-group]") || [])];
  const statusButtons = [...filters.querySelectorAll("[data-thesis-status]")];
  const yearDropdown = filters.querySelector("[data-thesis-year-filter]");
  const yearToggle = yearDropdown?.querySelector("[data-thesis-year-toggle]");
  const yearLabel = yearDropdown?.querySelector("[data-thesis-year-label]");
  const yearButtons = [...(yearDropdown?.querySelectorAll("[data-thesis-year]") || [])];
  const revealToggle = section?.querySelector('[data-reveal-toggle][aria-controls="thesis-student-cards"]');
  const revealContainer = revealToggle?.closest(".thesis-student-more");
  let activeStatus = "all";
  let activeYear = "all";

  const closeYearDropdown = () => {
    yearDropdown?.classList.remove("is-open");
    yearToggle?.setAttribute("aria-expanded", "false");
  };

  const updateStatusButtons = () => {
    statusButtons.forEach((button) => {
      const active = button.dataset.thesisStatus === activeStatus;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  const applyThesisFilters = () => {
    const filtersActive = activeStatus !== "all" || activeYear !== "all";
    const revealExpanded = revealToggle?.getAttribute("aria-expanded") === "true";

    cards.forEach((card) => {
      const statusMatches = activeStatus === "all" || card.dataset.thesisStatus === activeStatus;
      const yearMatches = activeYear === "all" || card.dataset.thesisYear === activeYear;
      const isCollapsedExtra =
        !filtersActive && card.hasAttribute("data-reveal-item") && !revealExpanded;
      const isVisible = statusMatches && yearMatches && !isCollapsedExtra;
      card.hidden = !isVisible;
      card.classList.toggle("is-filtered-out", !isVisible);
      card.setAttribute("aria-hidden", String(!isVisible));
    });
    groups.forEach((group) => {
      const hasVisibleCards = [...group.querySelectorAll("[data-thesis-student]")].some(
        (card) => !card.hidden,
      );
      group.hidden = !hasVisibleCards;
    });
    if (revealContainer) revealContainer.hidden = filtersActive;
  };

  statusButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeStatus = button.dataset.thesisStatus;
      activeYear = "all";
      if (yearLabel) i18n.setText(yearLabel, "ui.year");
      yearToggle?.classList.remove("is-active");
      updateStatusButtons();
      closeYearDropdown();
      applyThesisFilters();
    });
  });

  yearToggle?.addEventListener("click", () => {
    const willOpen = !yearDropdown.classList.contains("is-open");
    yearDropdown.classList.toggle("is-open", willOpen);
    yearToggle.setAttribute("aria-expanded", String(willOpen));
  });

  yearToggle?.addEventListener("keydown", (event) => {
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && yearButtons.length) {
      event.preventDefault();
      yearDropdown.classList.add("is-open");
      yearToggle.setAttribute("aria-expanded", "true");
      yearButtons[event.key === "ArrowDown" ? 0 : yearButtons.length - 1].focus();
    }
  });

  yearButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      activeYear = button.dataset.thesisYear;
      activeStatus = "all";
      if (yearLabel) i18n.setText(yearLabel, activeYear === "all" ? "ui.chooseYear" : "ui.selectedYear", {year: activeYear});
      yearToggle?.classList.toggle("is-active", activeYear !== "all");
      updateStatusButtons();
      closeYearDropdown();
      applyThesisFilters();
    });

    button.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeYearDropdown();
        yearToggle?.focus();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        yearButtons[(index + direction + yearButtons.length) % yearButtons.length].focus();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (yearDropdown && !yearDropdown.contains(event.target)) closeYearDropdown();
  });

  applyThesisFilters();
});

document.querySelectorAll("[data-publication-filters]").forEach((filters) => {
  const publicationContainer = filters.closest(".container");
  const cards = [...(publicationContainer?.querySelectorAll("[data-publication-card]") || [])];
  const typeButtons = [...filters.querySelectorAll("[data-publication-type]")];
  const dropdowns = [...filters.querySelectorAll("[data-publication-dropdown]")];
  const pagination = publicationContainer?.querySelector("[data-publication-pagination]");
  const results = filters.querySelector("[data-publication-results]");
  const emptyState = publicationContainer?.querySelector("[data-publication-empty]");
  const pageSize = 8;
  let activeType = "all";
  let activePeriod = "all";
  let activeYear = "all";
  let currentPage = 1;

  const applyPublicationFilters = () => {
    const currentYear = new Date().getFullYear();
    const matchingCards = cards.filter((card) => {
      const cardYear = Number(card.dataset.year);
      const typeMatches = activeType === "all" || card.dataset.category === activeType;
      const yearMatches = activeYear === "all" || card.dataset.year === activeYear;
      const periodMatches = activePeriod === "all" || cardYear >= currentYear - 2;
      return typeMatches && yearMatches && periodMatches;
    });

    const totalPages = Math.max(1, Math.ceil(matchingCards.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const firstCard = (currentPage - 1) * pageSize;
    const visibleCards = new Set(matchingCards.slice(firstCard, firstCard + pageSize));

    cards.forEach((card) => {
      card.hidden = !visibleCards.has(card);
    });

    if (results) {
      results.removeAttribute("data-i18n");
      results.textContent = t(matchingCards.length === 1 ? "ui.publicationOne" : "ui.publicationMany", {count: i18n.formatNumber(matchingCards.length)}) + (matchingCards.length ? t("ui.pageOf", {page: i18n.formatNumber(currentPage), total: i18n.formatNumber(totalPages)}) : "");
    }
    if (emptyState) emptyState.hidden = matchingCards.length > 0;

    if (pagination) {
      pagination.replaceChildren();
      pagination.hidden = totalPages <= 1 || matchingCards.length === 0;

      const addPageButton = (label, page, options = {}) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.disabled = Boolean(options.disabled);
        button.setAttribute("aria-label", options.ariaLabel || t("ui.page", {page}));
        if (page === currentPage && !options.navigation) button.setAttribute("aria-current", "page");
        button.addEventListener("click", () => {
          currentPage = page;
          applyPublicationFilters();
          filters.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "start",
          });
        });
        pagination.append(button);
      };

      addPageButton("←", Math.max(1, currentPage - 1), {
        disabled: currentPage === 1,
        ariaLabel: t("ui.previousPage"),
        navigation: true,
      });
      for (let page = 1; page <= totalPages; page += 1) addPageButton(String(page), page);
      addPageButton("→", Math.min(totalPages, currentPage + 1), {
        disabled: currentPage === totalPages,
        ariaLabel: t("ui.nextPage"),
        navigation: true,
      });
    }
  };

  const closeDropdown = (dropdown) => {
    dropdown.classList.remove("is-open");
    dropdown.querySelector("[data-publication-dropdown-toggle]")?.setAttribute("aria-expanded", "false");
  };

  typeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeType = button.dataset.publicationType;
      currentPage = 1;
      typeButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      applyPublicationFilters();
    });
  });

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector("[data-publication-dropdown-toggle]");
    const menuButtons = [...dropdown.querySelectorAll("[role='menuitem']")];

    toggle?.addEventListener("click", () => {
      const willOpen = !dropdown.classList.contains("is-open");
      dropdowns.forEach(closeDropdown);
      dropdown.classList.toggle("is-open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
    });

    toggle?.addEventListener("keydown", (event) => {
      if ((event.key === "ArrowDown" || event.key === "ArrowUp") && menuButtons.length) {
        event.preventDefault();
        dropdowns.forEach(closeDropdown);
        dropdown.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        menuButtons[event.key === "ArrowDown" ? 0 : menuButtons.length - 1].focus();
      }
    });

    menuButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        if (button.dataset.publicationPeriod) {
          activePeriod = button.dataset.publicationPeriod;
          i18n.setText(filters.querySelector("[data-publication-period-label]"), activePeriod === "all" ? "ui.allDates" : "ui.recent");
        }
        if (button.dataset.publicationYear) {
          activeYear = button.dataset.publicationYear;
          i18n.setText(filters.querySelector("[data-publication-year-label]"), activeYear === "all" ? "ui.chooseYear" : "ui.selectedYear", {year: activeYear});
        }
        currentPage = 1;
        closeDropdown(dropdown);
        applyPublicationFilters();
      });

      button.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeDropdown(dropdown);
          toggle?.focus();
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const direction = event.key === "ArrowDown" ? 1 : -1;
          menuButtons[(index + direction + menuButtons.length) % menuButtons.length].focus();
        }
      });
    });
  });

  document.addEventListener("click", (event) => {
    dropdowns.forEach((dropdown) => {
      if (!dropdown.contains(event.target)) closeDropdown(dropdown);
    });
  });

  document.addEventListener("languagechange", applyPublicationFilters);
  applyPublicationFilters();
});

document.querySelectorAll("[data-publication-toggle]").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const details = document.getElementById(toggle.getAttribute("aria-controls"));
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    toggle.closest("[data-publication-card]")?.classList.toggle("is-expanded", !expanded);
    i18n.setText(toggle.querySelector("[data-i18n]"), expanded ? "ui.showDetails" : "ui.hideDetails");
    const icon = toggle.querySelector("[data-details-icon]");
    if (icon) icon.src = siteAsset(`Imagenes/iconos/keyboard_arrow_${expanded ? "down" : "up"}_24dp_FFFFFF_FILL0_wght200_GRAD0_opsz24.svg`);
    if (details) details.hidden = expanded;
  });
});

document.querySelectorAll("[data-collaborator-filters]").forEach((filters) => {
  const section = filters.closest(".network-collaborators");
  const cards = [...(section?.querySelectorAll("[data-collaborator]") || [])];
  const buttons = [...filters.querySelectorAll("[data-collaborator-filter]")];
  const revealToggle = section?.querySelector('[data-reveal-toggle][aria-controls="collaborator-cards"]');
  const revealContainer = revealToggle?.closest(".network-more");
  const emptyState = section?.querySelector("[data-collaborator-empty]");
  let activeFilter = "all";

  const applyCollaboratorFilter = () => {
    const revealExpanded = revealToggle?.getAttribute("aria-expanded") === "true";
    let visibleCards = 0;

    cards.forEach((card) => {
      const matchesStatus = card.dataset.collaboratorStatus === activeFilter;
      const matchesScope = card.dataset.collaboratorScope === activeFilter;
      const matchesFilter = activeFilter === "all" || matchesStatus || matchesScope;
      const isCollapsedExtra =
        activeFilter === "all" && card.hasAttribute("data-reveal-item") && !revealExpanded;
      const isVisible = matchesFilter && !isCollapsedExtra;

      card.hidden = !isVisible;
      card.classList.toggle("is-filtered-out", !isVisible);
      card.setAttribute("aria-hidden", String(!isVisible));
      if (isVisible) visibleCards += 1;
    });

    if (revealContainer) revealContainer.hidden = activeFilter !== "all";
    if (emptyState) emptyState.hidden = visibleCards > 0;
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.collaboratorFilter;
      buttons.forEach((candidate) => {
        const isActive = candidate === button;
        candidate.classList.toggle("is-active", isActive);
        candidate.setAttribute("aria-pressed", String(isActive));
      });
      applyCollaboratorFilter();
    });
  });

  applyCollaboratorFilter();
});

document.querySelectorAll("[data-reveal-toggle]").forEach((toggle) => {
  const target = document.getElementById(toggle.getAttribute("aria-controls"));
  const label = toggle.querySelector("[data-reveal-label]");
  const items = target ? [...target.querySelectorAll("[data-reveal-item]")] : [];

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    const nextExpanded = !expanded;

    toggle.setAttribute("aria-expanded", String(nextExpanded));
    const revealIcon = toggle.querySelector("[data-reveal-icon]");
    if (revealIcon) revealIcon.src = siteAsset(`Imagenes/iconos/keyboard_arrow_${nextExpanded ? "up" : "down"}_24dp_A92B32_FILL0_wght200_GRAD0_opsz24.svg`);
    items.forEach((item) => {
      item.hidden = !nextExpanded;
      item.classList.toggle("is-filtered-out", !nextExpanded);
      item.setAttribute("aria-hidden", String(!nextExpanded));
    });

    if (label) {
      i18n.setText(label, label.getAttribute(nextExpanded ? "data-i18n-data-less-label" : "data-i18n-data-more-label"));
    }
  });
});

document.querySelectorAll("[data-contact-form]").forEach((form) => {
  const status = form.querySelector("[data-form-status]");
  const controls = [...form.querySelectorAll("input, select, textarea")];
  const updateValidity = control => {
    control.setCustomValidity("");
    if (control.validity.valueMissing) control.setCustomValidity(t("ui.requiredField"));
    else if (control.validity.typeMismatch) control.setCustomValidity(t("ui.invalidEmail"));
    if (control.validity.valid) control.removeAttribute("aria-invalid");
  };
  controls.forEach(control => {
    control.addEventListener("input", () => updateValidity(control));
    control.addEventListener("change", () => updateValidity(control));
    control.addEventListener("invalid", () => control.setAttribute("aria-invalid", "true"));
    updateValidity(control);
  });
  document.addEventListener("languagechange", () => controls.forEach(updateValidity));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (status) {
      i18n.setText(status, "ui.formStatus");
      status.focus();
    }
  });
});

(() => {
  const lightbox = document.querySelector("[data-results-lightbox]");
  const triggers = [...document.querySelectorAll("[data-result-lightbox-trigger]")];
  if (!lightbox || !triggers.length) return;

  const dialog = lightbox.querySelector(".detail-lightbox-dialog");
  const image = lightbox.querySelector("[data-lightbox-image]");
  const title = lightbox.querySelector("[data-lightbox-title]");
  const description = lightbox.querySelector("[data-lightbox-description]");
  const counter = lightbox.querySelector("[data-lightbox-counter]");
  const previous = lightbox.querySelector("[data-lightbox-previous]");
  const next = lightbox.querySelector("[data-lightbox-next]");
  const closeButtons = [...lightbox.querySelectorAll("[data-lightbox-close]")];
  let currentIndex = 0;
  let returnFocusTarget = null;

  const renderResult = (index) => {
    currentIndex = (index + triggers.length) % triggers.length;
    const trigger = triggers[currentIndex];
    const thumbnail = trigger.querySelector(".detail-result-media img");

    image.src = trigger.dataset.lightboxSrc || thumbnail?.src || "";
    image.alt = thumbnail?.alt || "";
    title.textContent = trigger.dataset.lightboxTitle || t("ui.preliminaryResult");
    description.textContent = trigger.dataset.lightboxDescription || "";
    counter.textContent = `${currentIndex + 1} / ${triggers.length}`;
  };

  document.addEventListener("languagechange", () => { if (!lightbox.hidden) renderResult(currentIndex); });
  const showPrevious = () => renderResult(currentIndex - 1);
  const showNext = () => renderResult(currentIndex + 1);

  const openLightbox = (trigger) => {
    returnFocusTarget = trigger;
    renderResult(triggers.indexOf(trigger));
    lightbox.hidden = false;
    document.body.classList.add("results-lightbox-open");
    requestAnimationFrame(() => lightbox.querySelector(".detail-lightbox-close")?.focus());
  };

  const closeLightbox = () => {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove("results-lightbox-open");
    image.removeAttribute("src");
    returnFocusTarget?.focus();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openLightbox(trigger));
  });

  previous?.addEventListener("click", showPrevious);
  next?.addEventListener("click", showNext);
  closeButtons.forEach((button) => button.addEventListener("click", closeLightbox));

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeLightbox();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = [
      ...lightbox.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((element) => !element.hidden);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    } else if (!lightbox.contains(document.activeElement)) {
      event.preventDefault();
      dialog?.focus();
    }
  });
})();
/* Mobile filter adapter: commit through the existing desktop controllers. */
(() => {
  const mobile = window.matchMedia('(max-width: 500px)');
  const definitions = [
    {root: '[data-publication-filters]', name: 'ui.publications', cards: '[data-publication-card]', combined: true,
      fields: [['ui.type','publicationType'], ['ui.period','publicationPeriod'], ['ui.year','publicationYear']]},
    {root: '.projects-filters[data-filter-group]', name: 'ui.projects', cards: '[data-project-card]',
      fields: [['ui.projectStatus','filter',['all','current','completed']], ['ui.year','projectYear'], ['ui.location','filter',['international']]]},
    {root: '[data-collaborator-filters]', name: 'ui.collaborators', cards: '[data-collaborator]',
      fields: [['ui.collaboratorStatus','collaboratorFilter',['all','active','inactive']], ['ui.location','collaboratorFilter',['national','international']]]},
    {root: '[data-thesis-filters]', name: 'ui.assistants', cards: '[data-thesis-student]',
      fields: [['ui.assistantStatus','thesisStatus'], ['ui.year','thesisYear']]},
  ];
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) {
      if (text.startsWith('ui.')) i18n.setText(element, text);
      else element.textContent = text;
    }
    return element;
  };
  definitions.forEach((definition, index) => {
    const root = document.querySelector(definition.root);
    if (!root) return;
    const section = root.closest('section');
    const fields = definition.fields.map(([label, key, values]) => {
      const buttons = [...root.querySelectorAll('button')].filter(button =>
        button.dataset[key] !== undefined && (!values || values.includes(button.dataset[key])));
      return {label, key, buttons};
    });
    let committed = fields.map(() => 'all');
    let draft = [...committed];
    let replaying = false;
    root.classList.add('desktop-filter-controls');
    const shell = make('div', 'mobile-filters');
    shell.setAttribute('aria-label', t('ui.filtersFor', {section: t(definition.name)}));
    const toggle = make('button', 'mobile-filter-toggle');
    toggle.type = 'button';
    // Google Material Symbols Outlined: tune (local SVG, no font dependency).
    toggle.innerHTML = '<svg viewBox="0 -960 960 960" width="24" height="24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M440-120v-240h80v80h320v80H520v80h-80ZM120-200v-80h240v80H120Zm160-160v-80H120v-80h160v-80h80v240h-80Zm160-80v-80h400v80H440Zm160-160v-240h80v80h160v80H680v80h-80ZM120-680v-80h400v80H120Z"/></svg>';
    const caption = make('span');
    const arrow = make('img', 'mobile-filter-arrow');
    const arrowPath = direction => siteAsset(`Imagenes/iconos/keyboard_arrow_${direction}_24dp_FFFFFF_FILL0_wght200_GRAD0_opsz24.svg`);
    arrow.src = arrowPath('down');
    arrow.alt = '';
    new MutationObserver(() => {
      arrow.src = arrowPath(toggle.getAttribute('aria-expanded') === 'true' ? 'up' : 'down');
    }).observe(toggle, {attributes: true, attributeFilter: ['aria-expanded']});
    arrow.setAttribute('aria-hidden','true');
    toggle.append(caption, arrow);
    const panel = make('div', 'mobile-filter-panel');
    panel.id = `mobile-filter-panel-${index}`;
    panel.hidden = true;
    toggle.setAttribute('aria-controls', panel.id);
    toggle.setAttribute('aria-expanded','false');
    const selects = fields.map((field, i) => {
      const label = make('label', 'mobile-filter-field');
      label.append(make('span', '', field.label));
      const select = make('select');
      i18n.setAttribute(select, 'aria-label', field.label);
      const allButton = field.buttons.find(button => button.dataset[field.key] === 'all');
      const allOption = new Option('', 'all');
      i18n.setText(allOption, allButton?.dataset.i18n || (field.key.toLowerCase().includes('year') ? 'ui.allYears' : 'ui.all'));
      select.append(allOption);
      field.buttons.filter(button => button.dataset[field.key] !== 'all').forEach(button => {
        const option = new Option(button.textContent.trim(), button.dataset[field.key]);
        const key = button.dataset.i18n || button.querySelector('[data-i18n]')?.dataset.i18n;
        if (key) i18n.setText(option, key);
        select.append(option);
      });
      select.addEventListener('change', () => {
        if (!definition.combined && select.value !== 'all') draft = fields.map(() => 'all');
        draft[i] = select.value;
        syncDraft();
      });
      label.append(select); panel.append(label);
      return select;
    });
    if (!definition.combined) panel.append(make('p','mobile-filter-help','ui.replaceCriterion'));
    const actions = make('div', 'mobile-filter-actions');
    const clear = make('button', 'btn btn-secondary', 'ui.clearFilters');
    const apply = make('button', 'btn btn-primary', 'ui.applyFilters');
    clear.type = apply.type = 'button';
    actions.append(clear, apply); panel.append(actions);
    const chips = make('div', 'mobile-filter-chips');
    i18n.setAttribute(chips, 'aria-label', 'ui.activeFilters');
    const status = make('p', 'mobile-filter-status');
    status.setAttribute('role','status');
    shell.append(toggle, panel, chips, status); root.before(shell);
    const cards = [...section.querySelectorAll(definition.cards)];
    const existingEmpty = section.querySelector('[data-publication-empty], [data-collaborator-empty]');
    const empty = existingEmpty || make('p', 'filter-empty-state', definition.name === 'ui.projects' ? 'ui.emptyProjects' : 'ui.emptyAssistants');
    if (!existingEmpty) { empty.hidden = true; empty.setAttribute('role','status'); root.after(empty); }
    function updateResults() {
      const results = root.querySelector('[data-publication-results]');
      const count = cards.filter(card => !card.hidden).length;
      status.textContent = results?.textContent || t('ui.resultsShown', {count: i18n.formatNumber(count)});
      if (!existingEmpty) empty.hidden = count > 0;
    }
    function syncDraft() { selects.forEach((select, i) => { select.value = draft[i]; }); }
    function close(focus = false) {
      panel.hidden = true; toggle.setAttribute('aria-expanded','false');
      if (focus) toggle.focus();
    }
    function render() {
      caption.textContent = t('ui.filters', {count: committed.filter(value => value !== 'all').length});
      chips.replaceChildren();
      committed.forEach((value, i) => {
        if (value === 'all') return;
        const text = fields[i].buttons.find(button => button.dataset[fields[i].key] === value)?.textContent.trim() || value;
        const chip = make('button', 'mobile-filter-chip', `${t(fields[i].label)}: ${text} ×`);
        chip.type = 'button'; chip.setAttribute('aria-label', t('ui.removeFilter', {label: t(fields[i].label), value: text}));
        chip.addEventListener('click', () => { draft = [...committed]; draft[i] = 'all'; commit(); toggle.focus(); });
        chips.append(chip);
      });
      syncDraft(); updateResults();
    }
    function commit() {
      const next = [...draft];
      replaying = true;
      // Existing listeners own matching, selection styles, reveal controls and pagination.
      if (definition.combined) {
        fields.forEach((field, i) => field.buttons.find(button => button.dataset[field.key] === next[i])?.click());
      } else {
        const active = next.findIndex(value => value !== 'all');
        if (active < 0) fields[0].buttons.find(button => button.dataset[fields[0].key] === 'all')?.click();
        else fields[active].buttons.find(button => button.dataset[fields[active].key] === next[active])?.click();
      }
      replaying = false;
      committed = next; draft = [...next]; render(); close(true);
    }
    toggle.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      toggle.setAttribute('aria-expanded', String(!panel.hidden));
    });
    panel.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); close(true); }
    });
    clear.addEventListener('click', () => { draft = fields.map(() => 'all'); syncDraft(); });
    apply.addEventListener('click', commit);
    root.addEventListener('click', event => {
      if (replaying) return;
      const button = event.target.closest('button');
      if (!button) return;
      const i = fields.findIndex(field => field.buttons.includes(button));
      if (i < 0) return;
      if (!definition.combined) committed = fields.map(() => 'all');
      committed[i] = button.dataset[fields[i].key];
      draft = [...committed]; render();
    });
    // Keep the mobile result announcement in sync with pagination and Show more.
    const observer = new MutationObserver(updateResults);
    cards.forEach(card => observer.observe(card, {attributes:true, attributeFilter:['hidden']}));
    const resultText = root.querySelector('[data-publication-results]');
    if (resultText) observer.observe(resultText, {childList:true, subtree:true, characterData:true});
    mobile.addEventListener('change', () => {
      const focused = shell.contains(document.activeElement);
      draft = [...committed]; close(); render();
      root.querySelectorAll('.is-open').forEach(dropdown => {
        dropdown.classList.remove('is-open');
        dropdown.querySelector('[aria-expanded]')?.setAttribute('aria-expanded','false');
      });
      if (focused && !mobile.matches) root.querySelector('button')?.focus();
      else if (mobile.matches && root.contains(document.activeElement)) toggle.focus();
    });
    document.addEventListener('languagechange', () => {
      shell.setAttribute('aria-label', t('ui.filtersFor', {section: t(definition.name)}));
      render();
    });
    render();
  });
})();
