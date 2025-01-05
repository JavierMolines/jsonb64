interface RecordClipboard {
	id: string;
	time: string;
	data: string;
	title: string;
}

type CheckboxStatus = "checked" | "";

interface SettingsOptions {
	value: CheckboxStatus;
}
