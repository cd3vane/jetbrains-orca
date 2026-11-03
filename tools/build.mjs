// Generates themes/*.json and terminal/*.json from the JetBrains palettes below.
// Colors come from the IntelliJ Platform 2025.3 bundled themes:
//   themes/islands/ManyIslandsDark.theme.json, ManyIslandsLight.theme.json,
//   themes/expUI/expUI_dark.theme.json, expUI_light.theme.json (UI)
//   themes/islands/IslandSchemeDark.xml, expUI_darkScheme.xml, expUI_lightScheme.xml (editor)
//
// Usage: node tools/build.mjs        (writes files, prints contrast warnings)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// ---------------------------------------------------------------------------
// Editor (syntax) palettes: "Dark"/"Islands Dark" editor schemes and "Light".
// ---------------------------------------------------------------------------
const darkSyntax = {
  text: '#bcbec4',
  keyword: '#cf8e6d',
  string: '#6aab73',
  escape: '#cf8e6d',
  regexp: '#42c3d4',
  number: '#2aacb8',
  comment: '#7a7e85',
  docComment: '#5f826b',
  docTag: '#67a37c',
  function: '#56a8f5',
  field: '#c77dbb',
  constant: '#c77dbb',
  metadata: '#b3ae60',
  typeParameter: '#16baac',
  tag: '#d5b778',
  attribute: '#bababa',
  self: '#94558d',
  builtin: '#8888c6',
  link: '#548af7',
  invalid: '#f75464',
}

const lightSyntax = {
  text: '#080808',
  keyword: '#0033b3',
  string: '#067d17',
  escape: '#0037a6',
  regexp: '#264eff',
  number: '#1750eb',
  comment: '#8c8c8c',
  docComment: '#8c8c8c',
  docTag: '#8c8c8c',
  function: '#00627a',
  field: '#871094',
  constant: '#871094',
  metadata: '#9e880d',
  typeParameter: '#007e8a',
  tag: '#0033b3',
  attribute: '#174ad4',
  self: '#94558d',
  builtin: '#000080',
  link: '#006dcc',
  invalid: '#f50000',
}

