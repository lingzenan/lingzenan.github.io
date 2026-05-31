const root = document.querySelector("#publications-root");

const conferenceVenues = [
  "advances in neural information processing systems",
  "neurips",
  "international conference on machine learning",
  "icml",
  "international conference on learning representations",
  "iclr",
  "conference on computer vision and pattern recognition",
  "cvpr",
  "international conference on computer vision",
  "iccv",
  "association for computational linguistics",
  "acl",
];

const escapeHtml = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const stripBraces = (value) =>
  String(value || "")
    .trim()
    .replace(/^["{]+|["}]+$/g, "")
    .replace(/[{}]/g, "");

const splitTopLevel = (value, delimiter = ",") => {
  const parts = [];
  let depth = 0;
  let quote = false;
  let start = 0;

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (char === '"' && value[i - 1] !== "\\") quote = !quote;
    if (!quote && char === "{") depth += 1;
    if (!quote && char === "}") depth -= 1;
    if (!quote && depth === 0 && char === delimiter) {
      parts.push(value.slice(start, i));
      start = i + 1;
    }
  }

  parts.push(value.slice(start));
  return parts.map((part) => part.trim()).filter(Boolean);
};

const parseEntries = (bibtex) => {
  const entries = [];
  let index = 0;

  while (index < bibtex.length) {
    const at = bibtex.indexOf("@", index);
    if (at === -1) break;

    const typeMatch = bibtex.slice(at).match(/^@([a-zA-Z]+)\s*[{(]/);
    if (!typeMatch) {
      index = at + 1;
      continue;
    }

    const type = typeMatch[1].toLowerCase();
    const open = at + typeMatch[0].length - 1;
    const closeChar = bibtex[open] === "(" ? ")" : "}";
    let depth = 0;
    let quote = false;
    let close = -1;

    for (let i = open; i < bibtex.length; i += 1) {
      const char = bibtex[i];
      if (char === '"' && bibtex[i - 1] !== "\\") quote = !quote;
      if (!quote && char === bibtex[open]) depth += 1;
      if (!quote && char === closeChar) depth -= 1;
      if (depth === 0) {
        close = i;
        break;
      }
    }

    if (close === -1) break;

    const body = bibtex.slice(open + 1, close);
    const [key, ...fieldParts] = splitTopLevel(body);
    const fields = {};

    for (const part of fieldParts) {
      const equals = part.indexOf("=");
      if (equals === -1) continue;
      const name = part.slice(0, equals).trim().toLowerCase();
      const value = stripBraces(part.slice(equals + 1));
      fields[name] = value;
    }

    entries.push({ type, key: key.trim(), fields });
    index = close + 1;
  }

  return entries;
};

const formatAuthor = (author) => {
  const clean = stripBraces(author);
  if (clean.includes(",")) {
    const [last, first] = clean.split(",").map((part) => part.trim());
    return [first, last].filter(Boolean).join(" ");
  }
  return clean;
};

const formatAuthors = (authors) =>
  String(authors || "")
    .split(/\s+and\s+/i)
    .map(formatAuthor)
    .map((author) =>
      author.toLowerCase() === "zenan ling"
        ? "<strong>Zenan Ling</strong>"
        : escapeHtml(author),
    )
    .join(", ");

const venueFor = (entry) =>
  entry.fields.booktitle || entry.fields.journal || entry.fields.publisher || "";

const isConference = (entry) => {
  const type = entry.type.toLowerCase();
  const venue = venueFor(entry).toLowerCase();

  if (["inproceedings", "conference", "proceedings"].includes(type)) return true;
  return conferenceVenues.some((name) => venue.includes(name));
};

const renderEntry = (entry) => {
  const fields = entry.fields;
  const authors = formatAuthors(fields.author);
  const title = escapeHtml(fields.title);
  const venue = escapeHtml(venueFor(entry));
  const year = escapeHtml(fields.year);

  return `
    <li>
      ${authors}. ${title}.
      <span class="publication-venue"><em>${venue}</em>${year ? `, ${year}` : ""}.</span>
    </li>
  `;
};

const renderGroup = (title, entries) => {
  const sorted = [...entries].sort(
    (a, b) => Number(b.fields.year || 0) - Number(a.fields.year || 0),
  );

  if (!sorted.length) {
    return `<h2>${title}</h2><p class="publication-status">No publications yet.</p>`;
  }

  return `
    <h2>${title}</h2>
    <ol class="publication-list">
      ${sorted.map(renderEntry).join("")}
    </ol>
  `;
};

fetch(window.PUBLICATIONS_BIB_URL)
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  })
  .then((bibtex) => {
    const entries = parseEntries(bibtex);
    const conferences = entries.filter(isConference);
    const journals = entries.filter((entry) => !isConference(entry));

    root.classList.remove("publication-status");
    root.innerHTML = [
      renderGroup("Conference", conferences),
      renderGroup("Journals", journals),
    ].join("");
  })
  .catch(() => {
    root.textContent = "Publications could not be loaded.";
  });
