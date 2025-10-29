
# StoryWeaver AI Implementation Plan

## Overview
StoryWeaver AI is an interactive storytelling app for kids. It uses AI to write stories, generate unique illustrations for each page, and read the story aloud. The app is built using React and TypeScript, with Tailwind CSS for styling. The AI services are provided by Google's Gemini API.

## Features
1. **Interactive Storytelling**: Users can input prompts to guide the story. The app uses AI to generate a new paragraph and an image prompt for each user input.
2. **Illustration Generation**: For each AI-generated paragraph, the app uses AI to generate a unique illustration. Users can edit these illustrations if they wish.
3. **Audio Narration**: The app uses AI to generate audio narration for each page of the story. Users can listen to the story being read aloud.
4. **Export**: Users can export their stories as PDFs or view them in an interactive book format.

## Technical Stack
- **Frontend**: React, TypeScript, Tailwind CSS
- **AI Services**: Google's Gemini API
- **State Management**: React Hooks
- **Build Tool**: Vite

## Implementation Plan
1. **Setup Project Structure**: Initialize a new React project with Vite and TypeScript. Set up Tailwind CSS for styling.
2. **Integrate Gemini API**: Create a service layer to handle API calls to Gemini. This will include functions for generating stories, images, and audio.
3. **Build Core Components**: Develop the core components of the app, including the chat interface, story page display, image editor, and audio player.
4. **Implement State Management**: Use React Hooks to manage the app's state, including the story segments, loading states, and error handling.
5. **Add Interactivity**: Implement user interactions, such as submitting prompts, editing illustrations, and controlling the audio player.
6. **Style and Polish**: Apply Tailwind CSS styles to the components and ensure a polished user experience.
7. **Testing and Debugging**: Write unit tests for critical functionality and perform thorough debugging to ensure a smooth user experience.
8. **Deployment**: Prepare the app for deployment, including optimizing performance and security. Host the app on a suitable platform.
9. **Documentation**: Write comprehensive documentation for the app, including user instructions and developer notes.

## Improvements
- [ ] Highlight and stylize the words (a little bit of a wobbly bounch animation) as they are being read aloud, for the audio narration feature, allowing the child to follow along.
- [ ] Add a "Read Aloud" button to the interactive book view (and start reading by default after the first words are generated)

## Bugs
- [ ] When the user clicks "Start Your Story" and then clicks "View Interactive Book" before the story is generated, the app crashes/freezes (prompts to Wait/End page in Chrome, and says it's slowing down Firefox).
- [ ] Clicking the X in "Interactive Book" mode does not close the book view (and neither does escape; there is no clear way to exit the preview).
- [ ] Text to speach features are not working.
- [ ] Image re-generation and image to image editing are not working.
- [ ] I am unable to close the "History" right click menu and the only way to exit is to refresh the page.
- [ ] Stories need to develop character personas and keep consistancy between images (with the core system managing the character names, descriptions, personality, look and feel, etc.)