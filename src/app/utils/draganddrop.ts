export const assignEventDragSelect = ({
	panelOne,
	panelTwo,
	resize,
}: {
	panelOne: string;
	panelTwo: string;
	resize: boolean;
}) => {
	const resizer = document.getElementById("resizer");
	const panel1 = document.getElementById(panelOne);
	const panel2 = document.getElementById(panelTwo);
	const option1 = document.getElementById("optionA");
	const option2 = document.getElementById("optionB");

	if (!resizer || !panel1 || !panel2 || !option1 || !option2) return;

	resizer.addEventListener("mousedown", () => {
		resize = true;
		document.addEventListener("mousemove", callbackResize);
		document.addEventListener("mouseup", () => {
			resize = false;
			document.removeEventListener("mousemove", callbackResize);
		});
	});

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const callbackResize = (e: any) => {
		if (resize) {
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
};
