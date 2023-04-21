var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
require("dotenv").config();
const { callGPT } = require("./gpt.js");
const { WebcastPushConnection } = require("tiktok-live-connector");
const http = require("http");
const express = require("express");
const cors = require("cors");
const voice = require("elevenlabs-node");
// TTS
let useTextToSpeech = process.env.USE_TTS === "true";
let ttsVoiceID = process.env.ELEVEN_LABS_VOICE_ID;
const ttsApiKey = process.env.TTS_API_KEY; // Your API key from Elevenlabs
// const voiceID = "MF3mGyEYCl7XYWbV9V6O"; // The ID of the voice you want to get
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
let tiktokLiveConnection;
let tiktokUsername;
let timeBetweenComments;
let allowComment = true;
let isDisconnected = true;
let prevComment;
let style = "Default";
console.log(useTextToSpeech);
// Set up event listener for new connections
io.on("connection", (socket) => {
    console.log("a user connected");
    // Recieve username
    socket.on("username", (data) => {
        //console.log(`Username: ${data}`);
        if (tiktokUsername === data) {
            // Check if username is the same
            console.log("ERROR: Same username");
        }
        handleUsername(data);
    });
    // Handle disconnecting from the live
    socket.on("TikTokDisconnect", () => {
        if (tiktokLiveConnection) {
            // Only disconnect if there is a connection.
            isDisconnected = true;
            tiktokLiveConnection.disconnect();
            console.log("Live disconnected by user");
        }
        allowComment = true;
    });
    socket.on("SetStyle", (data) => {
        style = data;
        console.log(`Current style: ${style}`);
    });
    // Recieve setting: Time between comments
    socket.on("TimeBetweenComments", (data) => {
        timeBetweenComments = data;
        console.log(`Comment delay: ${timeBetweenComments}ms`);
    });
    // Set up event listener for socket disconnections
    socket.on("disconnect", () => {
        console.info("User disconnected from socket.");
        if (tiktokLiveConnection) {
            tiktokLiveConnection.disconnect();
            console.info("Live disconnected by socket");
        }
    });
    // Get event when tts has ended
    socket.on("SpeechDone", () => {
        console.log("Speech done");
        allowComment = true;
        console.log("TTS Done - Allow next comment ->");
    });
});
// Handle username of target TikTok live
function handleUsername(incomingUsername) {
    // Perform username validation checks before assigning
    if (incomingUsername === "") {
        console.info("Username is empty");
        io.emit("ConnectionStatus", "Username is empty");
        return;
    }
    else if (incomingUsername.length < 4) {
        // Check if username is too short
        console.info("Username too short");
        io.emit("ConnectionStatus", "Username too short");
        return;
    }
    else if (incomingUsername.length > 30) {
        // Check if username is too long
        console.info("Username too long");
        io.emit("ConnectionStatus", "Username too long");
        return;
    }
    else if (!incomingUsername.startsWith("@")) {
        // Check if username starts with @
        console.info("Bad username format. Adding @ to username.");
        incomingUsername = "@" + incomingUsername;
    }
    tiktokUsername = incomingUsername;
    handleTikTokLiveConnection();
}
function handleTikTokLiveConnection() {
    io.emit("ConnectionStatus", "Connecting..."); // Send status to front-end
    if (tiktokLiveConnection) {
        // Check if there is already a connection. If so, disconnect it first
        tiktokLiveConnection.disconnect();
        console.log("Disconnected by new user.");
    }
    // Create a new connection to TikTok live
    tiktokLiveConnection = new WebcastPushConnection(tiktokUsername, {
        processInitialData: false,
    });
    // TikTok live events
    tiktokLiveConnection
        .connect()
        .then((state) => {
        console.info(`Connected to roomId ${state.roomId}`);
        io.emit("ConnectionStatus", "Connected");
        isDisconnected = false;
    })
        .catch((err) => {
        console.error("Failed to connect", err);
        io.emit("ConnectionStatus", "Error connecting.");
    });
    // Handle recieving comments from TikTok API
    tiktokLiveConnection.on("chat", (data) => {
        handleComment(data.uniqueId, data.comment);
    });
    tiktokLiveConnection.on("disconnected", () => {
        console.info("Disconnected by live connection.");
    });
}
// Handle incoming TikTok comments
function handleComment(user, comment) {
    if (!allowComment) {
        // Comments not allowed
        console.log("IGNORE: Already processing...");
        return;
    }
    else if (comment.includes("@")) {
        // Comment is a reply
        console.log("IGNORE: Comment is a reply.");
        return;
    }
    else if (comment.length > 200) {
        // Comment is too long
        console.log("IGNORE: Comment is too long.");
        return;
    }
    else if (comment === prevComment) {
        // Comment is the same as previous
        console.log("IGNORE: Comment is same as previous.");
        return;
    }
    // Handle comment
    allowComment = false;
    prevComment = comment;
    handleAnswer(comment);
    io.emit("Comment", `${user}: ${comment}`);
}
// Handle sending TikTok comment to GPT
function handleAnswer(question) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Sending to GPT...");
        const result = yield callGPT(question, style);
        // To prevent GPT answering after disconnect
        if (!isDisconnected) {
            io.emit("Answer", result);
            // console.log(`GPT: ${result}`);
            // Set timeout between comments
            setTimeout(() => {
                if (!useTextToSpeech) {
                    allowComment = true;
                    console.log("Allow next comment ->");
                }
            }, timeBetweenComments);
        }
    });
}
// TTS API
app.get("/api/audio", (req, res) => {
    const { text } = req.query;
    if (useTextToSpeech) {
        // Only use the TTS API if TTS is enabled
        voice
            .textToSpeechStream(ttsApiKey, ttsVoiceID, text, 0.7, 0.7)
            .then((stream) => {
            stream.pipe(res);
        })
            .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        });
    }
    else {
        res.send("Text-to-speech is not enabled.");
    }
});
// Return is tts enabled
app.get("/api/ttsenabled", (req, res) => {
    console.log(useTextToSpeech);
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ ttsEnabled: useTextToSpeech });
});
// Start the server
const port = process.env.PORT || 3001;
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