function tokenColors(s, { italicComments }) {
  const rule = (name, scope, foreground, fontStyle) => ({
    name,
    scope,
    settings: fontStyle === undefined ? { foreground } : { foreground, fontStyle },
  })
  return [
    rule('Plain text and identifiers', ['source', 'variable', 'variable.parameter', 'variable.other.readwrite', 'variable.other.constant', 'meta.definition.variable', 'support.variable', 'entity.name.namespace', 'entity.name.module'], s.text),
    rule('Classes and types (plain in JetBrains)', ['entity.name.type', 'entity.name.class', 'entity.other.inherited-class', 'support.class', 'support.type', 'entity.name.type.interface', 'entity.name.type.alias', 'entity.name.type.enum'], s.text),
    rule('Comments', ['comment', 'punctuation.definition.comment'], s.comment, italicComments ? 'italic' : ''),
    rule('Doc comments', ['comment.block.documentation', 'comment.block.javadoc', 'string.quoted.docstring'], s.docComment, 'italic'),
    rule('Doc comment tags', ['storage.type.class.jsdoc', 'storage.type.class.javadoc', 'keyword.other.phpdoc', 'comment.block.documentation storage', 'entity.name.type.instance.jsdoc'], s.docTag, 'italic'),
    rule('Keywords', ['keyword', 'keyword.control', 'keyword.other', 'storage', 'storage.type', 'storage.modifier', 'constant.language', 'variable.language', 'support.type.primitive', 'support.type.builtin', 'keyword.operator.new', 'keyword.operator.expression', 'keyword.operator.logical.python', 'keyword.operator.word', 'keyword.operator.instanceof', 'keyword.operator.typeof', 'keyword.operator.sizeof', 'storage.type.function.arrow'], s.keyword),
    rule('Operators', ['keyword.operator', 'keyword.operator.assignment', 'keyword.operator.arithmetic', 'keyword.operator.comparison', 'keyword.operator.relational'], s.text),
    rule('Punctuation', ['punctuation', 'meta.brace', 'punctuation.separator', 'punctuation.terminator', 'punctuation.accessor'], s.text),
    rule('Strings', ['string', 'punctuation.definition.string', 'markup.inline.raw', 'markup.raw'], s.string),
    rule('Template expression delimiters', ['punctuation.definition.template-expression', 'punctuation.section.embedded'], s.keyword),
    rule('Escapes', ['constant.character.escape', 'constant.character.format.placeholder', 'constant.other.placeholder'], s.escape),
    rule('Regular expressions', ['string.regexp'], s.regexp),
    rule('Numbers', ['constant.numeric'], s.number),
    rule('Functions', ['entity.name.function', 'meta.function-call.generic', 'support.function', 'entity.name.function.member', 'meta.method.declaration entity.name.function'], s.function),
    rule('Builtins', ['support.function.builtin', 'support.type.python', 'support.function.magic'], s.builtin),
    rule('Fields and properties', ['variable.other.property', 'variable.other.object.property', 'variable.other.member', 'support.variable.property', 'meta.object-literal.key', 'support.type.property-name', 'entity.name.variable.field', 'variable.other.field'], s.field),
    rule('Constants and enum members', ['constant.other', 'constant.other.caps', 'variable.other.enummember', 'support.constant', 'constant.other.symbol', 'entity.name.constant'], s.constant, 'italic'),
    rule('Self parameter', ['variable.parameter.function.language.special.self', 'variable.language.special.self', 'variable.parameter.function.language.special.cls', 'variable.language.special.cls'], s.self),
    rule('Type parameters', ['entity.name.type.parameter', 'variable.type.parameter', 'storage.type.generic'], s.typeParameter),
    rule('Decorators and annotations', ['meta.decorator', 'entity.name.function.decorator', 'punctuation.decorator', 'storage.type.annotation', 'punctuation.definition.annotation', 'entity.name.type.annotation', 'meta.attribute'], s.metadata),
    rule('Tags', ['entity.name.tag', 'punctuation.definition.tag', 'entity.other.attribute-name.class.css', 'entity.other.attribute-name.id.css', 'entity.name.tag.css'], s.tag),
    rule('Attributes', ['entity.other.attribute-name'], s.attribute),
    rule('Markdown headings', ['markup.heading', 'entity.name.section', 'punctuation.definition.heading'], s.keyword, 'bold'),
    rule('Markdown bold', ['markup.bold'], s.text, 'bold'),
    rule('Markdown italic', ['markup.italic'], s.text, 'italic'),
    rule('Markdown links', ['markup.underline.link', 'string.other.link', 'markup.link'], s.link, 'underline'),
    rule('Markdown quotes', ['markup.quote'], s.comment, 'italic'),
    rule('Markdown list markers', ['punctuation.definition.list.begin.markdown', 'beginning.punctuation.definition.list'], s.keyword),
    rule('Diff inserted', ['markup.inserted'], s.string),
    rule('Diff deleted', ['markup.deleted'], s.invalid),
    rule('Diff changed', ['markup.changed'], s.function),
    rule('Invalid', ['invalid', 'invalid.illegal'], s.invalid),
    // Orca's built-in languages use Monaco's own token names (matched by prefix),
    // so map those too: comment.doc, type.identifier, delimiter, string.escape, ...
    rule('Monaco: identifiers, types and delimiters', ['identifier', 'type.identifier', 'delimiter', 'delimiter.bracket', 'delimiter.parenthesis', 'delimiter.square', 'delimiter.curly', 'delimiter.angle', 'operator', 'operators'], s.text),
    rule('Monaco: doc comments', ['comment.doc'], s.docComment, 'italic'),
    rule('Monaco: escapes', ['string.escape'], s.escape),
    rule('Monaco: invalid strings', ['string.invalid'], s.invalid),
    rule('Monaco: regular expressions', ['regexp'], s.regexp),
    rule('Monaco: numbers', ['number'], s.number),
    rule('Monaco: annotations', ['annotation', 'metatag'], s.metadata),
    rule('Monaco: tags', ['tag', 'metatag.html'], s.tag),
    rule('Monaco: attributes', ['attribute.name'], s.attribute),
    rule('Monaco: attribute values', ['attribute.value'], s.string),
    rule('Monaco: JSON keys', ['string.key.json', 'string.key'], s.field),
    rule('Monaco: JSON literals', ['keyword.json'], s.keyword),
    rule('Monaco: Markdown bold', ['strong'], s.text, 'bold'),
    rule('Monaco: Markdown italic', ['emphasis'], s.text, 'italic'),
    rule('Monaco: Markdown links', ['string.link'], s.link, 'underline'),
    rule('Monaco: Markdown inline code', ['variable.source'], s.string),
  ].map((r) => ({ ...r, scope: r.scope.filter((x) => !x.includes(' ')) }))
}

