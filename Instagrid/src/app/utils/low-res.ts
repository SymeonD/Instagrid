// Utils to create low resolution images for faster editing

// Function to create a low resolution version of an image
// Find the bigger side, and resize it to 200px, keep the original image aspect ratio
export function createLowResImage(src: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) return;
            const aspectRatio = img.width / img.height;
            if (img.width > img.height) {
                canvas.width = 200;
                canvas.height = 200 / aspectRatio;
            } else {
                canvas.height = 200;
                canvas.width = 200 * aspectRatio;
            }
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            const newSrc = canvas.toDataURL('image/jpeg');
            resolve(newSrc);
        };
        img.onerror = (error) => {
            reject(error);
        };
    });
}