const faqs = [
  {
    question: "What time should I arrive?",
    answer:
      "Seating will open one hour before the ceremony. We recommend arriving 20–30 minutes early to allow time for parking, finding your seat, and getting settled. The ceremony will begin promptly at 7:00 PM, with dinner to follow.",
  },
  {
    question: "What should I wear?",
    answer:
      "We would love for our guests to dress in formal or cocktail attire. Think elegant evening dresses, suits, dress shirts, or similar attire. As part of the celebration will take place outdoors, we recommend choosing shoes that are comfortable on grass.",
  },
  {
    question: "Where can I park?",
    answer:
      "Street parking will be available along the surrounding neighborhood streets. We kindly ask that you park considerately, keeping driveways, mailboxes, and neighboring entrances clear. We recommend arriving a little early to allow time to find parking and make your way to the ceremony.",
  },
  {
    question: "Can I bring a guest?",
    answer:
      "Our celebration is an intimate one, so we are able to accommodate only the guests named on your invitation. If you have been invited to bring a guest, you may include their name when completing your RSVP.",
  },
  {
    question: "Will the ceremony be outdoors?",
    answer:
      "Yes! Our ceremony will take place outdoors in the backyard, with dinner following afterward. December evenings in Louisiana can be cool, so we recommend bringing a light coat or wrap and checking the weather before arriving.",
  },
  {
    question: "When should I RSVP by?",
    answer:
      "Please RSVP by December 10, 2026. If we have not received your RSVP by this date, we will unfortunately have to mark you as not attending so that we can finalize arrangements with our vendors.",
  },
  {
    question: "Will dinner be served?",
    answer:
      "Yes! Dinner will be served following the ceremony. We look forward to sharing a meal with all of our family and friends as we celebrate together.",
  },
  {
    question: "Can I take photos during the ceremony?",
    answer:
      "We kindly ask that you keep phones and cameras put away during the ceremony so that everyone can be fully present with us. You are more than welcome to take photos before and after the ceremony!",
  },
];

const list = document.querySelector("#faq-list");

