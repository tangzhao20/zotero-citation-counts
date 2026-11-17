const assert = require("node:assert/strict");
const { test } = require("node:test");
const { loadPlugin, makeItem, work, searchResults } = require("./helpers.cjs");

function ambiguousResults() {
  return searchResults([work(), work({ id: "https://openalex.org/W2222222222", cited_by_count: 77 })]);
}

test("all lookups and confirmed saves precede the first candidate dialog", async () => {
  const events = [];
  const pending = makeItem({ extra: "Notes: keep this" });
  const certain = makeItem({ DOI: "10.1000/cells" });
  certain.onSave = async () => {
    await Promise.resolve();
    events.push("save:doi");
  };
  pending.onSave = async () => { events.push("save:title"); };
  const { plugin } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: ambiguousResults() }, { body: work() }],
    onRequest: ({ url }) => events.push(url.searchParams.has("search.title") ? "request:title" : "request:doi"),
    onDialog: (io) => {
      events.push("dialog");
      io.selectedIndex = 1;
    },
  });
  await plugin.updateItems([pending, certain], plugin.APIs.find((api) => api.key === "openalex"));
  assert.deepEqual(events, ["request:title", "request:doi", "save:doi", "dialog", "save:title"]);
  assert.match(pending.getField("extra"), /^77 citations \(OpenAlex\/title\) \[\d{4}-\d{2}-\d{2}\]\nNotes: keep this$/);
  assert.match(certain.getField("extra"), /^12 citations \(OpenAlex\/DOI\)/);
});

test("leaving dialog output unset preserves Extra without saving", async () => {
    const original = "57 citations (Crossref/DOI) [2024-01-01]\nNotes: keep this";
    const item = makeItem({ extra: original });
    let dialogs = 0;
    const { plugin } = loadPlugin({
      prefs: { openalexUseTitleFallback: true },
      responses: [{ body: ambiguousResults() }],
      onDialog: () => { dialogs++; },
    });
    await plugin.updateItems([item], plugin.APIs.find((api) => api.key === "openalex"));
    assert.equal(dialogs, 1);
    assert.equal(item.getField("extra"), original);
    assert.equal(item.saves, 0);
});

test("skipping a pending item still allows later pending items to be selected", async () => {
  const first = makeItem({ extra: "Keep first unchanged" });
  const second = makeItem({ extra: "Keep second notes" });
  const titles = [];
  const { plugin } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: ambiguousResults() }, { body: ambiguousResults() }],
    onDialog: (io) => {
      titles.push(io.itemTitle);
      if (titles.length === 2) io.selectedIndex = 0;
    },
  });
  await plugin.updateItems([first, second], plugin.APIs.find((api) => api.key === "openalex"));
  assert.equal(titles.length, 2);
  assert.equal(first.getField("extra"), "Keep first unchanged");
  assert.equal(first.saves, 0);
  assert.equal(second.saves, 1);
  assert.match(second.getField("extra"), /^12 citations \(OpenAlex\/title\)/);
});

test("background retrieval does not open dialogs and still updates DOI matches", async () => {
  const pending = makeItem({ extra: "Keep unchanged" });
  const certain = makeItem({ DOI: "10.1000/cells" });
  let dialogs = 0;
  const { plugin, windows } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: ambiguousResults() }, { body: work() }],
    onDialog: () => { dialogs++; },
  });
  await plugin.updateItems([pending, certain], plugin.APIs.find((api) => api.key === "openalex"), { interactive: false });
  assert.equal(dialogs, 0);
  assert.equal(pending.getField("extra"), "Keep unchanged");
  assert.equal(pending.saves, 0);
  assert.equal(certain.saves, 1);
  assert.ok(windows[0].rows.some((row) => row.title === "citationcounts-progresswindow-selection-required"));
});

test("DOI lookup errors preserve previous counts and do not prevent later updates", async () => {
  const failed = makeItem({ DOI: "10.1000/missing", extra: "57 citations (Crossref/DOI) [2024-01-01]" });
  const certain = makeItem({ DOI: "10.1000/cells" });
  const { plugin } = loadPlugin({ responses: [{ status: 404 }, { body: work({ cited_by_count: 0 }) }] });
  await plugin.updateItems([failed, certain], plugin.APIs.find((api) => api.key === "openalex"));
  assert.equal(failed.getField("extra"), "57 citations (Crossref/DOI) [2024-01-01]");
  assert.equal(failed.saves, 0);
  assert.equal(certain.saves, 1);
  assert.equal(String(plugin.getCitationCount(certain)), "0");
});

test("out-of-range dialog output cannot overwrite an item's count", async () => {
  const item = makeItem({ extra: "Keep unchanged" });
  let dialogs = 0;
  const { plugin } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: ambiguousResults() }],
    onDialog: (io) => { dialogs++; io.selectedIndex = 100; },
  });
  await plugin.updateItems([item], plugin.APIs.find((api) => api.key === "openalex"));
  assert.equal(dialogs, 1);
  assert.equal(item.saves, 0);
  assert.equal(item.getField("extra"), "Keep unchanged");
});
