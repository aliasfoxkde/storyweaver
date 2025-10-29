Per your priority list, start P2:

Stop/resume toggle
Project state persistence
File/folder drag and drop
Manual file creation broken

## Execution Principles
- **Work autonomously**: Make informed decisions without asking questions
- **Deep research first**: Use `codebase-retrieval` and `git-commit-retrieval` before every change
- **Validate everything**: Never claim completion without running tests and manual verification
- **Document evidence**: Provide concrete proof (test results, screenshots, metrics) for every completion
- **No shortcuts**: Follow the full validation cycle for every task
- **Quality over speed**: Ensure correctness and completeness before moving to next task
- **Incremental progress**: Complete one task fully before starting the next
- **No regressions**: Existing functionality must continue to work

CRITICAL ISSUES:
ARTIFACT SCROLLING IS NOT WORKING, AND NOTES IS SHOWING OFF THE PAGE... FIX THIS NOW!!!
MARKDOWN STYLING LOOK RETARDED, FIX BY USING A FUCKING LIBRARY AS I HAVE TOLD YOU COUNTLESS TIMES.
FIX THE TOP BAR ON THE MARKDOWN FILES (NOT THE TAB BAR); THE FILENAME IS RENDUNDANT HERE COMPARED TO THE TAB (TAB FILENAME IS ALL THAT'S NEEDED); THE BUTTONS ON THIS TOP BAR DO NOT FUNCTION; THE TOP BAR SHOULD BE GUI EDITING OPTIONS!!!!!!!!!!!!!!!!! FIX IT GOD DAMN IT!!!!
IF I HAVE "FOLLOW AI" FEATURE OFF, AND I CLOSE ALL OF THE TABS, ARTIFACTS SHOULD GET CLOSED!!!!!!!!!!!

MORE:
- Add Browser, Chat, etc. to the view bar and get the initial views/layouts at least working (they should switch to dedicated layouts per view).
- Add a left-collapseable bar to the top of the chat-thread!!!!!!!!



GEMINI_API_KEY=AIzaSyByZp4CqmNu-YH9uFTGBMljgxeRZvnPdAE

A Story about two young brothers, Fabel 11, and Jayce 9, going on an adventure.


Modify the system to use:
- NANO_GPT_API_KEY (see .env.local) with "qwen-image" for image generation,
- Kokoro JS for TTS: `npm i kokoro-js`
  - Code: https://github.com/hexgrad/kokoro/tree/main/kokoro.js
  - Voice: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices/af_aoede.bin
  - Fast TTS Model: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/onnx/model_q4f16.onnx
- Whisper Tiny for STT: https://huggingface.co/Xenova/whisper-tiny.en
  - Fast Decode Model: https://huggingface.co/Xenova/whisper-tiny.en/resolve/main/onnx/decoder_model_merged_q4f16.onnx
  - Fast Encode Model: https://huggingface.co/Xenova/whisper-tiny.en/resolve/main/onnx/encoder_model_q4f16.onnx
- With Transformers JS: `npm install @xenova/transformers`
- And the ONNX.js runtime: https://www.npmjs.com/package/onnxruntime-web


References:
- https://github.com/microsoft/onnxjs

Example Image Generation Code:
const API_KEY = 'YOUR_API_KEY';
const URL = 'https://nano-gpt.com/api/v1/images/generations';

const response = await fetch(URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'qwen-image',
    prompt: 'A serene mountain landscape at sunset',
    n: 1,
    size: '512x512',
    response_format: 'url',
    user: 'example-user-123',
    // Optional advanced parameters
    // imageDataUrl: 'data:image/jpeg;base64,/9j/4AAQ...',
    // imageDataUrls: [
    //   'data:image/jpeg;base64,/9j/4AAQ...',
    //   'data:image/png;base64,iVBORw0KGgo...'
    // ],
    // maskDataUrl: 'data:image/png;base64,iVBORw0KGgo...',
    // strength: 0.8,
    // guidance_scale: 7.5,
    // num_inference_steps: 30,
    // seed: 42,
    // kontext_max_mode: false
  })
});

const result = await response.json();
console.log(result);
