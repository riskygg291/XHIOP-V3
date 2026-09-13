// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDgeVQPfF4WHP8v8KOMjk3UvpALwep9wrY",
    authDomain: "serveris-31ada.firebaseapp.com",
    projectId: "serveris-31ada",
    storageBucket: "serveris-31ada.firebasestorage.app",
    messagingSenderId: "445440081020",
    appId: "1:445440081020:web:7de318d10967c732b29df9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const uploadBtn = document.getElementById('upload-btn');
const uploadModal = document.getElementById('upload-modal');
const closeModal = document.getElementById('close-modal');
const uploadForm = document.getElementById('upload-form');
const addonsGrid = document.getElementById('addons-grid');
const toast = document.getElementById('toast');

// State
let addons = [];

// Utility Functions
const showToast = (message, duration = 3000) => {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
};

const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Create Addon Card
const createAddonCard = (addon, index) => {
    const card = document.createElement('div');
    card.className = 'addon-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const imageUrl = addon.imageUrl || 'https://images.unsplash.com/photo-1607988795691-3d0147b43231?w=400&h=300&fit=crop';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${addon.name}" class="addon-image" loading="lazy">
        <h3 class="addon-name">${addon.name}</h3>
        <p class="addon-description">${addon.description}</p>
        <div class="addon-meta">
            <span class="version-badge">MC ${addon.minecraftVersion}</span>
            <a href="${addon.downloadLink}" target="_blank" class="download-btn" onclick="event.stopPropagation()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
            </a>
        </div>
    `;
    
    return card;
};

// Render Addons
const renderAddons = () => {
    addonsGrid.innerHTML = '';
    
    if (addons.length === 0) {
        addonsGrid.innerHTML = `
            <div class="loading-spinner">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                </svg>
                <p>No addons available yet. Be the first to upload!</p>
            </div>
        `;
        return;
    }
    
    addons.forEach((addon, index) => {
        const card = createAddonCard(addon, index);
        addonsGrid.appendChild(card);
    });
};

// Fetch Addons from Firestore
const fetchAddons = async () => {
    try {
        const snapshot = await db.collection('addons').orderBy('createdAt', 'desc').get();
        
        addons = [];
        snapshot.forEach(doc => {
            addons.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        renderAddons();
    } catch (error) {
        console.error('Error fetching addons:', error);
        addonsGrid.innerHTML = `
            <div class="loading-spinner">
                <p style="color: #ff4757;">Error loading addons. Please try again later.</p>
            </div>
        `;
    }
};

// Upload Addon to Firestore
const uploadAddon = async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('addon-name').value.trim();
    const description = document.getElementById('addon-description').value.trim();
    const minecraftVersion = document.getElementById('addon-version').value.trim();
    const downloadLink = document.getElementById('addon-download').value.trim();
    const imageUrl = document.getElementById('addon-image').value.trim();
    
    if (!name || !description || !minecraftVersion || !downloadLink) {
        showToast('Please fill in all required fields!');
        return;
    }
    
    try {
        const addonData = {
            name,
            description,
            minecraftVersion,
            downloadLink,
            imageUrl: imageUrl || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('addons').add(addonData);
        
        showToast('Addon uploaded successfully! 🎉');
        uploadModal.classList.remove('active');
        uploadForm.reset();
        fetchAddons();
        
    } catch (error) {
        console.error('Error uploading addon:', error);
        showToast('Failed to upload addon. Please try again.');
    }
};

// Event Listeners
uploadBtn.addEventListener('click', () => {
    uploadModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeModal.addEventListener('click', () => {
    uploadModal.classList.remove('active');
    document.body.style.overflow = '';
});

uploadModal.addEventListener('click', (e) => {
    if (e.target === uploadModal) {
        uploadModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

uploadForm.addEventListener('submit', uploadAddon);

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && uploadModal.classList.contains('active')) {
        uploadModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Smooth scroll performance optimization
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            ticking = false;
        });
        ticking = true;
    }
});

// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img').forEach(img => imageObserver.observe(img));
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    fetchAddons();
    
    // Add entrance animation class
    setTimeout(() => {
        document.querySelectorAll('.addon-card').forEach(card => {
            card.style.opacity = '1';
        });
    }, 100);
});

// Service Worker Registration for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment below to enable PWA
        // navigator.serviceWorker.register('/sw.js');
    });
}