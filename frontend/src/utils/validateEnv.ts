// Create a new file: frontend/src/utils/validateEnv.ts
export const validateEnv = () => {
	const required = ['VITE_API_URL', 'VITE_SOCKET_URL'];
	const missing = required.filter((key) => !import.meta.env[key]);

	if (missing.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missing.join(', ')}`
		);
	}
};