if (list) faqs.forEach((item, index) => {
  const id = `faq-answer-${index}`;
  const article = document.createElement("article");
  article.className = "faq-item";
  if (item.open && item.answer) {
    article.classList.add("is-open");
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "faq-question";
  button.setAttribute("aria-expanded", article.classList.contains("is-open") ? "true" : "false");
  button.setAttribute("aria-controls", id);

  const label = document.createElement("span");
  label.textContent = item.question;

  const icon = document.createElement("img");
  icon.className = "chevron";
  icon.src = "assets/chevron.svg";
  icon.alt = "";
  icon.width = 19;
  icon.height = 11;

  button.append(label, icon);

  const answer = document.createElement("p");
  answer.className = "faq-answer";
  answer.id = id;
  answer.textContent = item.answer;

  button.addEventListener("click", () => {
    const open = article.classList.toggle("is-open");
    button.setAttribute("aria-expanded", open ? "true" : "false");
  });

  article.append(button, answer);
  list.append(article);
});

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");

function setMenuOpen(open) {
  if (!siteNav || !navToggle) return;
  siteNav.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
}

const siteHeader = document.querySelector(".site-header");

const phoneNavQuery = window.matchMedia("(max-width: 800px)");

function layoutNav() {
  if (!siteHeader || !siteNav) return;

  if (phoneNavQuery.matches) {
    siteHeader.classList.add("is-compact");
    return;
  }

  siteHeader.classList.remove("is-compact");
  const styles = getComputedStyle(siteHeader);
  const padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
  const gap = parseFloat(styles.columnGap) || parseFloat(styles.gap) || 0;
  const logo = siteHeader.querySelector(".logo-link");
  const needed = (logo ? logo.offsetWidth : 0) + gap + siteNav.scrollWidth + padding;
  const compact = needed > siteHeader.clientWidth - 8;
  siteHeader.classList.toggle("is-compact", compact);
  if (!compact) setMenuOpen(false);
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    setMenuOpen(navToggle.getAttribute("aria-expanded") !== "true");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  layoutNav();
  window.addEventListener("resize", layoutNav);
  phoneNavQuery.addEventListener("change", layoutNav);
  if (document.fonts) document.fonts.ready.then(layoutNav);
}

document.addEventListener("click", (event) => {
  const control = event.target.closest("a, button, .photo-add-button");
  if (!control) return;
  window.setTimeout(() => {
    const field = control.matches(".photo-add-button") ? control.querySelector("input") : null;
    if (field) field.blur();
    control.blur();
  }, 0);
});

const rsvpForm = document.querySelector("#rsvp-form");

if (rsvpForm) {
  const guestInput = rsvpForm.querySelector("#guest-count");
  const guestField = rsvpForm.querySelector(".guest-field");
  const decrement = rsvpForm.querySelector("[data-step='-1']");
  const increment = rsvpForm.querySelector("[data-step='1']");
  const submitButton = rsvpForm.querySelector(".rsvp-submit");
  const status = document.querySelector("#form-status");
  const thanks = document.querySelector("#rsvp-thanks");
  const thanksDetail = document.querySelector("#thanks-detail");
  const rsvpLead = document.querySelector(".rsvp-lead");
  const rsvpTitle = document.querySelector("#rsvp-title");
  const maxGuests = 10;

  const guestCount = () => {
    const value = guestInput.value.trim();
    return value === "" ? 0 : Number(value);
  };

  const setGuestCount = (value) => {
    const next = Math.max(0, Math.min(maxGuests, value));
    guestInput.value = next === 0 ? "" : String(next);
  };

  decrement.addEventListener("click", () => setGuestCount(guestCount() - 1));
  increment.addEventListener("click", () => {
    const current = guestCount();
    setGuestCount(current === 0 ? 1 : current + 1);
  });

  guestInput.addEventListener("input", () => {
    const digits = guestInput.value.replace(/\D/g, "");
    if (digits === "") {
      guestInput.value = "";
      return;
    }
    setGuestCount(Number(digits));
  });

  const syncGuestField = () => {
    const selected = rsvpForm.querySelector("input[name='attending']:checked");
    const declining = selected && selected.value === "Regretfully declines";
    guestField.classList.toggle("is-disabled", Boolean(declining));
    guestInput.disabled = Boolean(declining);
    decrement.disabled = Boolean(declining);
    increment.disabled = Boolean(declining);
    if (declining) guestInput.value = "";
  };

  rsvpForm.querySelectorAll("input[name='attending']").forEach((input) => {
    input.addEventListener("change", syncGuestField);
  });

  const showError = (id, message) => {
    const error = document.querySelector(`#${id}`);
    error.textContent = message;
  };

  const clearErrors = () => {
    rsvpForm.querySelectorAll(".field-error").forEach((error) => {
      error.textContent = "";
    });
    status.textContent = "";
  };

  rsvpForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();

    const name = rsvpForm.name.value.trim();
    const attending = rsvpForm.querySelector("input[name='attending']:checked");
    const guests = guestInput.value.trim();
    let valid = true;

    if (!name) {
      showError("name-error", "Please enter your first and last name.");
      valid = false;
    }

    if (!attending) {
      showError("attending-error", "Please let us know if you will be attending.");
      valid = false;
    }

    const accepting = attending && attending.value === "Joyfully accepts";
    if (accepting && (!guests || Number(guests) < 1)) {
      showError("guests-error", "Please include how many guests will be attending.");
      valid = false;
    }

    if (!valid) return;

    const data = new FormData(rsvpForm);
    data.set("name", name);
    data.set("attending", attending.value);
    data.set("guests", accepting ? guests : "0");
    data.set("_subject", `Wedding RSVP from ${name}`);

    submitButton.disabled = true;
    submitButton.textContent = "SENDING";

    try {
      const response = await fetch(rsvpForm.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        status.textContent = "We could not send your RSVP. Please try again in a moment.";
        return;
      }

      rsvpForm.hidden = true;
      rsvpLead.hidden = true;
      rsvpTitle.hidden = true;
      thanksDetail.textContent = accepting
        ? "We are so glad you will be joining us."
        : "You will be missed, and we are grateful you let us know.";
      thanks.hidden = false;
      thanks.focus();
    } catch {
      status.textContent = "We could not send your RSVP. Please check your connection and try again.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "SUBMIT";
    }
  });
}

const photoSettings = window.WEDDING_PHOTOS || { api: "" };

function photoApi(path) {
  const base = String(photoSettings.api || "").replace(/\/$/, "");
  return base ? `${base}${path}` : "";
}

function photoUrl(id) {
  return photoApi(`/api/photos/${id}`);
}

function setPhotoStatus(message, isError) {
  const status = document.querySelector("#photo-status");
  if (!status) return;
  status.textContent = message || "";
  status.classList.toggle("is-error", Boolean(isError && message));
}

function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const source = URL.createObjectURL(file);
    image.onload = () => {
      const longest = Math.max(image.width, image.height);
      const scale = Math.min(1, 2000 / longest);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(source);
          if (blob) resolve(blob);
          else reject(new Error("compress"));
        },
        "image/jpeg",
        0.82
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(source);
      reject(new Error("read"));
    };
    image.src = source;
  });
}

async function loadAlbum() {
  const grid = document.querySelector("#photo-grid");
  const empty = document.querySelector("#photo-empty");
  if (!grid || document.querySelector("#manage-form")) return;

  const api = photoApi("/api/photos");
  if (!api) {
    grid.hidden = true;
    if (empty) empty.hidden = false;
    return;
  }

  try {
    const response = await fetch(api);
    if (!response.ok) throw new Error("load");
    const data = await response.json();
    const photos = Array.isArray(data.photos) ? data.photos : [];
    grid.replaceChildren();
    photos.forEach((photo) => {
      const figure = document.createElement("figure");
      figure.className = "shot";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "shot-open";
      button.setAttribute("aria-label", "View photo");
      const image = document.createElement("img");
      image.src = photoUrl(photo.id);
      image.alt = "A photo from the celebration";
      button.append(image);
      button.addEventListener("click", () => openPhoto(photo.id));
      figure.append(button);
      grid.append(figure);
    });
    const hasPhotos = photos.length > 0;
    grid.hidden = !hasPhotos;
    if (empty) empty.hidden = hasPhotos;
  } catch {
    if (empty) empty.hidden = false;
    setPhotoStatus("The album could not be loaded. Please try again in a moment.", true);
  }
}

