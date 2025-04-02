import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

// Monokai Dark color palette
const background = "#272822";
const foreground = "#f8f8f2";
const comment = "#a6a6a6";
const cyan = "#66d9ef";
const green = "#a6e22e";
const orange = "#fd971f";
const pink = "#f92672";
const purple = "#ae81ff";
const red = "#e74c3c";
const yellow = "#e6db74";
const selection = "#49483e";
const cursor = "#f8f8f0";
const customColor = "#00ff99";

/// The colors used in the theme, as CSS color strings.
export const color = {
	background,
	foreground,
	comment,
	cyan,
	green,
	orange,
	pink,
	purple,
	red,
	yellow,
	selection,
	cursor,
};

/// The editor theme styles for Monokai Dark.
export const monokaiTheme = EditorView.theme(
	{
		"&": {
			color: foreground,
			backgroundColor: background,
		},

		".cm-content": {
			caretColor: cursor,
		},

		".cm-cursor, .cm-dropCursor": { borderLeftColor: cursor },
		"&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
			{
				backgroundColor: selection,
			},

		".cm-panels": { backgroundColor: background, color: foreground },
		".cm-panels.cm-panels-top": { borderBottom: "2px solid black" },
		".cm-panels.cm-panels-bottom": { borderTop: "2px solid black" },

		".cm-searchMatch": {
			backgroundColor: "#fd971f59",
			outline: "1px solid #fd971f",
		},
		".cm-searchMatch.cm-searchMatch-selected": {
			backgroundColor: "#fd971f2f",
		},

		".cm-activeLine": { backgroundColor: "#49483e80" },
		".cm-selectionMatch": { backgroundColor: "#49483e" },

		"&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
			backgroundColor: "#ae81ff47",
		},

		".cm-gutters": {
			backgroundColor: background,
			color: comment,
			border: "none",
		},

		".cm-activeLineGutter": {
			backgroundColor: selection,
		},

		".cm-foldPlaceholder": {
			backgroundColor: "transparent",
			border: "none",
			color: "#ddd",
		},

		".cm-tooltip": {
			border: "none",
			backgroundColor: "#49483e",
		},
		".cm-tooltip .cm-tooltip-arrow:before": {
			borderTopColor: "transparent",
			borderBottomColor: "transparent",
		},
		".cm-tooltip .cm-tooltip-arrow:after": {
			borderTopColor: "#49483e",
			borderBottomColor: "#49483e",
		},
		".cm-tooltip-autocomplete": {
			"& > ul > li[aria-selected]": {
				backgroundColor: selection,
				color: foreground,
			},
		},
	},
	{ dark: true },
);

/// The highlighting style for code in the Monokai Dark theme.
export const monokaiHighlightStyle = HighlightStyle.define([
	{ tag: t.keyword, color: pink },
	{
		tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
		color: customColor,
	},
	{ tag: [t.function(t.variableName), t.labelName], color: green },
	{ tag: [t.color, t.constant(t.name), t.standard(t.name)], color: orange },
	{ tag: [t.definition(t.name), t.separator], color: foreground },
	{
		tag: [
			t.typeName,
			t.className,
			t.number,
			t.changed,
			t.annotation,
			t.modifier,
			t.self,
			t.namespace,
		],
		color: purple,
	},
	{
		tag: [
			t.operator,
			t.operatorKeyword,
			t.url,
			t.escape,
			t.regexp,
			t.link,
			t.special(t.string),
		],
		color: cyan,
	},
	{ tag: [t.meta, t.comment], color: comment },
	{ tag: t.strong, fontWeight: "bold" },
	{ tag: t.emphasis, fontStyle: "italic" },
	{ tag: t.strikethrough, textDecoration: "line-through" },
	{ tag: t.link, color: cyan, textDecoration: "underline" },
	{ tag: t.heading, fontWeight: "bold", color: orange },
	{ tag: [t.atom, t.bool, t.special(t.variableName)], color: yellow },
	{ tag: [t.processingInstruction, t.string, t.inserted], color: yellow },
	{ tag: t.invalid, color: red },
]);

/// Extension to enable the Monokai Dark theme (both the editor theme and the highlight style).
export const monokai: Extension = [
	monokaiTheme,
	syntaxHighlighting(monokaiHighlightStyle),
];
