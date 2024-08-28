## Step-by-Step Creating a Text-to-Speech Application with OpenAI API

### Introduction

This tutorial will guide you through the process of creating a modular **Text-to-Speech (TTS)** application using *
*Node.js**, **TypeScript**, **Express**, and the **OpenAI API**. We will cover setting up the project, implementing TTS
functionality, and writing tests, all while adhering to clean code principles and best practices.

### Project Structure

The project is organized to separate concerns, making it maintainable, scalable, and easy to understand.

```plaintext
text-to-speech-openai/
├── src/
│   ├── middleware/
│   │   └── validationMiddleware.ts
│   ├── modules/
│   │   ├── text-to-speech/
│   │   │   ├── textToSpeech.controller.test.ts
│   │   │   ├── textToSpeech.controller.ts
│   │   │   ├── textToSpeech.dto.ts
│   │   │   ├── textToSpeech.module.ts
│   │   │   ├── textToSpeech.routes.ts
│   │   │   ├── textToSpeech.service.ts
│   │   └── app.module.ts
│   └── server.ts
├── .env
├── jest.config.js
├── package.json
├── tsconfig.json
```

### Step 1: Setting Up the Project

1. **Initialize the Project:**

   Begin by creating a new Node.js project and installing the necessary dependencies.

   ```bash
   mkdir text-to-speech-openai
   cd text-to-speech-openai
   npm init -y
   npm install typescript ts-node express dotenv axios uuid openai
   npm install --save-dev jest ts-jest @types/jest @types/node @types/express supertest @types/supertest
   ```

   This command initializes a new Node.js project and installs TypeScript, Express, Jest, and other required packages.

2. **Create `tsconfig.json`:**

   The `tsconfig.json` file configures the TypeScript compiler options.

   ```json
   {
     "compilerOptions": {
       "target": "ES2020", // Target ECMAScript 2020 for modern features
       "module": "commonjs", // Use CommonJS module system for compatibility with Node.js
       "rootDir": "./src", // Specify the root directory of TypeScript files
       "outDir": "./dist", // Output compiled files to the 'dist' directory
       "esModuleInterop": true, // Enable interoperability between CommonJS and ES Modules
       "forceConsistentCasingInFileNames": true, // Ensure consistent casing in file names
       "strict": true, // Enable all strict type-checking options
       "skipLibCheck": true // Skip type checking of declaration files
     },
     "include": ["src/**/*.ts"], // Include all TypeScript files in the 'src' directory
     "exclude": ["node_modules"] // Exclude the 'node_modules' directory from compilation
   }
   ```

3. **Create `jest.config.js`:**

   This file configures Jest for testing TypeScript files.

   ```javascript
   module.exports = {
       preset: 'ts-jest', // Use ts-jest preset for TypeScript testing
       testEnvironment: 'node', // Set the test environment to Node.js
       moduleFileExtensions: ['ts', 'js'], // Recognize TypeScript and JavaScript file extensions
       transform: {
           '^.+\\.(ts|tsx)$': 'ts-jest', // Transform TypeScript files using ts-jest
       },
       testMatch: ['**/src/modules/**/?(*.)+(spec|test).[tj]s?(x)'], // Match test files within the modules directory
       testPathIgnorePatterns: ['/node_modules/'], // Ignore tests in the 'node_modules' directory
   };
   ```

### Step 2: Setting Up Environment Variables

1. **Create `.env` File:**

   The `.env` file stores environment variables like the OpenAI API key.

   ```plaintext
   OPENAI_API_KEY=Your_OpenAI_API_Key_Here
   ```

   **Note:** This file should not be committed to version control, as it contains sensitive information.

### Step 3: Developing the Application Modules

1. **Create `app.module.ts`:**

   The `AppModule` initializes middlewares and modules for the application.

   ```typescript
   import express from 'express';
   import textToSpeechModule from './text-to-speech/textToSpeech.module'; // Import the Text-to-Speech module
   import dotenv from 'dotenv';
   dotenv.config(); // Load environment variables from .env file

   class AppModule {
       public app = express(); // Initialize an Express application

       constructor() {
           this.initializeMiddlewares(); // Initialize middlewares
           this.initializeModules(); // Initialize application modules
       }

       private initializeMiddlewares() {
           this.app.use(express.json()); // Use Express JSON parser middleware
       }

       private initializeModules() {
           this.app.use('/api/text-to-speech', textToSpeechModule.routes); // Register Text-to-Speech module routes under '/api/text-to-speech'
       }
   }

   export default new AppModule().app; // Export the initialized Express app
   ```

    - **`initializeMiddlewares()`**: This method configures middlewares, such as the JSON parser.
    - **`initializeModules()`**: This method integrates the Text-to-Speech module's routes into the application.

