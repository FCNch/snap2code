# Snap2Code (CloneUI)

Instant UI-to-Code conversion using Google Gemini 2.5 Flash. Upload a screenshot, wireframe, or design, and get a pixel-perfect HTML + Tailwind CSS implementation.

## Quick Start

Get up and running in less than 2 minutes.

### 1. Clone & Install
Download the code and install the dependencies.

```bash
# Clone the repository (or download the ZIP)
git clone https://github.com/your-username/snap2code.git
cd snap2code

# Install packages
npm install
```

### 2. Configure API Key
1.  Get your **free** API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Create a file named `.env` in the root folder of the project.
3.  Paste your key inside it like this:

```env
API_KEY=AIzaSyYourKeyHere...
```

### 3. Run App
Start the local development server.

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Features

-   **Instant Conversion**: Uses the Gemini 2.5 Flash multimodal API to analyze images and generate code.
-   **Multi-Format Output**: Support for HTML (Tailwind/Bootstrap), React, JSON, and SQL.
-   **Pixel Perfect Cloning**: High-fidelity reproduction of layouts, colors, shadows, and typography.
-   **Code Preview**: Live interactive preview of the generated HTML.
-   **Source Code View**: Copy or download the generated HTML.
-   **Local History**: Automatically saves your conversions to the browser's IndexedDB so you never lose your work.
-   **Responsive**: Generated code is mobile-friendly by default.

## Project Structure

```text
snap2code/
├── components/              # Reusable UI Components
├── services/                # API & Database Services
├── App.tsx                  # Main Application
├── vite.config.ts           # Vite Configuration (Env handling)
└── .env                     # API Key (Create this file)
```

## Deployment

To deploy to Vercel or Netlify:
1.  Push your code to GitHub.
2.  Import the project in your dashboard.
3.  Add the `API_KEY` in the **Environment Variables** settings.
4.  Deploy!

## Technologies
-   React + Vite
-   Tailwind CSS
-   Google Gemini API (@google/genai)
-   IndexedDB
