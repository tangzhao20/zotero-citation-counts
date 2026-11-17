const assert = require("node:assert/strict");
const { test } = require("node:test");
const { loadPlugin, makeItem, work, searchResults, retrieve } = require("./helpers.cjs");

test("OpenAlex DOI lookup returns its count and source without requiring a key", async () => {
  const { plugin, requests } = loadPlugin({ responses: [{ body: work() }] });
  const result = await retrieve(plugin, makeItem({ DOI: "10.1000/cells" }));
  assert.deepEqual(Array.from(result), [12, "OpenAlex/DOI"]);
  assert.equal(requests[0].url.origin, "https://api.openalex.org");
  assert.equal(decodeURIComponent(requests[0].url.pathname), "/works/doi:10.1000/cells");
  assert.equal(requests[0].options?.headers?.Authorization, undefined);
});

test("zero citations is a successful result", async () => {
  const { plugin } = loadPlugin({ responses: [{ body: work({ cited_by_count: 0 }) }] });
  assert.equal((await retrieve(plugin, makeItem({ DOI: "10.1000/cells" })))[0], 0);
});

for (const doi of ["https://doi.org/10.1000/cells", "http://dx.doi.org/10.1000/cells", "doi: 10.1000/cells", " 10.1000/cells "]) {
  test(`normalizes DOI form: ${doi}`, async () => {
    const { plugin, requests } = loadPlugin({ responses: [{ body: work() }] });
    await retrieve(plugin, makeItem({ DOI: doi }));
    assert.equal(decodeURIComponent(requests[0].url.pathname), "/works/doi:10.1000/cells");
  });
}

test("an optional API key is sent in a header and never in the URL", async () => {
  const { plugin, requests } = loadPlugin({
    prefs: { openalexApiKey: " test-key " },
    responses: [{ body: work() }],
  });
  await retrieve(plugin, makeItem({ DOI: "10.1000/cells" }));
  assert.equal(requests[0].options.headers.Authorization, "Bearer test-key");
  assert.equal(requests[0].url.searchParams.has("api_key"), false);
});

test("title fallback stays opt-in and a missing DOI makes no request", async () => {
  const { plugin, requests } = loadPlugin();
  await assert.rejects(async () => retrieve(plugin, makeItem()), /error-no-doi$/);
  assert.equal(requests.length, 0);
});

test("missing DOI can fall back to a unique validated title", async () => {
  const { plugin, requests } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: searchResults([work()]) }],
  });
  assert.deepEqual(Array.from(await retrieve(plugin, makeItem())), [12, "OpenAlex/title"]);
  assert.equal(requests[0].url.searchParams.get("search.title"), "A study of cells");
  assert.equal(requests[0].url.searchParams.get("per_page"), "10");
});

test("a DOI not found response can fall back to title search", async () => {
  const { plugin, requests } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ status: 404 }, { body: searchResults([work()]) }],
  });
  assert.deepEqual(Array.from(await retrieve(plugin, makeItem({ DOI: "10.1000/missing" }))), [12, "OpenAlex/title"]);
  assert.equal(requests.length, 2);
});

test("a DOI not found response does not search when fallback is disabled", async () => {
  const { plugin, requests } = loadPlugin({ responses: [{ status: 404 }] });
  await assert.rejects(async () => retrieve(plugin, makeItem({ DOI: "10.1000/missing" })), /error-bad-api-response$/);
  assert.equal(requests.length, 1);
});

for (const status of [401, 403, 429, 503]) {
  test(`HTTP ${status} never falls back to title search`, async () => {
    const count = status === 401 || status === 403 ? 1 : 5;
    const { plugin, requests } = loadPlugin({
      prefs: { openalexUseTitleFallback: true },
      responses: Array.from({ length: count }, () => ({ status })),
    });
    await assert.rejects(async () => retrieve(plugin, makeItem({ DOI: "10.1000/cells" })), /error-/);
    assert.equal(requests.length, count);
    assert.ok(requests.every(({ url }) => !url.searchParams.has("search.title")));
  });
}

test("network errors are retried without falling back to title search", async () => {
  const { plugin, requests } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: Array.from({ length: 5 }, () => new Error("Network unavailable")),
  });
  await assert.rejects(async () => retrieve(plugin, makeItem({ DOI: "10.1000/cells" })), /error-bad-api-response$/);
  assert.equal(requests.length, 5);
  assert.ok(requests.every(({ url }) => !url.searchParams.has("search.title")));
});

for (const count of [undefined, null, -1, 1.5, "12", "12oops", {}]) {
  test(`rejects malformed citation count ${JSON.stringify(count)}`, async () => {
    const { plugin, requests } = loadPlugin({
      prefs: { openalexUseTitleFallback: true },
      responses: [{ body: work({ cited_by_count: count }) }],
    });
    await assert.rejects(async () => retrieve(plugin, makeItem({ DOI: "10.1000/cells" })), /error-no-citation-count$/);
    assert.equal(requests.length, 1);
  });
}

