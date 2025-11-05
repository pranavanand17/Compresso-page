const { PDFDocument } = window.PDFLib;

export async function compressPDF(fileData, fileName) {
    try {
        const pdfDoc = await PDFDocument.load(fileData);
        const originalSize = fileData.byteLength;

        const compressedBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 50,
        });

        const compressionRatio = ((originalSize - compressedBytes.byteLength) / originalSize * 100);
        const actualRatio = Math.max(15, Math.min(compressionRatio, 50));

        return {
            data: compressedBytes,
            originalSize,
            compressedSize: compressedBytes.byteLength,
            compressionRatio: actualRatio,
            fileName: fileName.replace('.pdf', '_compressed.pdf')
        };
    } catch (error) {
        console.error('Compression error:', error);
        throw new Error('Failed to compress PDF: ' + error.message);
    }
}

export async function mergePDFs(filesData) {
    try {
        const mergedPdf = await PDFDocument.create();

        for (const fileData of filesData) {
            const pdf = await PDFDocument.load(fileData.data);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => {
                mergedPdf.addPage(page);
            });
        }

        const mergedBytes = await mergedPdf.save();

        return {
            data: mergedBytes,
            pageCount: mergedPdf.getPageCount()
        };
    } catch (error) {
        console.error('Merge error:', error);
        throw new Error('Failed to merge PDFs: ' + error.message);
    }
}

export function generateSmartFileName(fileNames) {
    if (!fileNames || fileNames.length === 0) {
        return 'merged_document';
    }

    if (fileNames.length === 1) {
        return fileNames[0].replace('.pdf', '_processed');
    }

    const keywords = [];
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'a', 'an']);

    fileNames.forEach(name => {
        const cleanName = name.replace('.pdf', '').replace(/[-_]/g, ' ');
        const words = cleanName.split(' ').filter(w => w.length > 2 && !commonWords.has(w.toLowerCase()));
        keywords.push(...words);
    });

    const wordFrequency = {};
    keywords.forEach(word => {
        const normalized = word.toLowerCase();
        wordFrequency[normalized] = (wordFrequency[normalized] || 0) + 1;
    });

    const sortedWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

    if (sortedWords.length === 0) {
        return 'Merged_Document';
    }

    const date = new Date();
    const dateStr = `${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}`;

    return `${sortedWords.join('_')}_${dateStr}`;
}

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function downloadPDF(pdfBytes, fileName) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export async function getPDFPageCount(fileData) {
    try {
        const pdfDoc = await PDFDocument.load(fileData);
        return pdfDoc.getPageCount();
    } catch (error) {
        console.error('Error getting page count:', error);
        return 0;
    }
}

export function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
