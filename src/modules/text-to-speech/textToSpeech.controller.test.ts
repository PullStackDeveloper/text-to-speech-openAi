import { Request, Response } from 'express';
import TextToSpeechController from './textToSpeech.controller';
import TextToSpeechService from './textToSpeech.service';

jest.mock('./textToSpeech.service');

describe('TextToSpeechController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = { body: { text: 'Hello, world!' } };
        res = {
            download: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('should call the service and return the generated file', async () => {
        const mockFilePath = '/some/path/to/file.mp3';
        const convertTextToSpeechSpy = jest.spyOn(TextToSpeechService.prototype, 'convertTextToSpeech')
            .mockResolvedValue(mockFilePath);

        await TextToSpeechController.convertTextToSpeech(req as Request, res as Response);

        expect(convertTextToSpeechSpy).toHaveBeenCalledWith('Hello, world!');
        expect(res.download).toHaveBeenCalledWith(mockFilePath, expect.any(String), expect.any(Function));

        convertTextToSpeechSpy.mockRestore();
    });

    it('should handle errors thrown by the service', async () => {
        const convertTextToSpeechSpy = jest.spyOn(TextToSpeechService.prototype, 'convertTextToSpeech')
            .mockRejectedValue(new Error('Conversion failed'));

        await TextToSpeechController.convertTextToSpeech(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Error converting text to audio' });

        convertTextToSpeechSpy.mockRestore();
    });
});
