import express from 'express';
import textToSpeechModule from './text-to-speech/textToSpeech.module';
import dotenv from 'dotenv';
dotenv.config();

class AppModule {
    public app = express();

    constructor() {

        this.initializeMiddlewares();
        this.initializeModules();
    }

    private initializeMiddlewares() {
        this.app.use(express.json());
    }

    private initializeModules() {
        this.app.use('/api/text-to-speech', textToSpeechModule.routes);
    }
}

export default new AppModule().app;
