export const copyClipboard = (data: string) => {
	navigator.clipboard
		.writeText(data)
		.then(() => {
			console.log("Copy finish");
		})
		.catch((err) => {
			console.error("Error copy", err);
		});
};

export const toggleButtonsStylesOptions = (
	buttons: NodeListOf<Element>,
	isValid: boolean,
) => {
	const stylesOptions = [
		{
			style: "bg-gray-300",
			viewInverse: false,
		},
		{
			style: "cursor-not-allowed",
			viewInverse: false,
		},
		{
			style: "bg-purple-300",
			viewInverse: true,
		},
		{
			style: "hover:bg-purple-200",
			viewInverse: true,
		},
		{
			style: "cursor-pointer",
			viewInverse: true,
		},
	];

	for (let index = 0; index < buttons.length; index++) {
		const button = buttons[index] as HTMLButtonElement;

		for (const { style, viewInverse } of stylesOptions) {
			if ((viewInverse && !isValid) || (!viewInverse && isValid)) {
				button.classList.remove(style);
				continue;
			}

			button.classList.add(style);
		}
	}
};
