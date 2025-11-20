# Snap2Code (CloneUI)

Instant UI-to-Code conversion using Google Gemini 2.5 Flash. Upload a screenshot, wireframe, or design, and get a pixel-perfect HTML + Tailwind CSS implementation.

## Features

-   **Instant Conversion**: Uses the Gemini 2.5 Flash multimodal API to analyze images and generate code.
-   **Pixel Perfect Cloning**: High-fidelity reproduction of layouts, colors, shadows, and typography.
-   **Code Preview**: Live interactive preview of the generated HTML.
-   **Source Code View**: Copy or download the generated HTML.
-   **Local History**: Automatically saves your conversions to the browser's IndexedDB so you never lose your work.
-   **Responsive**: Generated code is mobile-friendly by default.

## Technologies Used

-   **Frontend**: React, Tailwind CSS
-   **AI Model**: Google Gemini 2.5 Flash (`@google/genai`)
-   **Storage**: IndexedDB (via browser native API)
-   **Build Tool**: ESBuild (implied via environment)

## Setup

1.  **Environment Variables**:
    Ensure your environment has the `API_KEY` set for the Google GenAI SDK.

2.  **Dependencies**:
    This project uses standard React dependencies and `@google/genai`.

## Usage

1.  Click on the upload area or drag & drop an image (PNG, JPG, WebP).
2.  Click **Convert to Code**.
3.  Wait for the AI to process the image.
4.  Toggle between **Preview** and **Source Code**.
5.  Click **Download HTML** to save the file locally.
6.  Click the **History** button in the top navigation to view previous conversions.

## Privacy

Images are sent to the Google Gemini API for processing. History is stored locally on your device using IndexedDB.

## License

MIT