// ---------------------------------------------------------------------------
// App themes.
// ---------------------------------------------------------------------------
const gitDark = {
  '--git-decoration-added': '#73bd79',
  '--git-decoration-modified': '#70aeff',
  '--git-decoration-deleted': '#868a91',
  '--git-decoration-renamed': '#70aeff',
  '--git-decoration-untracked': '#e88f89',
  '--git-decoration-copied': '#73bd79',
  '--git-decoration-ignored': '#d69a6b',
}
const chartsDark = {
  '--chart-1': '#548af7',
  '--chart-2': '#5fad65',
  '--chart-3': '#f2c55c',
  '--chart-4': '#a571e6',
  '--chart-5': '#e08855',
}

const themes = {
  // Islands Dark: the 2025.3 default. Islands (#191a1c) float on a #26282b frame.
  'islands-dark': {
    base: 'dark',
    tokens: {
      '--background': '#191a1c',
      '--editor-surface': '#191a1c',
      '--foreground': '#d1d3d9',
      '--card': '#1e1f22',
      '--card-foreground': '#d1d3d9',
      '--popover': '#26282b',
      '--popover-foreground': '#dfe1e5',
      '--primary': '#366ace',
      '--primary-foreground': '#ffffff',
      '--secondary': '#323438',
      '--secondary-foreground': '#dfe1e5',
      '--muted': '#2b2d30',
      '--muted-foreground': '#9da0a8',
      '--accent': '#2b2d30', // JetBrains hover; Orca also uses it for the editor's current line
      '--accent-foreground': '#dfe1e5',
      '--border': '#2b2d30',
      '--input': '#43454a',
      '--ring': '#3574f0',
      ...chartsDark,
      '--sidebar': '#191a1c',
      '--sidebar-foreground': '#d1d3d9',
      '--sidebar-primary': '#366ace',
      '--sidebar-primary-foreground': '#ffffff',
      '--sidebar-accent': '#2e436e',
      '--sidebar-accent-foreground': '#dfe1e5',
      '--sidebar-border': '#2b2d30',
      '--sidebar-ring': '#3574f0',
      '--worktree-sidebar': '#26282b',
      '--worktree-sidebar-foreground': '#d1d3d9',
      '--worktree-sidebar-accent': '#393b40',
      '--worktree-sidebar-accent-foreground': '#dfe1e5',
      '--worktree-sidebar-border': '#26282b',
      '--worktree-sidebar-ring': '#3574f0',
      '--worktree-sidebar-active': '#2e436e',
      '--worktree-sidebar-active-border': '#35538f',
      '--host-badge': '#393b40',
      '--host-badge-foreground': '#b4b8bf',
      '--tab-bar': '#191a1c',
      '--tab-active': '#25324d',
      '--tab-active-foreground': '#dfe1e5',
      '--tab-active-indicator': '#35538f',
      '--tab-inactive': '#191a1c',
      '--tab-inactive-foreground': '#9da0a8',
      '--split-divider': '#26282b',
      '--split-divider-hover': '#3574f0',
      '--chat-user-message': '#26282b',
      '--text-link': '#548af7',
      '--diff-added': '#549159',
      '--diff-added-background': '#294436',
      '--diff-removed': '#868a91',
      '--diff-removed-background': '#484a4a',
      ...gitDark,
    },
    syntax: darkSyntax,
    italicComments: false,
  },

  // The classic New UI "Dark" theme (pre-Islands default, still the Rider/WebStorm default for many).
  dark: {
    base: 'dark',
    tokens: {
      '--background': '#1e1f22',
      '--editor-surface': '#1e1f22',
      '--foreground': '#dfe1e5',
      '--card': '#2b2d30',
      '--card-foreground': '#dfe1e5',
      '--popover': '#2b2d30',
      '--popover-foreground': '#dfe1e5',
      '--primary': '#366ace',
      '--primary-foreground': '#ffffff',
      '--secondary': '#393b40',
      '--secondary-foreground': '#dfe1e5',
      '--muted': '#2b2d30',
      '--muted-foreground': '#9da0a8',
      '--accent': '#323438', // JetBrains hover; Orca also uses it for the editor's current line
      '--accent-foreground': '#dfe1e5',
      '--border': '#393b40',
      '--input': '#4e5157',
      '--ring': '#3574f0',
      ...chartsDark,
      '--sidebar': '#2b2d30',
      '--sidebar-foreground': '#dfe1e5',
      '--sidebar-primary': '#366ace',
      '--sidebar-primary-foreground': '#ffffff',
      '--sidebar-accent': '#2e436e',
      '--sidebar-accent-foreground': '#dfe1e5',
      '--sidebar-border': '#1e1f22',
      '--sidebar-ring': '#3574f0',
      '--worktree-sidebar': '#2b2d30',
      '--worktree-sidebar-foreground': '#dfe1e5',
      '--worktree-sidebar-accent': '#393b40',
      '--worktree-sidebar-accent-foreground': '#dfe1e5',
      '--worktree-sidebar-border': '#1e1f22',
      '--worktree-sidebar-ring': '#3574f0',
      '--worktree-sidebar-active': '#2e436e',
      '--worktree-sidebar-active-border': '#35538f',
      '--host-badge': '#393b40',
      '--host-badge-foreground': '#b4b8bf',
      '--tab-bar': '#1e1f22',
      '--tab-active': '#1e1f22',
      '--tab-active-foreground': '#dfe1e5',
      '--tab-active-indicator': '#3574f0',
      '--tab-inactive': '#1e1f22',
      '--tab-inactive-foreground': '#9da0a8',
      '--split-divider': '#393b40',
      '--split-divider-hover': '#3574f0',
      '--chat-user-message': '#2b2d30',
      '--text-link': '#548af7',
      '--diff-added': '#549159',
      '--diff-added-background': '#294436',
      '--diff-removed': '#868a91',
      '--diff-removed-background': '#484a4a',
      ...gitDark,
    },
    syntax: darkSyntax,
    italicComments: false,
  },

  // Islands Light: white islands on a #ebecf0 frame, IntelliJ "Light" editor scheme.
  'islands-light': {
    base: 'light',
    tokens: {
      '--background': '#ffffff',
      '--editor-surface': '#ffffff',
      '--foreground': '#080808',
      '--card': '#ffffff',
      '--card-foreground': '#080808',
      '--popover': '#ffffff',
      '--popover-foreground': '#080808',
      '--primary': '#3369d6',
      '--primary-foreground': '#ffffff',
      '--secondary': '#ebecf0',
      '--secondary-foreground': '#080808',
      '--muted': '#f7f8fa',
      '--muted-foreground': '#6c707e',
      '--accent': '#edf3ff', // JetBrains hover; Orca also uses it for the editor's current line
      '--accent-foreground': '#080808',
      '--border': '#ebecf0',
      '--input': '#c9ccd6',
      '--ring': '#3574f0',
      '--chart-1': '#3574f0',
      '--chart-2': '#208a3c',
      '--chart-3': '#df9303',
      '--chart-4': '#834df0',
      '--chart-5': '#e56d17',
      '--sidebar': '#f7f8fa',
      '--sidebar-foreground': '#080808',
      '--sidebar-primary': '#3369d6',
      '--sidebar-primary-foreground': '#ffffff',
      '--sidebar-accent': '#d4e2ff',
      '--sidebar-accent-foreground': '#080808',
      '--sidebar-border': '#ebecf0',
      '--sidebar-ring': '#3574f0',
      '--worktree-sidebar': '#ebecf0',
      '--worktree-sidebar-foreground': '#080808',
      '--worktree-sidebar-accent': '#dfe1e5',
      '--worktree-sidebar-accent-foreground': '#080808',
      '--worktree-sidebar-border': '#dfe1e5',
      '--worktree-sidebar-ring': '#3574f0',
      '--worktree-sidebar-active': '#d4e2ff',
      '--worktree-sidebar-active-border': '#a0bdf8',
      '--host-badge': '#dfe1e5',
      '--host-badge-foreground': '#494b57',
      '--tab-bar': '#ffffff',
      '--tab-active': '#e8efff',
      '--tab-active-foreground': '#080808',
      '--tab-active-indicator': '#a0bdf8',
      '--tab-inactive': '#ffffff',
      '--tab-inactive-foreground': '#5a5d6b',
      '--split-divider': '#ebecf0',
      '--split-divider-hover': '#3574f0',
      '--chat-user-message': '#f2f3f5',
      '--text-link': '#2e55a3',
      '--diff-added': '#55a76a',
      '--diff-added-background': '#d7f0d7',
      '--diff-removed': '#818594',
      '--diff-removed-background': '#e4e4e4',
      '--git-decoration-added': '#067d17',
      '--git-decoration-modified': '#0033b3',
      '--git-decoration-deleted': '#6c707e',
      '--git-decoration-renamed': '#0033b3',
      '--git-decoration-untracked': '#b23247',
      '--git-decoration-copied': '#067d17',
      '--git-decoration-ignored': '#8c4f00',
    },
    syntax: lightSyntax,
    italicComments: true,
  },
}

