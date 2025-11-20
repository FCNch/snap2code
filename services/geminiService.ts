import { GoogleGenAI } from "@google/genai";
import { ConversionResult, OutputFormat } from "../types";

const PROMPTS: Record<OutputFormat, string> = {
  html_tailwind: `
    You are an expert frontend engineer and UI/UX designer.
    Your mission is to generate a pixel-perfect, fully responsive HTML/Tailwind clone of the provided image.

    Step-by-Step Instructions:
    1.  **Responsive Layout (Mobile-First)**: Start with mobile styles as default. Use 'md:', 'lg:', 'xl:' prefixes to adjust the layout for larger screens.
        - Example: Use 'flex flex-col md:flex-row' to stack items on mobile and align them side-by-side on desktop.
        - Example: Use 'w-full md:w-1/2' for grid columns.
    2.  **Grid & Alignment**: Identify the grid system. Ensure distinct sections (hero, features, footer) scale correctly.
    3.  **Extract Colors**: Use the EXACT hex codes from the image for backgrounds, text, and accents.
    4.  **Typography**: Match font weights, sizes, and families (Serif vs Sans). Use Google Fonts via CDN.
    5.  **Components**: Replicate buttons, cards, and navbars exactly. 
        - **Crucial**: Ensure the Navigation Bar is responsive (e.g., hamburger menu on mobile, full links on desktop).
    6.  **Interactivity**: Write vanilla JavaScript <script> tags for mobile menu toggles and simple interactions.
    7.  **Assets**: Use 'https://placehold.co/{width}x{height}' for placeholders. Use FontAwesome 6 CDN.
    8.  **Content**: Transcribe visible text exactly.

    Output:
    - Return ONLY the raw HTML code.
    - No Markdown blocks.
    - No explanations.
  `,
  html_bootstrap: `
    You are an expert frontend engineer.
    Your mission is to generate a pixel-perfect, responsive HTML clone of the provided image using Bootstrap 5.

    Step-by-Step Instructions:
    1.  **Responsive Grid**: Use the Bootstrap grid system extensively (container, row, col-12 col-md-6 col-lg-4).
        - Ensure content stacks vertically on mobile ('col-12') and expands horizontally on tablets/desktops.
    2.  **Theme**: Use Bootstrap utility classes for spacing, colors, and typography. Add custom CSS <style> only when Bootstrap utilities are insufficient.
    3.  **CDN**: Include Bootstrap 5 CSS and JS via CDN.
    4.  **Components**: Use native Bootstrap components (Navbar, Card, Button, Modal).
        - **Crucial**: Use the 'navbar-expand-lg' class for the navigation bar to handle mobile collapsing automatically.
    5.  **Assets**: Use 'https://placehold.co/{width}x{height}' for placeholders. Use Bootstrap Icons or FontAwesome.

    Output:
    - Return ONLY the raw HTML code.
    - No Markdown blocks.
  `,
  react_tailwind: `
    You are an expert React developer.
    Your mission is to generate a responsive React functional component (TSX) using Tailwind CSS that clones the provided image.

    Instructions:
    1.  **Mobile First**: Apply base styles for mobile and use 'md:', 'lg:' modifiers for desktop layouts.
        - Example: 'grid grid-cols-1 md:grid-cols-3 gap-4'.
    2.  **Component Structure**: Create a single component file. If specific sections are complex, break them into sub-components within the same file if possible, or keep it monolithic for simplicity.
    3.  **Styling**: Use Tailwind CSS classes directly in className.
    4.  **Icons**: Use 'lucide-react' or 'react-icons' syntax (assume these libraries are available, or use SVG directly if specific).
    5.  **Props**: Hardcode the content found in the image.

    Output:
    - Return ONLY the React code.
    - No Markdown blocks.
  `,
  json: `
    You are a data extraction expert.
    Your mission is to extract all structured data visible in the image into a clean JSON format.

    Instructions:
    1.  **Analyze**: Identify lists, key-value pairs, headers, and tabular data.
    2.  **Structure**: Create a hierarchical JSON object representing the page content.
    3.  **Keys**: Use camelCase for keys.
    4.  **Values**: Extract text, numbers, and links exactly as shown.
    5.  **Meta**: Include inferred types if applicable (e.g., "type": "button").

    Output:
    - Return ONLY the valid JSON string.
    - No Markdown blocks.
  `,
  sql: `
    You are a database engineer.
    Your mission is to analyze the data in the image and generate SQL scripts.

    Instructions:
    1.  **Schema**: Infer a relational schema based on the UI entities (e.g., Users, Products, Orders).
    2.  **Create Table**: Write 'CREATE TABLE' statements with appropriate data types.
    3.  **Insert Data**: Write 'INSERT INTO' statements for the visible data in the image.

    Output:
    - Return ONLY the SQL code.
    - No Markdown blocks.
  `
};