2. **Create `server.ts`:**

   This file starts the Express server.

   ```typescript
   import dotenv from 'dotenv';
   dotenv.config(); // Load environment variables
   import app from './modules/app.module'; // Import the initialized app

   const PORT = process.env.PORT || 3000; // Set the port from environment variables or default to 3000
   app.listen(PORT, () => {
       console.log(`Server is running on port ${PORT}`); // Log the server start
   });
   ```

   This script starts the server, listening on the specified port.

3. **Create `textToSpeech.service.ts`:**

   The service is responsible for the core Text-to-Speech functionality using the OpenAI API.

   ```typescript
   import { v4 as uuidv4 } from 'uuid';
   import path from 'path';
   import fs from 'fs';
   import OpenAI from 'openai';

   class TextToSpeechService {
       private openai = new OpenAI({
           apiKey: process.env.OPENAI_API_KEY!, // Initialize OpenAI with API key from environment variables
       });

       // Method to handle text-to-speech conversion
       async convertTextToSpeech(text: string): Promise<string> {
           // Use OpenAI API to generate speech from text
           const mp3 = await this.openai.audio.speech.create({
               model: "tts-1-hd", // Specify the model for text-to-speech conversion
               voice: "alloy", // Specify the voice to use
               input: text, // Input text to be converted to speech
           });

           // Generate a unique filename for the MP3 file
           const fileName = `${uuidv4()}.mp3`;
           const filePath = path.join(__dirname, '../../../temp', fileName); // Define the file path

           // Convert the audio data to a buffer and save it to a file
           const buffer = Buffer.from(await mp3.arrayBuffer());
           await fs.promises.writeFile(filePath, buffer); // Write the buffer to a file

           // Return the file path for later download
           return filePath;
       }
   }

   export default TextToSpeechService; // Export the service for use in the controller
   ```

    - **`convertTextToSpeech()`**: This method interacts with the OpenAI API to convert text into speech, saves the
      audio as an MP3 file, and returns the file path.

4. **Create `textToSpeech.controller.ts`:**

   The controller manages HTTP requests and delegates the conversion process to the service.

   ```typescript
   import { Request, Response } from 'express';
   import TextToSpeechService from './textToSpeech.service';

   class TextToSpeechController {
       private textToSpeechService: TextToSpeechService;

       constructor(textToSpeechService: TextToSpeechService) {
           // Initialize the controller with a TextToSpeechService instance
           this.textToSpeechService = textToSpeechService;
       }

       // Controller method to handle text-to-speech conversion requests
       convertTextToSpeech = async (req: Request, res: Response) => {
           try {
               const { text } = req.body; // Extract text from the request body

               // Use the service to convert text to speech
               const filePath = await this.textToSpeechService.convertTextToSpeech(text);

               const fileName = filePath.split('/').pop() || 'output.mp3'; // Extract the file name from the path

               // Send the MP3 file as a download
               res.download(filePath, fileName, (err) => {
                   if (err) {
                       console.error('Error sending the file:', err); // Log any error that occurs during file download
                       res.status(500).send('Error generating the audio file'); // Send a 500 status if an error occurs
                   }
               });
           } catch (error) {
               console.error('Error converting text to speech:', error); // Log the error
               res.status(500).json({ error: 'Error converting text to audio' }); // Send a 500 status with error message}};
   }
   export default new TextToSpeechController(new TextToSpeechService()); // Export the controller with a service instance
   ```

   - **`convertTextToSpeech()`**: This method handles the incoming HTTP POST request, processes it using the service, and sends the generated MP3 file as a response.

5. **Create `textToSpeech.dto.ts`:**

   The DTO (Data Transfer Object) defines validation rules for the request data.

   ```typescript
   import { body } from 'express-validator';

   // Validation rules for the text-to-speech input
   export const textToSpeechDto = [
       body('text')
           .isString() // Ensure 'text' is a string
           .withMessage('Text must be a string') // Custom error message if validation fails
           .isLength({ min: 1 }) // Ensure 'text' is not empty
           .withMessage('Text must not be empty') // Custom error message if validation fails
           .isLength({ max: 500 }) // Ensure 'text' is not too long
           .withMessage('Text must not exceed 500 characters') // Custom error message if validation fails
   ];
   ```

- **`textToSpeechDto`**: This array of validation rules ensures that the `text` field is a non-empty string with a
  maximum length of 500 characters.

6. **Create `validationMiddleware.ts`:**

   The middleware checks for validation errors in the request.

   ```typescript
   import { Request, Response, NextFunction } from 'express';
   import { validationResult } from 'express-validator';

   export const validationMiddleware = (
       req: Request,
       res: Response,
       next: NextFunction
   ) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
           return res.status(400).json({ errors: errors.array() }); // If validation fails, return 400 with error details
       }
       next(); // If validation passes, proceed to the next middleware/controller
   };
   ```

    - **`validationMiddleware`**: This middleware function checks for validation errors and sends a 400 response if any
      are found.

