import { Request, Response } from 'express';
import TextToSpeechService from './textToSpeech.service';

class TextToSpeechController {
    private textToSpeechService: TextToSpeechService;

    constructor(textToSpeechService: TextToSpeechService) {
        // Now we pass the service instance via constructor
        this.textToSpeechService = textToSpeechService;
    }

    // Controller method to handle the text-to-speech conversion request
    convertTextToSpeech = async (req: Request, res: Response) => {
        try {
            const { text } = req.body; // Extract text from request body

            // Use the service to convert text to speech
            const filePath = await this.textToSpeechService.convertTextToSpeech(text);

            const fileName = filePath.split('/').pop() || 'output.mp3'; // Ensure fileName is always a string

            // Send the MP3 file as a download
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error('Error sending the file:', err);
                    res.status(500).send('Error generating the audio file');
                }
                // Optionally, delete the file after sending
                // fs.unlinkSync(filePath);
            });
        } catch (error) {
            console.error('Error converting text to speech:', error);
            res.status(500).json({ error: 'Error converting text to audio' });
        }
    };
}

// Create a default instance of the controller with the service injected
export default new TextToSpeechController(new TextToSpeechService());
