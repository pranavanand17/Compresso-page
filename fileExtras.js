// fileExtras.js
export function initFileExtras(filesToProcess, previewGrid) {
    const activityLog = document.getElementById('activityLog');
    
    function logActivity(message) {
        const li = document.createElement('li');
        li.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
        activityLog.appendChild(li);
    }

    // Add note input for each file
    filesToProcess.forEach(fileObj => {
        if (fileObj.noteAdded) return; // only once
        const noteInput = document.createElement('input');
        noteInput.type = 'text';
        noteInput.placeholder = 'Add a note...';
        noteInput.className = 'file-note';
        noteInput.addEventListener('change', (e) => {
            fileObj.note = e.target.value;
            logActivity(`Note added to ${fileObj.name}: "${e.target.value}"`);
        });
        previewGrid.querySelectorAll('.preview-card').forEach(card => {
            if (card.querySelector('p').textContent === fileObj.name) {
                card.appendChild(noteInput);
            }
        });
        fileObj.noteAdded = true;
    });

    // Fake share button for each file
    filesToProcess.forEach(fileObj => {
        if (fileObj.shareAdded) return;
        const shareBtn = document.createElement('button');
        shareBtn.textContent = 'Share';
        shareBtn.className = 'file-share-btn';
        shareBtn.addEventListener('click', () => {
            const fakeLink = `https://demoapp.com/share/${encodeURIComponent(fileObj.name)}`;
            navigator.clipboard.writeText(fakeLink);
            logActivity(`Share link copied for ${fileObj.name}`);
            alert(`Link copied: ${fakeLink}`);
        });
        previewGrid.querySelectorAll('.preview-card').forEach(card => {
            if (card.querySelector('p').textContent === fileObj.name) {
                card.appendChild(shareBtn);
            }
        });
        fileObj.shareAdded = true;
    });
}