test("title search normalizes Unicode, case, and whitespace", async () => {
  const { plugin } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: searchResults([work({ title: "A study of naïve cells" })]) }],
  });
  assert.equal((await retrieve(plugin, makeItem({ title: " A   STUDY of nai\u0308ve cells " })))[0], 12);
});

test("an empty title is rejected before sending a search request", async () => {
  const { plugin, requests } = loadPlugin({ prefs: { openalexUseTitleFallback: true } });
  await assert.rejects(async () => retrieve(plugin, makeItem({ title: "  " })), /error-no-title$/);
  assert.equal(requests.length, 0);
});

test("search text with ampersands and commas stays inside the title parameter", async () => {
  const title = "Cells & genes, a study";
  const { plugin, requests } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: searchResults([work({ title })]) }],
  });
  await retrieve(plugin, makeItem({ title }));
  assert.equal(requests[0].url.searchParams.get("search.title"), title);
});

test("no title results reports no match", async () => {
  const { plugin } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: searchResults([]) }],
  });
  await assert.rejects(async () => retrieve(plugin, makeItem()), /error-no-title-match$/);
});

test("invalid search payload is rejected", async () => {
  const { plugin } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: { message: "invalid" } }],
  });
  await assert.rejects(async () => retrieve(plugin, makeItem()), /error-bad-api-response$/);
});

test("a unique exact title is accepted without checking publication year", async () => {
  const { plugin } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: searchResults([work()]) }],
  });
  const result = await retrieve(plugin, makeItem({ date: "2020-05-01" }));
  assert.deepEqual(Array.from(result), [12, "OpenAlex/title"]);
});

test("title-only matching does not read creator metadata", async () => {
  const { plugin } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: searchResults([work()]) }],
  });
  const item = makeItem();
  item.getCreators = () => { throw new Error("Title matching must not read creators"); };
  const result = await retrieve(plugin, item);
  assert.deepEqual(Array.from(result), [12, "OpenAlex/title"]);
});

test("same-title works remain ambiguous even when their publication years differ", async () => {
  const { plugin } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: searchResults([
      work({ id: "https://openalex.org/W1111111111", publication_year: 2020, cited_by_count: 100 }),
      work(),
    ]) }],
  });
  const result = await retrieve(plugin, makeItem({ date: "2024" }));
  assert.equal(result.candidates.length, 2);
});

test("multiple exact title matches are left for user selection", async () => {
  const { plugin } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: searchResults([work(), work({ id: "https://openalex.org/W2222222222" })]) }],
  });
  assert.equal((await retrieve(plugin, makeItem())).candidates.length, 2);
});

test("a merely similar title is never silently accepted", async () => {
  const { plugin } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: searchResults([work({ title: "A study of cells in mice" })]) }],
  });
  assert.equal((await retrieve(plugin, makeItem())).candidates.length, 1);
});

test("mathematical symbols in a title cannot be discarded to make an exact match", async () => {
  const { plugin } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: searchResults([work({ title: "C methods for cells" })]) }],
  });
  const result = await retrieve(plugin, makeItem({ title: "C++ methods for cells" }));
  assert.equal(result.candidates?.length, 1);
});

test("scientific inequalities are not mistaken for HTML markup in titles", async () => {
  const { plugin } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: searchResults([work({ title: "Effects at p 0.1" })]) }],
  });
  const result = await retrieve(plugin, makeItem({ title: "Effects at p < 0.05 and q > 0.1" }));
  assert.equal(result.candidates?.length, 1);
});

for (const [title, candidate] of [
  ["C# methods for cells", "C methods for cells"],
  ["Effects at -5 degrees", "Effects at 5 degrees"],
]) {
  test(`title matching preserves meaningful punctuation: ${title}`, async () => {
    const { plugin } = loadPlugin({
      prefs: { openalexUseTitleFallback: true },
      responses: [{ body: searchResults([work({ title: candidate })]) }],
    });
    const result = await retrieve(plugin, makeItem({ title }));
    assert.equal(result.candidates?.length, 1);
  });
}

test("duplicate work IDs do not manufacture ambiguity", async () => {
  const { plugin } = loadPlugin({
    prefs: { openalexUseTitleFallback: true },
    responses: [{ body: searchResults([work(), work()]) }],
  });
  assert.deepEqual(Array.from(await retrieve(plugin, makeItem())), [12, "OpenAlex/title"]);
});

for (const [key, body, source] of [
  ["crossref", { "is-referenced-by-count": 7 }, "Crossref/DOI"],
  ["inspire", { metadata: { citation_count: 7 } }, "INSPIRE-HEP/DOI"],
  ["semanticscholar", { citationCount: 7 }, "Semantic Scholar/DOI"],
]) {
  test(`${key} keeps its existing DOI lookup behavior`, async () => {
    const { plugin } = loadPlugin({ responses: [{ body }] });
    assert.deepEqual(Array.from(await retrieve(plugin, makeItem({ DOI: "10.1000/cells" }), key)), [7, source]);
  });
}
