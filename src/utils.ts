export const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const password_regex = /^(?=.*[A-Za-z])(?=.*\d).{4,}$/;

export const getNamedInputs = (
	formRef: React.RefObject<HTMLFormElement | null>,
) => {
	const form = formRef.current;
	if (!form) return [];
	return Array.from(form.elements).filter(
		(el) => el instanceof HTMLInputElement && el.hasAttribute("name"),
	) as HTMLInputElement[];
};
