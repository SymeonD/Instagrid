/// <reference lib="webworker" />

interface CropTask {
  src: string;
  gridX: number;
  gridY: number;
  lowRes?: boolean;
}

addEventListener('message', async ({ data }) => {
  // data: { action: string, payload: any }
  const { action, payload } = data;

  // It will be used for image importing in the future
});