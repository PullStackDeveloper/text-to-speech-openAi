import { body } from 'express-validator';

// Validation rules for the text-to-speech input
export const textToSpeechDto = [
    body('text')
        .isString() // Ensure 'text' is a string
        .withMessage('Text must be a string') // Error message if 'text' is not a string
        .isLength({ min: 1 }) // Ensure 'text' is not empty
        .withMessage('Text must not be empty') // Error message if 'text' is empty
        .isLength({ max: 500 }) // Ensure 'text' does not exceed 500 characters
        .withMessage('Text must not exceed 500 characters') // Error message if 'text' is too long
];
