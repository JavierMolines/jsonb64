import { AfterViewInit, Component, signal } from "@angular/core";
import { json } from "@codemirror/lang-json";
import { EditorState, Extension } from "@codemirror/state";
import {
	copyClipboard,
	decode,
	encode,
	toggleButtonsStylesOptions,
} from "@utils/methods";

import { EditorView, basicSetup } from "codemirror";
import { monokai } from "./theme/monokai.theme";

@Component({
	selector: "app-root",
	imports: [],
	templateUrl: "./app.component.html",
})
export class AppComponent implements AfterViewInit {
	tai = "tain";
	tao = "taou";

	jsonValid = signal(false);

	buttonsJson = {
		min: "button-minify",
		beu: "button-beutify",
	};

	private editorInput!: EditorView;
	private editorOutput!: EditorView;

	private getDomTextArea(id: string) {
		return document.getElementById(id) as HTMLTextAreaElement;
	}

	private getTextToCodeMirror(editor: EditorView) {
		return editor.state.doc.toString();
	}

	private writeInEditor(editor: EditorView, content: string) {
		editor.dispatch({
			changes: {
				from: 0,
				to: editor.state.doc.length,
				insert: content,
			},
		});
	}

	private handlerParser(flow: "decode" | "encode") {
		const value = this.getTextToCodeMirror(this.editorInput);

		if (value.trim() === "") {
			alert("Insert text..");
			return;
		}

		const result = flow === "encode" ? encode(value) : decode(value);
		this.writeInEditor(this.editorOutput, result);
	}

	private handlerJsonMethods(flow: "minify" | "clean") {
		if (!this.jsonValid()) return;

		try {
			const input = this.getTextToCodeMirror(this.editorInput);
			const json = JSON.parse(input);
			const format =
				flow === "clean"
					? JSON.stringify(json, null, "\t")
					: JSON.stringify(json);

			this.writeInEditor(this.editorOutput, format);
		} catch (_) {}
	}

	private handlerButtonsRightPanel(flow: "copy" | "move") {
		const value = this.getTextToCodeMirror(this.editorOutput);
		if (value.trim() === "") return;

		if (flow === "copy") {
			copyClipboard(value);
		} else {
			this.writeInEditor(this.editorInput, value);
		}
	}

	private validEventChangeTextCodeMirror(content: string) {
		const buttonsJson = document.querySelectorAll(".to-json");

		try {
			JSON.parse(content);

			if (this.jsonValid()) return; // Not reprocess same flow

			this.jsonValid.set(true);
			toggleButtonsStylesOptions(buttonsJson, true);
		} catch (_) {
			if (!this.jsonValid()) return; // Not reprocess same flow

			this.jsonValid.set(false);
			toggleButtonsStylesOptions(buttonsJson, false);
		}
	}

	private loadConfigEditor(optionalPlugins: Array<Extension>) {
		return EditorState.create({
			extensions: [
				basicSetup,
				monokai,
				json(),
				EditorView.lineWrapping,
				...optionalPlugins,
			],
		});
	}

	private loadEditorsInView() {
		const input = this.getDomTextArea(this.tai);
		const output = this.getDomTextArea(this.tao);

		if (!input || !output) return;

		const updateListener = EditorView.updateListener.of((update) => {
			if (!update.docChanged) return;
			const content = update.state.doc.toString();
			this.validEventChangeTextCodeMirror(content);
		});

		this.editorInput = new EditorView({
			state: this.loadConfigEditor([updateListener]),
			parent: input,
		});

		this.editorOutput = new EditorView({
			state: this.loadConfigEditor([]),
			parent: output,
		});
	}

	ngAfterViewInit(): void {
		if (typeof window === "undefined" || typeof document === "undefined") {
			return;
		}

		this.loadEditorsInView();
	}

	onClickMoveText() {
		this.handlerButtonsRightPanel("move");
	}

	onClickCopyClipboard() {
		this.handlerButtonsRightPanel("copy");
	}

	onClickEncode() {
		this.handlerParser("encode");
	}

	onClickDecode() {
		this.handlerParser("decode");
	}

	onClickBeautify() {
		this.handlerJsonMethods("clean");
	}

	onClickMinify() {
		this.handlerJsonMethods("minify");
	}
}
