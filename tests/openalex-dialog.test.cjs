const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const { root, work } = require("./helpers.cjs");

function loadDialog(candidates = [work(), work({ id: "https://openalex.org/W2222222222" })]) {
  const nodes = [];
  const listeners = new Map();
  function element(tag) {
    const result = {
      tag, children: [], attributes: {}, checked: false,
      appendChild(child) { this.children.push(child); return child; },
      setAttribute(name, value) { this.attributes[name] = String(value); },
      focus() {},
    };
    nodes.push(result);
    return result;
  }
  const elements = {
    "openalex-item-title": element("div"),
    "openalex-candidates": element("div"),
  };
  const document = {
    getElementById: (id) => elements[id],
    createElementNS: (ns, tag) => element(tag),
    addEventListener: (name, callback) => listeners.set(name, callback),
    querySelector: (selector) => {
      const name = selector.match(/\[name=['"]([^'"]+)['"]\]/)?.[1];
      return nodes.find((node) => node.tag === "input" && node.name === name && node.checked) || null;
    },
    l10n: {
      setAttributes: (node, id, args) => {
        node.setAttribute("data-l10n-id", id);
        node.l10nArgs = args;
      },
    },
  };
  const io = { itemTitle: "Local title", candidates, selectedIndex: null };
  const context = vm.createContext({
    document,
    window: { arguments: [io], addEventListener: (name, callback) => listeners.set(name, callback) },
  });
  vm.runInContext(fs.readFileSync(path.join(root, "openalex-select.js"), "utf8"), context);
  listeners.get("load")();
  const radios = nodes.filter((node) => node.tag === "input");
  return {
    io, radios, nodes,
    choose(value) { for (const radio of radios) radio.checked = radio.value === String(value); },
    accept() { listeners.get("dialogaccept")(); },
    cancel() { listeners.get("dialogcancel")?.(); },
    close() { listeners.get("unload")?.(); },
  };
}

test("the last/default dialog option accepts without selecting a work", () => {
  const dialog = loadDialog();
  assert.equal(dialog.radios.at(-1).checked, true);
  assert.equal(dialog.radios.slice(0, -1).some((radio) => radio.checked), false);
  dialog.accept();
  assert.equal(dialog.io.selectedIndex, null);
});

test("explicit selection and confirmation returns the chosen candidate index", () => {
  const dialog = loadDialog();
  dialog.choose(1);
  dialog.accept();
  assert.equal(dialog.io.selectedIndex, 1);
});

for (const action of ["cancel", "close"]) {
  test(`${action} after selecting a work leaves the output unset`, () => {
    const dialog = loadDialog();
    dialog.choose(0);
    dialog[action]();
    assert.equal(dialog.io.selectedIndex, null);
  });
}

test("candidate titles containing markup are rendered as text", () => {
  const title = '<img src="x" onerror="alert(1)">';
  const dialog = loadDialog([work({ title })]);
  assert.ok(dialog.nodes.some((node) => node.textContent === title));
  assert.equal(dialog.nodes.some((node) => node.tag === "img"), false);
});

test("empty candidates still leave the default choice available", () => {
  const dialog = loadDialog([]);
  assert.equal(dialog.radios.length, 1);
  dialog.accept();
  assert.equal(dialog.io.selectedIndex, null);
});
