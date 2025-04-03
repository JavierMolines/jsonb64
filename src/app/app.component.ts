import {
	AfterViewInit,
	Component,
	WritableSignal,
	signal,
} from "@angular/core";

import { json } from "@codemirror/lang-json";
import { EditorState, Extension } from "@codemirror/state";
import { IconComponent } from "@components/icon/icon.component";
import { assignEventDragSelect } from "@utils/draganddrop";
import { copyClipboard, decode, encode } from "@utils/methods";
import { EditorView, basicSetup } from "codemirror";
import { monokai } from "./theme/monokai.theme";

@Component({
	selector: "app-root",
	imports: [IconComponent],
	templateUrl: "./app.component.html",
})
export class AppComponent implements AfterViewInit {
	tai = "tain";
	tao = "taou";

	nameStorageOne = "contentOne";
	nameStorageTwo = "contentTwo";

	jsonValidOne = signal(false);
	jsonValidTwo = signal(false);

	private isResizing = false;
	private editorInput!: EditorView;
	private editorOutput!: EditorView;

	private getDomTextArea(id: string) {
		return document.getElementById(id) as HTMLTextAreaElement;
	}

	private getTextToCodeMirror(editor: EditorView) {
		return editor.state.doc.toString();
	}

	private getConfigByPanel(panel: "1" | "2") {
		const handlerPanel = panel === "1";
		return {
			json: handlerPanel ? this.jsonValidOne : this.jsonValidTwo,
			view: handlerPanel ? this.editorInput : this.editorOutput,
		};
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

	private mirrorPanelControlBase64(
		flow: "decode" | "encode",
		view: EditorView,
	) {
		const value = this.getTextToCodeMirror(view);
		if (value.trim() === "") return;

		const result = flow === "encode" ? encode(value) : decode(value);
		this.writeInEditor(view, result);
	}

	private mirrorPanelControlJson(
		flow: "minify" | "clean",
		json: WritableSignal<boolean>,
		view: EditorView,
	) {
		if (!json()) return;

		try {
			const input = this.getTextToCodeMirror(view);
			const json = JSON.parse(input);
			const format =
				flow === "clean"
					? JSON.stringify(json, null, "\t")
					: JSON.stringify(json);

			this.writeInEditor(view, format);
		} catch (_) {}
	}

	private mirrorPanelControlCopy(flow: "copy" | "move", panel: "1" | "2") {
		const handlerPanel = panel === "1";
		const view = handlerPanel ? this.editorInput : this.editorOutput;
		const value = this.getTextToCodeMirror(view);

		if (value.trim() === "") return;

		if (flow === "copy") {
			copyClipboard(value);
			return;
		}

		const mirror = handlerPanel ? this.editorOutput : this.editorInput;
		this.writeInEditor(mirror, value);
	}

	private validEventCodeMirror(content: string, json: WritableSignal<boolean>) {
		try {
			JSON.parse(content);
			if (json()) return;
			json.set(true);
		} catch (_) {
			if (!json()) return;
			json.set(false);
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

		const updateInput = EditorView.updateListener.of((update) => {
			if (!update.docChanged) return;
			const content = update.state.doc.toString();
			localStorage.setItem(this.nameStorageOne, content);
			this.validEventCodeMirror(content, this.jsonValidOne);
		});

		const updateOutput = EditorView.updateListener.of((update) => {
			if (!update.docChanged) return;
			const content = update.state.doc.toString();
			localStorage.setItem(this.nameStorageTwo, content);
			this.validEventCodeMirror(content, this.jsonValidTwo);
		});

		this.editorInput = new EditorView({
			state: this.loadConfigEditor([updateInput]),
			parent: input,
		});

		this.editorOutput = new EditorView({
			state: this.loadConfigEditor([updateOutput]),
			parent: output,
		});
	}

	private loadTextInLocalStorage() {
		const partialsOne = localStorage.getItem(this.nameStorageOne);
		const partialsTwo = localStorage.getItem(this.nameStorageTwo);

		if (partialsOne && partialsOne.trim() !== "") {
			this.writeInEditor(this.editorInput, partialsOne);
		}

		if (partialsTwo && partialsTwo.trim() !== "") {
			this.writeInEditor(this.editorOutput, partialsTwo);
		}
	}

	ngAfterViewInit(): void {
		if (typeof window === "undefined" || typeof document === "undefined") {
			return;
		}

		this.loadEditorsInView();
		this.loadTextInLocalStorage();
		assignEventDragSelect({
			resize: this.isResizing,
		});
	}

	onClickMoveText(panel: "1" | "2") {
		this.mirrorPanelControlCopy("move", panel);
	}

	onClickCopyClipboard(panel: "1" | "2") {
		this.mirrorPanelControlCopy("copy", panel);
	}

	onClickEncode(panel: "1" | "2") {
		const config = this.getConfigByPanel(panel);
		this.mirrorPanelControlBase64("encode", config.view);
	}

	onClickDecode(panel: "1" | "2") {
		const config = this.getConfigByPanel(panel);
		this.mirrorPanelControlBase64("decode", config.view);
	}

	onClickBeautify(panel: "1" | "2") {
		const config = this.getConfigByPanel(panel);
		this.mirrorPanelControlJson("clean", config.json, config.view);
	}

	onClickMinify(panel: "1" | "2") {
		const config = this.getConfigByPanel(panel);
		this.mirrorPanelControlJson("minify", config.json, config.view);
	}
}
