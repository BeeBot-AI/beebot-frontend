const config = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    WIDGET_URL: import.meta.env.VITE_WIDGET_URL || 'http://localhost:5173/widget.js',
};

export default config;