export const generateCodeFromImage = async (base64Data: string, mimeType: string, format: OutputFormat = 'html_tailwind'): Promise<ConversionResult> => {
  try {
    // Robust API Key retrieval and cleaning
    let apiKey = process.env.API_KEY;
    
    if (apiKey) {
        apiKey = apiKey.trim();
        // Remove accidental quotes if dotenv parsing didn't catch them
        if ((apiKey.startsWith('"') && apiKey.endsWith('"')) || (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
            apiKey = apiKey.substring(1, apiKey.length - 1);
        }
    }

    // Safe Logging for Debugging (Masked)
    if (apiKey && apiKey.length > 10) {
        console.log(`[Snap2Code] Using API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)} (Length: ${apiKey.length})`);
    } else if (apiKey) {
        console.log(`[Snap2Code] Using API Key: ${apiKey} (Warning: Key is very short)`);
    } else {
        console.error("[Snap2Code] API Key is missing or undefined in process.env.API_KEY");
    }

    if (!apiKey) {
      throw new Error("API Key is missing. Please check your .env file.");
    }
    
    if (apiKey.includes("YourKeyHere")) {
         throw new Error("You are using the placeholder API Key. Please replace it with your actual key in the .env file.");
    }
    
    if (!apiKey.startsWith("AIza")) {
         throw new Error("Invalid API Key format. Google API keys usually start with 'AIza'. Please check your .env file.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = format === 'json' 
      ? "Extract all data from this image into a generic JSON structure."
      : format === 'sql'
      ? "Generate SQL schema and insert statements for the data in this image."
      : "Clone this image into code matching the system instructions exactly. Make it fully responsive.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        systemInstruction: PROMPTS[format],
        temperature: 0.2, 
      }
    });

    const text = response.text || "";
    
    // Check for potential empty responses or safety blocks implicit in empty text
    if (!text && response.candidates && response.candidates.length > 0) {
        const finishReason = response.candidates[0].finishReason;
        if (finishReason && finishReason !== 'STOP') {
             throw new Error(`Generation stopped due to safety reason: ${finishReason}`);
        }
    }

    if (!text) {
        throw new Error("No code generated. The model returned an empty response.");
    }
    
    // Cleanup markdown code blocks
    let cleanCode = text.trim();
    
    // Remove wrapping ```html ... ``` or similar
    if (cleanCode.startsWith('```')) {
        const firstLineBreak = cleanCode.indexOf('\n');
        if (firstLineBreak !== -1) {
            cleanCode = cleanCode.substring(firstLineBreak + 1);
        }
        if (cleanCode.endsWith('```')) {
            cleanCode = cleanCode.substring(0, cleanCode.length - 3);
        }
    }
    
    cleanCode = cleanCode.trim();

    return { code: cleanCode, format };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let errorMessage = "An unexpected error occurred while generating code.";
    
    // Improve error messaging based on common issues
    if (error.message) {
        // Check for Google API specific error codes in the message string or nested error object
        const msg = error.message.toLowerCase();

        if (msg.includes('api_key') || msg.includes('400') || msg.includes('invalid_argument')) {
            errorMessage = "Invalid API Key. The key provided was rejected by Google. Please ensure you have copied it correctly and enabled the API.";
        } else if (msg.includes('429') || msg.includes('quota')) {
            errorMessage = "API Quota exceeded. You may be sending too many requests. Please wait a moment.";
        } else if (msg.includes('503')) {
            errorMessage = "The AI service is currently unavailable. Please try again later.";
        } else if (msg.includes('safety')) {
            errorMessage = "The image was flagged by safety settings and could not be processed.";
        } else {
            errorMessage = error.message;
        }
    }

    throw new Error(errorMessage);
  }
};