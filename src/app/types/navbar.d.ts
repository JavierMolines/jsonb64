interface IDatagramNavbar {
	img: ValidIcons;
	title: string;
	link: string;
}

interface IOptionsNavbar {
	top: Array<IDatagramNavbar>;
	bottom: Array<IDatagramNavbar>;
}
