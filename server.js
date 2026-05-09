import express from "express";
import "dotenv/config";

const app = express();
const host = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || 3000;

app.use(express.text({ type: ["application/sdp", "text/plain"] }));
app.use(express.static("public"));

const sessionConfig = JSON.stringify({
  type: "transcription",
  audio: {
    input: {
      transcription: {
        model: "gpt-realtime-whisper",
        // language: "en",
      },
    },
  },
});

app.post("/session", async (req, res) => {
  const formData = new FormData();
  formData.set("sdp", req.body);
  formData.set("session", sessionConfig);

  try {
    const response = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        // "OpenAI-Safety-Identifier": "hashed-user-id",
      },
      body: formData,
    });

    const sdp = await response.text();
    res.type("application/sdp").send(sdp);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

app.listen(port, host, () => {
  console.log(`Listening on http://${host}:${port}`);
});
