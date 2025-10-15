export class ThemeService {
    
    public setTheme(theme: 'light' | 'dark' | 'system') {
        this.applyTheme(theme);
    }

    private applyTheme(theme: 'light' | 'dark' | 'system') {
        const body = document.body;

        body.classList.remove('light-theme', 'dark-theme');

        if(theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
        }else {
            body.classList.add(`${theme}-theme`)
        }
    }

}