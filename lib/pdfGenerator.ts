import type { StorySegment } from '../types';

declare const jspdf: any;

const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = url;
    });
};

export const generatePdf = async (storySegments: StorySegment[]): Promise<void> => {
    const { jsPDF } = jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    const PAGE_WIDTH = 210;
    const PAGE_HEIGHT = 297;
    const MARGIN = 20;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
    const MAX_IMG_HEIGHT = 150;

    // --- Title Page ---
    pdf.setFontSize(40);
    pdf.setFont('helvetica', 'bold');
    pdf.text('My StoryWeaver Adventure', PAGE_WIDTH / 2, PAGE_HEIGHT / 3, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('A story created with StoryWeaver AI', PAGE_WIDTH / 2, PAGE_HEIGHT / 3 + 20, { align: 'center' });

    const aiSegments = storySegments.filter(segment => !segment.isUser && segment.imageUrl);

    for (let i = 0; i < aiSegments.length; i++) {
        const segment = aiSegments[i];
        pdf.addPage();
        
        // --- Add Image ---
        if (segment.imageUrl) {
            try {
                const img = await loadImage(segment.imageUrl);
                const ratio = img.naturalWidth / img.naturalHeight;
                let imgWidth = CONTENT_WIDTH;
                let imgHeight = imgWidth / ratio;
                if (imgHeight > MAX_IMG_HEIGHT) {
                    imgHeight = MAX_IMG_HEIGHT;
                    imgWidth = imgHeight * ratio;
                }
                const imgX = (PAGE_WIDTH - imgWidth) / 2;
                pdf.addImage(img, 'JPEG', imgX, MARGIN, imgWidth, imgHeight);

                // --- Add Text ---
                const textY = MARGIN + imgHeight + 15;
                pdf.setFontSize(14);
                pdf.setFont('helvetica', 'normal');
                const lines = pdf.splitTextToSize(segment.text, CONTENT_WIDTH);
                pdf.text(lines, MARGIN, textY);

            } catch (error) {
                console.error("Could not add image to PDF", error);
                pdf.text("There was a magical blur where the picture should be!", MARGIN, MARGIN);
            }
        }
        
        // --- Add Page Number ---
        pdf.setFontSize(10);
        pdf.text(`Page ${i + 1}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: 'center' });
    }

    pdf.save('My-StoryWeaver-Book.pdf');
};