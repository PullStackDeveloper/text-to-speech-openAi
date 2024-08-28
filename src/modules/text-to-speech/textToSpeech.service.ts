import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';

class TextToSpeechService {
    private openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY!, // Initialize OpenAI with API key
    });

    // Method to handle text-to-speech conversion
    async convertTextToSpeech(text: string): Promise<string> {
        // Create the speech using OpenAI
        const mp3 = await this.openai.audio.speech.create({
            model: "tts-1-hd",
            voice: "alloy",
            input: text,
        });

        // Generate a unique filename for the MP3 file
        const fileName = `${uuidv4()}.mp3`;
        const filePath = path.join(__dirname, '../../../temp', fileName);

        // Convert the audio data to a buffer and save it to a file
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.promises.writeFile(filePath, buffer);

        // Return the file path for later download
        return filePath;
    }
}

export default TextToSpeechService;
