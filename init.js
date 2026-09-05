// Silenciar o aviso de produção do Tailwind no console da extensão
if (window.console && console.warn) {
    const originalWarn = console.warn;
    console.warn = function() {
        if (arguments[0] && typeof arguments[0] === 'string' && (arguments[0].includes('cdn.tailwindcss.com') || arguments[0].includes('production'))) return;
        originalWarn.apply(console, arguments);
    };
}
