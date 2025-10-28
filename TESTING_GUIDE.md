# StoryWeaver AI - Testing Guide

## Overview
This guide provides step-by-step instructions for testing all the fixes and improvements implemented in the StoryWeaver application.

---

## Prerequisites

1. **Development Server Running**
   ```bash
   npm run dev
   ```
   Server should be running at: http://localhost:3001

2. **Browser Requirements**
   - Firefox (recommended)
   - Chrome/Chromium
   - Edge
   - Microphone access enabled

3. **API Keys Required**
   - `API_KEY` (Gemini API) - for story and image generation
   - `NANO_GPT_API_KEY` - for image generation (primary)

---

## Test Suite 1: STT (Speech-to-Text) Feature

### Test 1.1: Basic Voice Input
**Steps:**
1. Open http://localhost:3001
2. Click "Start Your Story"
3. Look for the blue microphone button (should be visible if microphone is available)
4. Click the microphone button
5. Observe: Button should turn red and pulse
6. Speak clearly: "A brave knight enters a magical forest"
7. Click the microphone button again to stop
8. Observe: Button should return to blue, show "Transcribing your voice..." placeholder

**Expected Results:**
- ✅ Microphone button appears (blue)
- ✅ Recording starts (button turns red and pulses)
- ✅ Recording stops when clicked again
- ✅ Transcription completes within 5-10 seconds
- ✅ Transcribed text appears in the input field
- ✅ Text is accurate (or close to what was spoken)

**Console Logs to Check:**
```
🎤 Starting recording...
🎤 Recording started successfully
🎤 Recording started
🎤 Stopping recording and starting transcription...
🎤 Audio blob received, size: XXXX bytes
🎤 Transcribing audio...
   Audio blob size: XXXX bytes
   Audio blob type: audio/webm
✓ Transcription complete: [your text]
🎤 Transcription successful: [your text]
```

### Test 1.2: No Speech Detected
**Steps:**
1. Click microphone button
2. Wait 2 seconds in silence
3. Click microphone button to stop

**Expected Results:**
- ✅ Alert message: "No speech detected. Please speak louder or closer to the microphone and try again."
- ✅ Input field remains empty
- ✅ No errors in console

### Test 1.3: Microphone Permission Denied
**Steps:**
1. In browser settings, block microphone access for localhost:3001
2. Refresh the page
3. Observe: Microphone button should NOT appear

**Expected Results:**
- ✅ Microphone button is hidden
- ✅ No errors in console
- ✅ App functions normally without voice input

### Test 1.4: Multiple Recordings
**Steps:**
1. Record and transcribe: "Once upon a time"
2. Submit the prompt
3. Wait for story to generate
4. Record and transcribe: "The hero found a treasure"
5. Submit the prompt

**Expected Results:**
- ✅ Both recordings work correctly
- ✅ No interference between recordings
- ✅ Whisper model loads only once (check console for "Loading Whisper STT model" - should appear only on first use)

---

## Test Suite 2: Text Streaming for Story Generation

### Test 2.1: Basic Text Streaming
**Steps:**
1. Type or speak: "A young wizard discovers a magical book"
2. Click Send or press Enter
3. Observe the AI response area

**Expected Results:**
- ✅ Text appears progressively (word-by-word or chunk-by-chunk)
- ✅ NOT all at once after 5-10 seconds
- ✅ Streaming starts within 1-2 seconds
- ✅ Full text appears within 5-10 seconds
- ✅ No flickering or jumping text

**Console Logs to Check:**
```
📖 Generating story segment (streaming)...
   User prompt: A young wizard discovers a magical book
   Using model: gemini-2.0-flash-001
   Chat instance created, sending message...
   ✓ Stream started
   ✓ Stream complete, full text length: XXX
   ✓ Story segment generated successfully
```

### Test 2.2: Image Placeholder During Generation
**Steps:**
1. Submit a prompt
2. Watch the AI response area while text is streaming

**Expected Results:**
- ✅ Image placeholder appears immediately (before image is ready)
- ✅ Placeholder shows:
  - Gradient background (purple → pink → yellow)
  - Bouncing image icon
  - "Illustrating your story..." text
  - Three bouncing dots
  - Shimmer animation effect
- ✅ Placeholder maintains aspect ratio (no layout shift)

### Test 2.3: Image Fade-In Transition
**Steps:**
1. Submit a prompt
2. Wait for text to complete streaming
3. Watch for image to load

**Expected Results:**
- ✅ Image fades in smoothly (0.5s transition)
- ✅ No sudden "pop" or jarring appearance
- ✅ Placeholder disappears when image appears
- ✅ No layout shift when image loads

**Console Logs to Check:**
```
📖 Story text complete, generating image...
🖼️  Generating image...
   Prompt: [image prompt]
   Using NanoGPT API (qwen-image model)
   ✓ Image generated successfully (base64 format)
```

### Test 2.4: Multiple Story Segments
**Steps:**
1. Submit prompt: "A dragon appears"
2. Wait for completion
3. Submit prompt: "The wizard casts a spell"
4. Wait for completion
5. Submit prompt: "They become friends"

**Expected Results:**
- ✅ Each segment streams correctly
- ✅ Each image placeholder appears and transitions
- ✅ No interference between segments
- ✅ Scroll automatically to latest segment
- ✅ All segments remain visible in history

---

## Test Suite 3: Interactive Book View

