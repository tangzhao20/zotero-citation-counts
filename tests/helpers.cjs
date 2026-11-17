const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function makeItem(fields = {}) {
  return {
    itemType: "journalArticle",
    fields: { title: "A study of cells", ...fields },
    saves: 0,
    getField(name) { return this.fields[name] || ""; },
    setField(name, value) { this.fields[name] = value; },
    async saveTx() {
      this.saves++;
      await this.onSave?.();
    },
  };
}

function work(overrides = {}) {
  return {
    id: "https://openalex.org/W1234567890",
    title: "A study of cells",
    doi: "https://doi.org/10.1000/cells",
    publication_year: 2024,
    cited_by_count: 12,
    authorships: [{
      author: { id: "https://openalex.org/A1234567890", display_name: "Jane Smith" },
      raw_author_name: "Jane Smith",
    }],
    ...overrides,
  };
}

function searchResults(results) {
  return { meta: { count: results.length, page: 1, per_page: 10 }, results };
}

function loadPlugin({ prefs = {}, responses = [], onRequest, onDialog } = {}) {
  const storedPrefs = new Map();
  const requests = [];
  const windows = [];
  const logs = [];

  function ProgressWindow() {
    this.rows = [];
    this.headlines = [];
    windows.push(this);
    const rows = this.rows;
    this.ItemProgress = function (icon, title, parent) {
      this.title = title;
      this.parent = parent;
      this.setProgress = (value) => { this.progress = value; };
      this.setError = () => { this.error = true; };
      rows.push(this);
    };
  }
  ProgressWindow.prototype.changeHeadline = function (title) { this.headlines.push(title); };
  ProgressWindow.prototype.show = function () {};
  ProgressWindow.prototype.startCloseTimer = function () { this.finished = true; };

  const context = vm.createContext({
    URL,
    console,
    setTimeout: (callback) => { queueMicrotask(callback); },
    Localization: class {
      async formatValue(id) { return id; }
    },
    pref: (name, value) => storedPrefs.set(name, value),
    Zotero: {
      debug: (message) => logs.push(message),
      Prefs: {
        get: (name) => storedPrefs.get(name),
        set: (name, value) => storedPrefs.set(name, value),
      },
      ProgressWindow,
      getMainWindow: () => ({
        openDialog: (url, name, features, io) => {
          onDialog?.(io, { url, name, features });
        },
      }),
    },
    fetch: async (url, options) => {
      const request = { url: new URL(url), options };
      requests.push(request);
      onRequest?.(request);
      if (!responses.length) throw new Error("Unexpected HTTP request");
      const response = responses.shift();
      if (response instanceof Error) throw response;
      const status = response.status || 200;
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => response.body,
      };
    },
  });
  vm.runInContext(fs.readFileSync(path.join(root, "prefs.js"), "utf8"), context);
  for (const [name, value] of Object.entries(prefs)) {
    storedPrefs.set("extensions.citationcounts." + name, value);
  }
  vm.runInContext(fs.readFileSync(path.join(root, "zoterocitationcounts.js"), "utf8"), context);
  const plugin = context.ZoteroCitationCounts;
  plugin.init({ id: "test-plugin", version: "test", rootURI: "file:///test/" });
  return { plugin, requests, windows, logs, context };
}

function retrieve(plugin, item, providerKey = "openalex") {
  const api = plugin.APIs.find((api) => api.key === providerKey);
  if (!api) throw new Error(`Provider ${providerKey} is not registered`);
  return plugin._retrieveCitationCount(
    item, api.name, api.useDoi, api.useArxiv,
    api.methods.urlBuilder, api.methods.responseCallback
  );
}

module.exports = { loadPlugin, makeItem, work, searchResults, retrieve, root };
