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
import { IconComponent } from "@components/icon/icon.component";

@Component({
	selector: "app-root",
	imports: [IconComponent],
	templateUrl: "./app.component.html",
})
export class AppComponent implements AfterViewInit {
	tai = "tain";
	tao = "taou";

	jsonValid = signal(false);
	isResizing = false;

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

	private assignEventDragSelect() {
		const resizer = document.getElementById("resizer");
		const panel1 = document.getElementById(this.tai);
		const panel2 = document.getElementById(this.tao);
		const option1 = document.getElementById("optionA");
		const option2 = document.getElementById("optionB");

		if (!resizer || !panel1 || !panel2 || !option1 || !option2) return;

		resizer.addEventListener("mousedown", () => {
			this.isResizing = true;
			console.log("HERE 2");
			document.addEventListener("mousemove", resize);
			document.addEventListener("mouseup", () => {
				console.log("HERE 3");
				this.isResizing = false;
				document.removeEventListener("mousemove", resize);
			});
		});

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const resize = (e: any) => {
			if (this.isResizing) {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const content: any = document.getElementById("container");
				if (!content) return;

				const containerWidth = content.offsetWidth;
				const newPanel1Width = e.clientX;
				const newPanel2Width =
					containerWidth - newPanel1Width - resizer.offsetWidth;

				if (newPanel1Width > 200 && newPanel2Width > 200) {
					panel1.style.width = `${newPanel1Width}px`;
					panel2.style.width = `${newPanel2Width}px`;
					option1.style.width = `${newPanel1Width}px`;
					option2.style.width = `${newPanel2Width}px`;
				}
			}
		};
	}

	ngAfterViewInit(): void {
		if (typeof window === "undefined" || typeof document === "undefined") {
			return;
		}

		this.loadEditorsInView();
		this.assignEventDragSelect();
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