const photoView = document.querySelector("#photo-view");
const photoViewImage = document.querySelector("#photo-view-img");
const photoSave = document.querySelector("#photo-save");
const photoClose = document.querySelector("#photo-view-close");

function openPhoto(id) {
  if (!photoView || !photoViewImage) return;
  photoViewImage.src = photoUrl(id);
  photoViewImage.alt = "A photo from the celebration";
  photoView.showModal();
}

if (photoClose && photoView) {
  photoClose.addEventListener("click", () => photoView.close());
  photoView.addEventListener("click", (event) => {
    if (event.target === photoView) photoView.close();
  });
}

if (photoSave && photoViewImage) {
  photoSave.addEventListener("click", async () => {
    try {
      const response = await fetch(photoViewImage.src);
      if (!response.ok) throw new Error("save");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "wedding-photo.jpg";
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(photoViewImage.src, "_blank", "noopener");
    }
  });
}

const photoFile = document.querySelector("#photo-file");

if (photoFile) {
  photoFile.addEventListener("change", async () => {
    const file = photoFile.files && photoFile.files[0];
    photoFile.value = "";
    if (!file) return;

    const label = photoFile.closest(".photo-add-button");
    const labelText = label ? label.querySelector("span") : null;
    const api = photoApi("/api/photos");
    if (!api) {
      setPhotoStatus("Photo saving will open once the storage account is connected.", true);
      return;
    }

    if (label) label.classList.add("is-busy");
    if (labelText) labelText.textContent = "ADDING";
    photoFile.disabled = true;
    setPhotoStatus("");

    try {
      const prepared = await compressPhoto(file);
      const response = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: prepared,
      });
      if (!response.ok) throw new Error("upload");
      const thanks = document.querySelector("#upload-thanks");
      if (thanks) {
        if (label) label.hidden = true;
        thanks.hidden = false;
        thanks.textContent = "Thank you. Your photo is in the album.";
        const albumLink = document.createElement("a");
        albumLink.href = "photos.html";
        albumLink.textContent = "See the album";
        thanks.append(document.createElement("br"), albumLink);
      } else {
        setPhotoStatus("Your photo is in the album.");
        await loadAlbum();
      }
    } catch (error) {
      const unread = error && error.message === "read";
      setPhotoStatus(
        unread
          ? "That photo could not be read. Please choose a JPEG or PNG."
          : "We could not add that photo. Please try again.",
        true
      );
    } finally {
      photoFile.disabled = false;
      if (label) label.classList.remove("is-busy");
      if (labelText && !label.hidden) labelText.textContent = "ADD A PHOTO";
    }
  });
}

const manageForm = document.querySelector("#manage-form");

if (manageForm) {
  const grid = document.querySelector("#photo-grid");
  const keyInput = document.querySelector("#manage-key");
  let albumKey = "";

  const renderManage = (photos) => {
    grid.replaceChildren();
    photos.forEach((photo) => {
      const figure = document.createElement("figure");
      figure.className = "shot";
      const image = document.createElement("img");
      image.src = photoUrl(photo.id);
      image.alt = "A photo from the celebration";
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "shot-remove";
      remove.textContent = "REMOVE";
      remove.addEventListener("click", async () => {
        if (remove.textContent !== "REMOVE?") {
          remove.textContent = "REMOVE?";
          return;
        }
        remove.disabled = true;
        const response = await fetch(photoUrl(photo.id), {
          method: "DELETE",
          headers: { "x-admin-key": albumKey },
        });
        if (!response.ok) {
          remove.disabled = false;
          remove.textContent = "REMOVE";
          setPhotoStatus("That photo could not be removed. Please try again.", true);
          return;
        }
        figure.remove();
        if (!grid.children.length) grid.hidden = true;
        setPhotoStatus("Removed from the album.");
      });
      figure.append(image, remove);
      grid.append(figure);
    });
    grid.hidden = photos.length === 0;
    if (!photos.length) setPhotoStatus("The album is empty.");
  };

  manageForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const api = photoApi("/api/photos");
    if (!api) {
      setPhotoStatus("Photo saving will open once the storage account is connected.", true);
      return;
    }
    albumKey = keyInput.value;
    setPhotoStatus("");
    const unlock = await fetch(photoApi("/api/unlock"), {
      method: "POST",
      headers: { "x-admin-key": albumKey },
    });
    if (!unlock.ok) {
      setPhotoStatus("That password did not open the album.", true);
      return;
    }
    const response = await fetch(api);
    if (!response.ok) {
      setPhotoStatus("The album could not be loaded. Please try again in a moment.", true);
      return;
    }
    const data = await response.json();
    manageForm.hidden = true;
    renderManage(Array.isArray(data.photos) ? data.photos : []);
  });
}

if (document.querySelector("#photo-grid") && !manageForm) loadAlbum();
