/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#0d9488",
                    50: "#f0fdfa",
                    100: "#ccfbf1",
                    200: "#99f6e4",
                    300: "#5eead4",
                    400: "#2dd4bf",
                    500: "#0d9488",
                    600: "#0f766e",
                    700: "#115e59",
                    800: "#134e4a",
                    900: "#1a4d4d",
                },
                sidebar: {
                    DEFAULT: "#0c2f2f",
                    light: "#143d3d",
                    hover: "#1a4a4a",
                    active: "#1e5555",
                },
                accent: "#10b981",
                surface: "#f8fafc",
                card: "#ffffff",
                ink: "#1e293b",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
};