// ---------------------------------------------------------------------------
// Terminal themes: the editor schemes' CONSOLE_*_OUTPUT colors.
// JetBrains maps ANSI 37 to GRAY and 97 to WHITE.
// ---------------------------------------------------------------------------
const consoleDark = {
  foreground: '#bcbec4',
  cursor: '#ced0d6',
  selectionBackground: '#214283',
  black: '#000000',
  red: '#f0524f',
  green: '#5c962c',
  yellow: '#a68a0d',
  blue: '#3993d4',
  magenta: '#a771bf',
  cyan: '#00a3a3',
  white: '#808080',
  brightBlack: '#595959',
  brightRed: '#ff4050',
  brightGreen: '#4fc414',
  brightYellow: '#e5bf00',
  brightBlue: '#1fb0ff',
  brightMagenta: '#ed7eed',
  brightCyan: '#00e5e5',
  brightWhite: '#ffffff',
}
const terminals = {
  'islands-dark': { mode: 'dark', terminal: { background: '#191a1c', ...consoleDark } },
  dark: { mode: 'dark', terminal: { background: '#1e1f22', ...consoleDark } },
  light: {
    mode: 'light',
    terminal: {
      background: '#ffffff',
      foreground: '#080808',
      cursor: '#000000',
      selectionBackground: '#a6d2ff',
      black: '#000000',
      red: '#ce0505',
      green: '#067d17',
      yellow: '#b28c00',
      blue: '#063fdb',
      magenta: '#b309b3',
      cyan: '#028e8e',
      white: '#929292',
      brightBlack: '#656565',
      brightRed: '#ff1616',
      brightGreen: '#16b42c',
      brightYellow: '#ecc32c',
      brightBlue: '#2d61f0',
      brightMagenta: '#e617e6',
      brightCyan: '#15c1c1',
      brightWhite: '#c9c9c9',
    },
  },
}

