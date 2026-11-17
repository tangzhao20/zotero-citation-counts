window.addEventListener("load", () => {
  const argument = window.arguments[0];
  const io = argument.wrappedJSObject || argument;
  const namespace = "http://www.w3.org/1999/xhtml";
  const list = document.getElementById("openalex-candidates");
  document.getElementById("openalex-item-title").textContent = io.itemTitle;

  for (let index = 0; index <= io.candidates.length; index++) {
    const work = io.candidates[index];
    const label = document.createElementNS(namespace, "label");
    label.setAttribute("class", "openalex-candidate");
    const radio = document.createElementNS(namespace, "input");
    radio.type = "radio";
    radio.name = "openalex-work";
    radio.value = work ? String(index) : "-1";
    label.appendChild(radio);

    const content = document.createElementNS(namespace, "div");
    const title = document.createElementNS(namespace, "div");
    title.setAttribute("class", "openalex-candidate-title");
    content.appendChild(title);
    if (work) {
      title.textContent = work.title;
      const authors = (work.authorships || []).slice(0, 3)
        .map((entry) => entry.author?.display_name).filter(Boolean).join(", ");
      const details = document.createElementNS(namespace, "div");
      details.setAttribute("class", "openalex-candidate-details");
      document.l10n.setAttributes(details, "citationcounts-openalex-candidate-details", {
        authors: authors || "—",
        year: work.publication_year || "—",
        doi: work.doi || "—",
        count: work.cited_by_count,
      });
      content.appendChild(details);
    } else {
      document.l10n.setAttributes(title, "citationcounts-openalex-select-none");
      radio.checked = true;
    }
    label.appendChild(content);
    list.appendChild(label);
    if (!work) radio.focus();
  }

  document.addEventListener("dialogaccept", () => {
    const index = Number(document.querySelector("input[name='openalex-work']:checked")?.value);
    io.selectedIndex = Number.isInteger(index) && index >= 0 && index < io.candidates.length
      ? index
      : null;
  });
}, { once: true });
