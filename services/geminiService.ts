import { GoogleGenAI } from "@google/genai";
import { ConversionResult } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert frontend engineer and UI/UX designer.
Your mission is to generate a pixel-perfect HTML/Tailwind clone of the provided image.

Step-by-Step Instructions:
1.  **Analyze the Design**: Identify the grid system, alignment (flex/grid), and visual hierarchy.
2.  **Extract Colors**: Use the EXACT hex codes from the image for backgrounds, text, and accents. Do not guess colors; assume you are using an eye-dropper tool.
3.  **Typography**: Match font weights, sizes, and families (Serif vs Sans). Use Google Fonts via CDN (e.g., Inter, Roboto, Playfair Display) to best match the image.
4.  **Replicate Components**: 
    - Buttons: Match padding, border-radius, shadow, and gradient exactly.
    - Cards: Replicate border styling, shadow intensity, and corner radius.
    - Navigation: Ensure items are spaced correctly.
5.  **Interactivity**: Write vanilla JavaScript <script> tags for mobile menus, dropdowns, or modals if visible in the design.
6.  **Assets**:
    - Use 'https://placehold.co/{width}x{height}' for generic placeholders.
    - Use FontAwesome 6 CDN for icons: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    - Use Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
7.  **Content**: Transcribe visible text exactly. If text is illegible, use Lorem Ipsum of the same visual length.

Output:
- Return ONLY the raw HTML code.
- No Markdown blocks.
- No explanations.
`;

export const generateHtmlFromImage = async (base64Data: string, mimeType: string): Promise<ConversionResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing in environment variables");
    }

    const ai = new GoogleGenAI({ apiKey });
    
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
            text: "Clone this image into a pixel-perfect, responsive HTML/Tailwind website. Match the colors and design exactly."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Lower temperature for more precise, deterministic cloning
      }
    });

    const text = response.text || "";
    
    // Cleanup if the model accidentally adds markdown despite instructions
    const cleanHtml = text.replace(/^```html/, '').replace(/^```/, '').replace(/```$/, '').trim();

    return { html: cleanHtml };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};