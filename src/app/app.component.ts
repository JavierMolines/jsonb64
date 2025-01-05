import {
	AfterViewInit,
	Component,
	Inject,
	PLATFORM_ID,
	signal,
} from "@angular/core";

import { isPlatformBrowser } from "@angular/common";
import { json } from "@codemirror/lang-json";
import { EditorState, Extension } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { copyClipboard, toggleButtonsStylesOptions } from "@utils/methods";
import { EditorView, basicSetup } from "codemirror";

@Component({
	selector: "app-root",
	imports: [],
	templateUrl: "./app.component.html",
})
export class AppComponent implements AfterViewInit {
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

	tai = "tain";
	tao = "taou";

	jsonValid = signal(false);

	buttonsJson = {
		min: "button-minify",
		beu: "button-beutify",
	};

	private editorInput!: EditorView;
	private editorOutput!: EditorView;

	private encode(input: string) {
		const utf8Bytes = new TextEncoder().encode(input);
		return btoa(String.fromCharCode(...utf8Bytes));
	}

	private decode(base64: string) {
		const binaryString = atob(base64);
		const utf8Bytes = Uint8Array.from(binaryString, (char) =>
			char.charCodeAt(0),
		);
		return new TextDecoder().decode(utf8Bytes);
	}

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

		const result = flow === "encode" ? this.encode(value) : this.decode(value);
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
		} catch (error) {}
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
		} catch (error) {
			if (!this.jsonValid()) return; // Not reprocess same flow

			this.jsonValid.set(false);
			toggleButtonsStylesOptions(buttonsJson, false);
		}
	}

	private loadConfigEditor(optionalPlugins: Array<Extension>) {
		return EditorState.create({
			extensions: [
				basicSetup,
				oneDark,
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
		if (!isPlatformBrowser(this.platformId)) return;
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
