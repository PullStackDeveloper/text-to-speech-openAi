import { Router } from 'express';
import textToSpeechController from './textToSpeech.controller';
import { textToSpeechDto } from './textToSpeech.dto';
import { validationMiddleware } from '../../middleware/validationMiddleware';

const router = Router();

router.post(
    '/convert',
    textToSpeechDto,
    validationMiddleware,
    textToSpeechController.convertTextToSpeech
);

export default router;
