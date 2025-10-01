// Utils to create low resolution images for faster editing

// Function to create a low resolution version of an image
// Find the bigger side, and resize it to 200px, keep the original image aspect ratio
export function createLowResImage(src: string): Promise<string> {
    const maxSize = 400;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) return;
            const aspectRatio = img.width / img.height;
            if (img.width > img.height) {
                canvas.width = maxSize;
                canvas.height = maxSize / aspectRatio;
            } else {
                canvas.height = maxSize;
                canvas.width = maxSize * aspectRatio;
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