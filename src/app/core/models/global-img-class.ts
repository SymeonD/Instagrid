// Class of a basic image, with original src and lower resolution src for editing
export class GlobalImg {
    constructor(public highResSrc: string, public alt: string, public id: string = GlobalImg.newId(), public lowResSrc?: string) {}

    private static newId(): string {
        if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
        // Fallback for non-secure contexts (HTTP dev server)
        return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    }
}
