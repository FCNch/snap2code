# Snap2Code (CloneUI)

Instant UI-to-Code conversion using Google Gemini 2.5 Flash. Upload a screenshot, wireframe, or design, and get a pixel-perfect HTML + Tailwind CSS implementation.

## Features

-   **Instant Conversion**: Uses the Gemini 2.5 Flash multimodal API to analyze images and generate code.
-   **Multi-Format Output**: Support for HTML (Tailwind/Bootstrap), React, JSON, and SQL.
-   **Pixel Perfect Cloning**: High-fidelity reproduction of layouts, colors, shadows, and typography.
-   **Code Preview**: Live interactive preview of the generated HTML.
-   **Source Code View**: Copy or download the generated HTML.
-   **Local History**: Automatically saves your conversions to the browser's IndexedDB so you never lose your work.
-   **Responsive**: Generated code is mobile-friendly by default.

## Technologies Used

-   **Frontend**: React, Tailwind CSS
-   **AI Model**: Google Gemini 2.5 Flash (`@google/genai`)
-   **Storage**: IndexedDB (via browser native API)
-   **Build Tool**: Vite / ESBuild (Recommended)

## Project Structure

Here is an overview of the project's file structure and the responsibility of each component:

```text
snap2code/
├── components/              # Reusable UI Components
│   ├── Button.tsx           # Standardized button component with variants
│   ├── CodeViewer.tsx       # Displays generated code with syntax highlighting styles
│   ├── HistorySidebar.tsx   # Sidebar managing the list of saved previous conversions
│   ├── ImageUploader.tsx    # Drag-and-drop area for image selection and validation
│   └── PreviewFrame.tsx     # Sandboxed iframe container for safely rendering generated HTML
├── services/                # Application Logic & Services
│   ├── db.ts                # IndexedDB wrapper for local persistence (history storage)
│   └── geminiService.ts     # Integration with Google GenAI SDK (Prompts & API calls)
├── App.tsx                  # Main application layout, state management, and coordination
├── index.html               # HTML entry point containing Tailwind CDN and global styles
├── index.tsx                # React application entry point
├── metadata.json            # Application metadata and permissions
├── types.ts                 # Shared TypeScript interfaces and enum definitions
└── README.md                # Project documentation
```

## Installation

To run this project locally, you will need Node.js installed.

### 1. Setup Project
If you are setting this up from scratch, create a new Vite project with React and TypeScript:

```bash
npm create vite@latest snap2code -- --template react-ts
cd snap2code
npm install
```

Then, copy the source files provided into the `src` directory.

### 2. Install Dependencies
You will need the Google GenAI SDK.

```bash
npm install @google/genai
```

### 3. Configure API Key
You need a valid API key from Google AI Studio to use the Gemini models.

1.  **Get your API Key**:
    *   Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Sign in with your Google account.
    *   Click **Create API key**.
    *   Choose to create a key in a new or existing Google Cloud project.
    *   Copy the generated API key string (it starts with `AIza...`).

2.  **Create Environment File**:
    *   In the root folder of your project (at the same level as `package.json`), create a new file named `.env`.
    *   Paste your API key into this file:

    ```env
    API_KEY=your_copied_api_key_here
    ```

3.  **Expose Key in Vite**:
    *   The application expects `process.env.API_KEY`. By default, Vite does not expose `.env` variables on `process.env` in the browser.
    *   Update your `vite.config.ts` to explicitly define this variable:

    ```typescript
    import { defineConfig, loadEnv } from 'vite'
    import react from '@vitejs/plugin-react'

    // https://vitejs.dev/config/
    export default defineConfig(({ mode }) => {
      // Load env file based on `mode` in the current working directory.
      // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
      const env = loadEnv(mode, process.cwd(), '');
      return {
        plugins: [react()],
        define: {
          // Expose API_KEY to the client source code
          'process.env.API_KEY': JSON.stringify(env.API_KEY),
        },
      }
    })
    ```

### 4. Run Locally
```bash
npm run dev
```

## Deployment

This is a Static Single Page Application (SPA), making it easy to deploy.

### Build for Production
```bash
npm run build
```

### Vercel
1.  Push your code to a Git repository (GitHub/GitLab).
2.  Import the project in Vercel.
3.  In **Environment Variables**, add `API_KEY` with your Gemini API Key.
4.  Deploy.

### Netlify
1.  Connect your repository to Netlify.
2.  In **Site Settings** > **Build & Deploy** > **Environment**, add `API_KEY`.
3.  Deploy.

### Security Note
In a production environment, it is recommended to proxy calls to the Gemini API through a backend server (like Vercel Functions or AWS Lambda) to avoid exposing your API key in the client-side code.

## Usage

1.  Click on the upload area or drag & drop an image (PNG, JPG, WebP).
2.  Select your desired output format (HTML, React, JSON, etc.).
3.  Click **Convert**.
4.  Wait for the AI to process the image.
5.  Toggle between **Preview** and **Source Code**.
6.  Click **Download** to save the file locally.
7.  Click the **History** button in the top navigation to view previous conversions.

## Privacy

Images are sent to the Google Gemini API for processing. History is stored locally on your device using IndexedDB.

## License

MIT
