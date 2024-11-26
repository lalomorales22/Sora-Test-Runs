document.addEventListener('DOMContentLoaded', () => {
    const videoForm = document.getElementById('videoForm');
    const videosList = document.getElementById('videosList');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    let videos = [];

    // Function to load videos from SQLite database
    function loadVideos() {
        // Example SQL query
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'load_videos.php', true);
        xhr.onload = function() {
            if (this.status === 200) {
                videos = JSON.parse(this.responseText);
                renderVideos();
            }
        };
        xhr.send();
    }

    // Function to add a new video
    function addVideo(videoData) {
        // Example AJAX request to save video
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'save_video.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {
            if (this.status === 200) {
                const result = JSON.parse(this.responseText);
                if (result.success) {
                    videos.unshift(videoData);
                    renderVideos();
                    videoForm.reset();
                    showSuccess('Video added successfully');
                } else {
                    showError('Failed to add video');
                }
            }
        };
        xhr.send(new URLSearchParams(videoData).toString());
    }

    // Render videos list
    function renderVideos() {
        const filteredVideos = filterVideos();
        const sortedVideos = sortVideos(filteredVideos);
        
        videosList.innerHTML = sortedVideos.map(video => `
            <div class="video-card">
                <h3>${escapeHtml(video.video_name)}</h3>
                <p><strong>URL:</strong> <a href="${escapeHtml(video.video_url)}" target="_blank">${escapeHtml(video.video_url)}</a></p>
                ${video.prompt_text ? `<p><strong>Prompt:</strong> ${escapeHtml(video.prompt_text)}</p>` : ''}
                ${video.notes ? `<p><strong>Notes:</strong> ${escapeHtml(video.notes)}</p>` : ''}
                ${video.tags ? `
                    <div class="tags">
                        ${video.tags.split(',').map(tag => `
                            <span class="tag">${escapeHtml(tag.trim())}</span>
                        `).join('')}
                    </div>
                ` : ''}
                <p><small>Added: ${new Date(video.date_added || Date.now()).toLocaleString()}</small></p>
            </div>
        `).join('');
    }

    // Filter videos based on search input
    function filterVideos() {
        const searchTerm = searchInput.value.toLowerCase();
        return videos.filter(video => 
            video.video_name.toLowerCase().includes(searchTerm) ||
            (video.prompt_text || '').toLowerCase().includes(searchTerm) ||
            (video.tags || '').toLowerCase().includes(searchTerm) ||
            (video.notes || '').toLowerCase().includes(searchTerm)
        );
    }

    // Sort videos based on selected option
    function sortVideos(videosToSort) {
        const sortBy = sortSelect.value;
        return [...videosToSort].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.date_added || 0) - new Date(a.date_added || 0);
                case 'oldest':
                    return new Date(a.date_added || 0) - new Date(b.date_added || 0);
                case 'name':
                    return a.video_name.localeCompare(b.video_name);
                default:
                    return 0;
            }
        });
    }

    // Escape HTML to prevent XSS
    function escapeHtml(unsafe) {
        return (unsafe || '')
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Show success message
    function showSuccess(message) {
        alert(message);  // You can replace this with a better notification system
    }

    // Show error message
    function showError(message) {
        alert(message);  // You can replace this with a better notification system
    }

    // Event Listeners
    videoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const videoData = {
            video_name: document.getElementById('videoName').value,
            video_url: document.getElementById('videoUrl').value,
            prompt_text: document.getElementById('promptText').value,
            tags: document.getElementById('tags').value,
            notes: document.getElementById('notes').value,
            date_added: new Date().toISOString()
        };
        
        // For now, just store in memory and display
        videos.unshift(videoData);
        renderVideos();
        videoForm.reset();
        showSuccess('Video added successfully');
    });

    searchInput.addEventListener('input', renderVideos);
    sortSelect.addEventListener('change', renderVideos);

    // Initial render (empty state)
    renderVideos();
});