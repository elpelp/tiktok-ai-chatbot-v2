# TikTok AI Chatbot V2

Answers to a TikTok lives comments using OpenAI ChatGPT API and ElevenLabs Text-To-Speech.

## Installation

To get started, clone this repository to your local machine using the following command:

```bash
git clone https://github.com/mikouzdev/tiktok-ai-chatbot-v2.git
```


Once the repository is cloned, navigate to the project directory and install the dependencies for both the frontend and backend using the following command:


```bash
cd tiktok-ai-chatbot-v2
npm install
```


## Usage
### Setup
To get started, begin by renaming the file called ``.env.template`` to ``.env``. <br> 
Once you've done that, open the ``.env`` file and update the following variables: <br>

``OPENAI_API_KEY``, set this to your OpenAI API key. <br>
``USE_TTS``, set this to ``true`` if you want to use the Text-To-Speech functionality.<br>
``TTS_API_KEY``, set this to your ElevenLabs API key. <br>
``ELEVEN_LABS_VOICE_ID``, set this to the ElevenLabs voiceID you wish to use. <br>

It's important to note that using the text-to-speech feature is optional. <br>
If you'd prefer not to use it, you can simply leave the ``USE_TTS`` variable empty. <br>

### Starting the application.
Then you'll need to start the frontend of the application by running the following command: <br>
```bash
npm run start
```
This will start the React development server and launch the application in your default browser at `http://localhost:3000/`.  <br>


To start the Node.js backend of the application, run this command: <br>
```bash
node server/server.js
```
This wil start the server so it can recieve comments from a TikTok Live and access OpenAI's API.

## Dependencies
[OpenAI ChatGPT API](https://platform.openai.com/docs/guides/chat): Used to generate natural language responses to comments in a TikTok live. <br>
[ElevenLabs API](https://docs.elevenlabs.io/quickstart): Utilized for the Text-To-Speech feature, which enables the AI-generated responses to be read aloud.
