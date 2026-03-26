# NoteWise

## Current State
New project with no existing application logic.

## Requested Changes (Diff)

### Add
- File upload UI for notes (PDF, text, images)
- AI-powered note summarization via HTTP outcalls to an LLM API
- Doubt/question answering chat based on uploaded note content
- List of uploaded notes in a sidebar
- Main panel showing summary and Q&A chat for the selected note
- User authentication so notes are personal

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend (Motoko):
   - Store uploaded notes metadata (title, blob ID, extracted text, summary) per user
   - HTTP outcall to OpenAI/Gemini API for summarizing note text and answering questions
   - Endpoints: uploadNote, getNotes, getNote, summarizeNote, askQuestion, deleteNote
   - Use blob-storage for file data
   - Use authorization for user-scoped data
   - Use http-outcalls for AI API

2. Frontend:
   - Auth login gate
   - Sidebar: list of uploaded notes with upload button
   - Main panel: selected note view with tabs for Summary and Q&A
   - Upload modal: drag-and-drop or click to upload file
   - Summary tab: auto-generated summary with regenerate button
   - Q&A tab: chat interface to ask doubts about the note