// ---------------------------------------------------------------------------
// Contrast check (WCAG), mirroring Orca's rules so nothing is silently dropped.
// ---------------------------------------------------------------------------
function lum(hex) {
  const n = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
function contrast(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
const pairs = [
  ['--background', '--foreground'],
  ['--card', '--card-foreground'],
  ['--popover', '--popover-foreground'],
  ['--primary', '--primary-foreground'],
  ['--secondary', '--secondary-foreground'],
  ['--muted', '--muted-foreground'],
  ['--accent', '--accent-foreground'],
  ['--sidebar', '--sidebar-foreground'],
  ['--sidebar-primary', '--sidebar-primary-foreground'],
  ['--sidebar-accent', '--sidebar-accent-foreground'],
  ['--worktree-sidebar', '--worktree-sidebar-foreground'],
  ['--worktree-sidebar-accent', '--worktree-sidebar-accent-foreground'],
  ['--worktree-sidebar-active', '--worktree-sidebar-foreground'],
  ['--host-badge', '--host-badge-foreground'],
  ['--tab-active', '--tab-active-foreground'],
  ['--tab-inactive', '--tab-inactive-foreground'],
  ['--chat-user-message', '--foreground'],
  ['--diff-added-background', '--foreground'],
  ['--diff-removed-background', '--foreground'],
  ['--editor-surface', '--text-link'],
]
let problems = 0
function check(label, ratio, min) {
  if (ratio < min) {
    problems++
    console.warn(`  ! ${label}: ${ratio.toFixed(2)} < ${min}`)
  }
}

const write = (rel, data) => {
  const file = path.join(root, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
  console.log(`wrote ${rel} (${fs.statSync(file).size} bytes)`)
}

for (const [id, t] of Object.entries(themes)) {
  const out = { schemaVersion: 1, base: t.base, tokens: t.tokens, tokenColors: tokenColors(t.syntax, t) }
  write(`themes/${id}.json`, out)
  for (const [bg, fg] of pairs) check(`${id} ${bg}/${fg}`, contrast(t.tokens[bg], t.tokens[fg]), 4.5)
  for (const [k, v] of Object.entries(t.tokens))
    if (k.startsWith('--git-decoration-')) check(`${id} ${k} on --sidebar`, contrast(v, t.tokens['--sidebar']), 3)
  for (const r of out.tokenColors) check(`${id} syntax "${r.name}"`, contrast(r.settings.foreground, t.tokens['--editor-surface']), 3)
}
for (const [id, t] of Object.entries(terminals)) write(`terminal/${id}.json`, { schemaVersion: 1, ...t })

console.log(problems ? `${problems} contrast warning(s)` : 'all contrast checks pass')
