# experiment-gpt-realtime-whisper

A minimal browser demo for live microphone transcription with OpenAI Realtime and `gpt-realtime-whisper`.

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a `.env` file in the project root:

   ```sh
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   Optional server settings:

   ```sh
   HOST=127.0.0.1
   PORT=3000
   ```

## Run

Start the local server:

```sh
npm run dev
```

Open the app in your browser:

```text
http://127.0.0.1:3000
```

Click **Start**, allow microphone access when prompted, and speak into your
microphone. Click **Stop** to end the transcription session.

## Notes

- Keep `OPENAI_API_KEY` server-side. The browser sends an SDP offer to
  `/session`, and the server forwards it to the OpenAI Realtime API.
- If you change `HOST` or `PORT`, use the matching URL in your browser.
- Microphone access generally requires a secure context. `localhost` and
  `127.0.0.1` are allowed by modern browsers for local development.