### Test 3.1: Image Placeholder in Book View
**Steps:**
1. Generate at least one story segment with an image
2. Click "Export" button
3. Click "View Interactive Book"
4. Navigate through pages

**Expected Results:**
- ✅ Images display correctly in book view
- ✅ If a page is still loading, placeholder appears
- ✅ Same fade-in transition as story view
- ✅ Navigation works smoothly

### Test 3.2: TTS in Book View
**Steps:**
1. In book view, click the speaker button

**Expected Results:**
- ✅ Button shows "Loading..." while TTS model loads (first time only)
- ✅ Audio plays correctly
- ✅ Button disabled while playing
- ✅ No errors in console

**Console Logs to Check:**
```
Loading Kokoro TTS model (first time only, ~82MB)...
✓ Kokoro TTS model loaded successfully
```

---

## Test Suite 4: Error Handling

### Test 4.1: API Quota Exhausted
**Steps:**
1. If you've used up your Gemini API quota, submit a prompt

**Expected Results:**
- ✅ Error message: "We've used up our magic for today! Please try again tomorrow or contact support."
- ✅ User prompt is removed from history
- ✅ App remains functional
- ✅ Can try again later

### Test 4.2: Network Error
**Steps:**
1. Disconnect from internet
2. Submit a prompt

**Expected Results:**
- ✅ Error message appears
- ✅ App doesn't crash
- ✅ Can retry when connection is restored

### Test 4.3: Invalid API Key
**Steps:**
1. Set invalid API key in environment
2. Submit a prompt

**Expected Results:**
- ✅ Error message appears
- ✅ Console shows detailed error
- ✅ App remains functional

---

## Test Suite 5: Full Workflow Integration

### Test 5.1: Complete Story Creation Workflow
**Steps:**
1. Open app
2. Click "Start Your Story"
3. Use voice input: "A magical adventure begins"
4. Submit prompt
5. Watch text stream and image load
6. Use voice input: "The hero meets a friendly dragon"
7. Submit prompt
8. Watch text stream and image load
9. Type: "They fly to a castle in the clouds"
10. Submit prompt
11. Click "Export" → "View Interactive Book"
12. Navigate through pages
13. Click speaker button to hear TTS
14. Click "Export" → "Download PDF"

**Expected Results:**
- ✅ All features work together seamlessly
- ✅ No errors at any step
- ✅ Smooth transitions throughout
- ✅ Professional, polished UX
- ✅ PDF generates correctly

---

## Test Suite 6: Performance and Console Checks

### Test 6.1: Console Error Check
**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Perform all tests above
4. Check for errors

**Expected Results:**
- ✅ No red errors in console
- ✅ Only informational logs (blue/gray)
- ✅ No warnings about deprecated APIs
- ✅ No memory leaks

### Test 6.2: Network Tab Check
**Steps:**
1. Open DevTools → Network tab
2. Submit a prompt
3. Watch network requests

**Expected Results:**
- ✅ Streaming request to Gemini API
- ✅ Image generation request to NanoGPT or Gemini
- ✅ No failed requests (or proper fallback handling)
- ✅ Reasonable response times

### Test 6.3: Performance Check
**Steps:**
1. Generate 5-10 story segments
2. Check browser performance

**Expected Results:**
- ✅ No lag or stuttering
- ✅ Smooth scrolling
- ✅ Animations run at 60fps
- ✅ Memory usage remains stable

---

## Test Suite 7: Browser Compatibility

### Test 7.1: Firefox
**Steps:**
1. Open in Firefox
2. Run all tests above

**Expected Results:**
- ✅ All features work correctly
- ✅ No Firefox-specific errors

### Test 7.2: Chrome/Chromium
**Steps:**
1. Open in Chrome
2. Run all tests above

**Expected Results:**
- ✅ All features work correctly
- ✅ No Chrome-specific errors

### Test 7.3: Edge
**Steps:**
1. Open in Edge
2. Run all tests above

**Expected Results:**
- ✅ All features work correctly
- ✅ No Edge-specific errors

---

## Known Issues and Limitations

1. **Text Streaming Speed**: Depends on API response time and network speed
2. **Image Generation Time**: 5-15 seconds (API limitation)
3. **STT Accuracy**: Depends on microphone quality and background noise
4. **Model Loading**: First-time loads can take 5-10 seconds (Whisper, Kokoro)

---

## Troubleshooting

### Issue: Microphone button doesn't appear
**Solution:**
- Check browser microphone permissions
- Ensure microphone is connected
- Try refreshing the page

### Issue: Text doesn't stream (appears all at once)
**Solution:**
- Check network connection
- Verify API key is valid
- Check console for errors

### Issue: Image placeholder doesn't show
**Solution:**
- Check CSS animations are enabled
- Verify browser supports CSS animations
- Check console for errors

### Issue: "Voice input failed" error
**Solution:**
- Speak louder or closer to microphone
- Check microphone is working in other apps
- Try recording again
- Check console for detailed error

---

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ Smooth, responsive UI
- ✅ Clear visual feedback at all times
- ✅ Professional, polished UX
- ✅ All features working as expected

---

## Reporting Issues

If you find any issues during testing:

1. **Note the exact steps to reproduce**
2. **Check browser console for errors**
3. **Take screenshots if applicable**
4. **Note browser and OS version**
5. **Check network tab for failed requests**

Include all this information when reporting the issue.