7. **Create `textToSpeech.routes.ts`:**

   Define the routes for the TTS module.

   ```typescript
   import { Router } from 'express';
   import textToSpeechController from './textToSpeech.controller';
   import { textToSpeechDto } from './textToSpeech.dto';
   import { validationMiddleware } from '../../middleware/validationMiddleware';

   const router = Router();

   // POST route to handle text-to-speech conversion requests
   router.post(
       '/convert',
       textToSpeechDto, // Apply validation rules
       validationMiddleware, // Apply validation middleware
       textToSpeechController.convertTextToSpeech // Handle the request in the controller
   );

   export default router;
   ```

    - **Routing Concepts**: The `router` object handles routing in Express. Each route corresponds to an HTTP method (
      GET, POST, etc.) and URL path.
    - **Separating Route Methods**: Organizing routes in separate files (like `textToSpeech.routes.ts`) promotes
      modularity. This separation makes the code easier to maintain, test, and scale, as each route handler is isolated
      in its own file.

8. **Create `textToSpeech.module.ts`:**

   This module integrates the routes into the main application.

   ```typescript
   import textToSpeechRoutes from './textToSpeech.routes';

   export default {
       routes: textToSpeechRoutes // Export routes for integration into the main application
   };
   ```

### Step 4: Writing Tests

1. **Create `textToSpeech.controller.test.ts`:**

   Test the controller logic.

   ```typescript
   import { Request, Response } from 'express';
   import TextToSpeechController from './textToSpeech.controller';
   import TextToSpeechService from './textToSpeech.service';

   jest.mock('./textToSpeech.service'); // Mock the service to isolate the controller

   describe('TextToSpeechController', () => {
       let req: Partial<Request>; // Mock request object
       let res: Partial<Response>; // Mock response object

       beforeEach(() => {
           req = { body: { text: 'Hello, world!' } }; // Set up mock request body
           res = {
               download: jest.fn(), // Mock download method
               status: jest.fn().mockReturnThis(), // Mock status method
               json: jest.fn() // Mock json method
           };
       });

       it('should call the service and return the generated file', async () => {
           const mockFilePath = '/some/path/to/file.mp3';
           const convertTextToSpeechSpy = jest.spyOn(TextToSpeechService.prototype, 'convertTextToSpeech')
               .mockResolvedValue(mockFilePath); // Mock the service method to return a fake file path

           await TextToSpeechController.convertTextToSpeech(req as Request, res as Response); // Call the controller method

           expect(convertTextToSpeechSpy).toHaveBeenCalledWith('Hello, world!'); // Check if the service method was called with correct text
           expect(res.download).toHaveBeenCalledWith(mockFilePath, expect.any(String), expect.any(Function)); // Check if the download method was called with the correct arguments

           convertTextToSpeechSpy.mockRestore(); // Restore the original service method
       });

       it('should handle errors thrown by the service', async () => {
           const convertTextToSpeechSpy = jest.spyOn(TextToSpeechService.prototype, 'convertTextToSpeech')
               .mockRejectedValue(new Error('Conversion failed')); // Mock the service method to throw an error

           await TextToSpeechController.convertTextToSpeech(req as Request, res as Response); // Call the controller method

           expect(res.status).toHaveBeenCalledWith(500); // Check if the status method was called with 500
           expect(res.json).toHaveBeenCalledWith({ error: 'Error converting text to audio' }); // Check if the json method was called with the correct error message

           convertTextToSpeechSpy.mockRestore(); // Restore the original service method
       });
   });
   ```

    - **Test Concepts**: This test suite verifies that the controller behaves correctly by mocking the service and
      checking how the controller handles success and error scenarios.

### Step 5: Running the Application

1. **Start the Server:**

   Run the following command to start your application:

   ```bash
   npm start
   ```

2. **Test the Application:**

   You can test the application using tools like Postman or by writing additional tests using Jest.

3. **Run Tests:**

   Run all tests using Jest:

   ```bash
   npm test
   ```

### Modular Structure and Clean Code

The modular structure we've implemented has several advantages:

1. **Separation of Concerns:** Each module has a specific responsibility, such as handling text-to-speech logic,
   routing, or validation. This separation makes the code easier to maintain and test.

2. **Scalability:** As your application grows, you can add new modules without affecting existing code. This modularity
   supports the easy addition of new features.

3. **Reusability:** Code within modules can be reused across different parts of the application or even in other
   projects.

4. **Testability:** With clear boundaries between components, writing unit tests becomes straightforward. Each module
   can be tested in isolation, leading to more reliable and maintainable tests.

5. **Clean Code Practices:** By adhering to principles like Single Responsibility and Dependency Injection, your code
   remains clean, understandable, and adaptable to future changes.