
import React, { useState, useCallback } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatInterface } from './components/ChatInterface';
import { StoryPage } from './components/StoryPage';
import { useStoryManager } from './hooks/useStoryManager';
import { InteractiveBook } from './components/InteractiveBook';
import { ExportModal } from './components/ExportModal';
import { ImageEditor } from './components/ImageEditor';
import { HistoryPanel } from './components/HistoryPanel';
import { generatePdf } from './lib/pdfGenerator';
import { DownloadIcon, HistoryIcon, CloseIcon } from './components/IconComponents';
import type { StorySegment } from './types';

function App() {
  const [isStoryStarted, setIsStoryStarted] = useState(false);
  const [view, setView] = useState<'story' | 'book' | 'export' | 'edit'>('story');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [segmentToEdit, setSegmentToEdit] = useState<StorySegment | null>(null);
  
  const { storySegments, isLoading, error, addStorySegment, updateImage, startNewStory } = useStoryManager();

  const handleStart = () => {
    startNewStory();
    setIsStoryStarted(true);
  };
  
  const handleEditImage = useCallback((segment: StorySegment) => {
    setSegmentToEdit(segment);
    setView('edit');
  }, []);
  
  const handleSaveImageEdit = async (segmentId: string, editPrompt: string) => {
    await updateImage(segmentId, editPrompt);
    setView('story');
    setSegmentToEdit(null);
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await generatePdf(storySegments);
    } catch(err) {
      console.error("PDF generation failed", err);
      alert("Could not generate the PDF. Please try again.");
    } finally {
      setIsExportingPdf(false);
      setView('story');
    }
  };

  if (!isStoryStarted) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col font-sans relative overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-20">
            <h1 className="text-2xl font-bold text-purple-600">StoryWeaver AI</h1>
            <div className="flex items-center space-x-4">
                <button 
                    onClick={() => setView('export')}
                    disabled={storySegments.length === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 disabled:opacity-50 transition-colors"
                >
                    <DownloadIcon/>
                    <span>Export</span>
                </button>
                <button onClick={() => setIsHistoryOpen(o => !o)} className="p-2 rounded-full hover:bg-gray-200">
                    {isHistoryOpen ? <CloseIcon /> : <HistoryIcon />}
                </button>
            </div>
        </header>
        
        <main className="flex-1 flex flex-col relative">
            <StoryPage segments={storySegments} isLoading={isLoading} onEditImage={handleEditImage} />
            {error && <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-500 text-white p-3 rounded-lg shadow-lg">{error}</div>}
            <ChatInterface onSubmit={addStorySegment} isLoading={isLoading} />
        </main>
        
        <HistoryPanel segments={storySegments} isOpen={isHistoryOpen} />

        {/* Modals */}
        {view === 'book' && <InteractiveBook storySegments={storySegments} onClose={() => setView('story')} />}
        {view === 'export' && <ExportModal 
            onClose={() => setView('story')} 
            onViewInteractive={() => setView('book')}
            onDownloadPdf={handleDownloadPdf}
            isExporting={isExportingPdf}
        />}
        {view === 'edit' && segmentToEdit && <ImageEditor 
            segment={segmentToEdit}
            onClose={() => setView('story')}
            onSave={handleSaveImageEdit}
            isLoading={isLoading}
        />}

    </div>
  );
}

export default App;
