import React, { useCallback, useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketProvider";
import "./css/Start.css";
// Components
import Chat from "./Chat";
import Container from "./Container";
import InputContainer from "./InputContainer";
import Tools from "./Tools";
import UsernameInput from "./UsernameInput";

function Start() {
  const socket = useContext(SocketContext);

  const [connectionStatus, setConnectionStatus] = useState();
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [audio, setAudio] = useState(null);

  const addMessageToChat = (message, className) => {
    setMessages((prevMessages) => {
      const numMessages = prevMessages.length;

      if (numMessages >= 4) {
        return [{ message, className }];
      } else {
        return [...prevMessages, { message, className }];
      }
    });
  };

  // Handle username typing
  const handleInputChange = (event) => {
    setUsername(event.target.value);
  };

  // Handle submitting username to server
  const handleStart = (event) => {
    event.preventDefault();
    socket.emit("username", username);
    document.getElementById("username").innerText = "@" + username;
    setUsername("");
  };

  // Handle disconnecting from TikTok Live
  const handleDisconnect = () => {
    // chatRef.current.innerHTML = "";

    if (audio) {
      // Cancel TTS if its playing whilst trying to dc.
      audio.pause();
    }

    setMessages([]); // Clear previous chat messages
    setConnectionStatus("");
    socket.emit("TikTokDisconnect"); // Emit the TT disconnection to the server.
  };

  const handleSendTTS = useCallback(
    (text) => {
      console.log("Trying to send TTS...");
      fetch(`/api/audio?text=${encodeURIComponent(text)}`)
        .then((res) => res.blob())
        .then((blob) => {
          const newAudio = new Audio(URL.createObjectURL(blob));
          setAudio(newAudio); // Store a reference to the audio object
          newAudio.play();
          newAudio.addEventListener("ended", () => {
            console.log("TTS done playing");
            socket.emit("SpeechDone");
          });
        })
        .catch((err) => {
          console.error(err);
        });
    },
    [socket]
  );

  // Recieve connection status
  useEffect(() => {
    if (socket) {
      socket.on("ConnectionStatus", (data) => {
        setConnectionStatus(data);
      });
    }
  }, [socket]);

  // Recieve TikTok comment
  useEffect(() => {
    if (socket) {
      socket.on("Comment", (data) => {
        addMessageToChat(data, "comment");
        console.log(data);
      });
    }
  }, [socket]);

  // Receive GPT Answer
  useEffect(() => {
    if (socket) {
      socket.on("Answer", (data) => {
        console.log("Recieved GPT answer");
        addMessageToChat(data, "answer");
        handleSendTTS(data);
      });
    }
  }, [socket, handleSendTTS]);

  // // Fetch is tts enabled from server
  // useEffect(() => {
  //   console.log("Fetching TextToSpeechEnabled...");
  //   fetch("/api/ttsenabled", {
  //     headers: {
  //       Accept: "application/json",
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setTtsEnabled(data.ttsEnabled);
  //     })
  //     .catch((err) => console.error(err));
  // }, []);

  return (
    <div>
      <Container className="body-container" connectionStatus={connectionStatus}>
        <div className="site-header">
          <h1>TikTok Live AI</h1>
          <p>AI that responds to TikTok live comments.</p>
        </div>
        <Tools />
        <div>
          <InputContainer className="top-container">
            <UsernameInput username={username} handleInputChange={handleInputChange} handleStart={handleStart} handleDisconnect={handleDisconnect} connectionStatus={connectionStatus} />
          </InputContainer>
          <Chat className="chat-container" id="chats" messages={messages}></Chat>
        </div>
        {/* <h1>TTS: {ttsEnabled ? "Yes" : "No"}</h1> */}
      </Container>
    </div>
  );
}

export default Start;
