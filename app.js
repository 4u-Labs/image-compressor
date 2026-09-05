const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const imagesGrid = document.getElementById('imagesGrid');
const controls = document.getElementById('controls');
const actions = document.getElementById('actions');
const processBtn = document.getElementById('processBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const qualitySlider = document.getElementById('qualitySlider');
const qualityVal = document.getElementById('qualityVal');
const formatSelect = document.getElementById('formatSelect');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');
const progressStatus = document.getElementById('progressStatus');
const tutorialBtn = document.getElementById('tutorialBtn');
const tutorialModal = document.getElementById('tutorialModal');
const closeTutorial = document.getElementById('closeTutorial');

let filesList = [];
let processedFiles = [];

// Events
tutorialBtn.onclick = () => tutorialModal.classList.remove('hidden');
closeTutorial.onclick = () => tutorialModal.classList.add('hidden');
tutorialModal.onclick = (e) => { if (e.target === tutorialModal) tutorialModal.classList.add('hidden'); };

uploadZone.onclick = () => fileInput.click();
fileInput.onchange = (e) => handleFiles(e.target.files);
qualitySlider.oninput = (e) => qualityVal.textContent = e.target.value;

uploadZone.ondragover = (e) => { e.preventDefault(); uploadZone.classList.add('bg-green-400/10'); };
uploadZone.ondragleave = () => uploadZone.classList.remove('bg-green-400/10');
uploadZone.ondrop = (e) => {
    e.preventDefault();
    uploadZone.classList.remove('bg-green-400/10');
    handleFiles(e.dataTransfer.files);
};

function handleFiles(files) {
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    filesList = [...filesList, ...newFiles];
    updateGrid();
    if (filesList.length > 0) {
        controls.classList.remove('hidden');
        actions.classList.remove('hidden');
    }
}

function updateGrid() {
    imagesGrid.innerHTML = '';
    filesList.forEach((file, index) => {
        const reader = new FileReader();
        const card = document.createElement('div');
        card.className = 'image-card h-32 flex items-center justify-center';
        card.innerHTML = `<div class="text-[10px] text-gray-500 truncate p-2">${file.name}</div>`;
        
        reader.onload = (e) => {
            card.style.backgroundImage = `url(${e.target.result})`;
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';
            card.innerHTML = '';
        };
        reader.readAsDataURL(file);
        imagesGrid.appendChild(card);
    });
}

processBtn.onclick = async () => {
    processBtn.disabled = true;
    processBtn.textContent = 'Processando...';
    progressContainer.classList.remove('hidden');
    processedFiles = [];
    
    for (let i = 0; i < filesList.length; i++) {
        const file = filesList[i];
        const progress = Math.round(((i + 1) / filesList.length) * 100);
        
        progressStatus.textContent = `Processando: ${file.name}`;
        progressBar.style.width = `${progress}%`;
        progressPercent.textContent = `${progress}%`;
        
        try {
            const result = await compressImage(file);
            processedFiles.push({ name: result.name, blob: result.blob });
        } catch (err) {
            console.error('Erro ao processar:', file.name, err);
        }
    }
    
    processBtn.textContent = 'Concluído!';
    downloadBtn.classList.remove('hidden');
};

async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                let format = formatSelect.value;
                if (format === 'original') format = file.type.split('/')[1] || 'png';
                if (format === 'jpeg') format = 'image/jpeg';
                else if (format === 'png') format = 'image/png';
                else if (format === 'webp') format = 'image/webp';
                else format = file.type;

                const quality = qualitySlider.value / 100;
                canvas.toBlob((blob) => {
                    const ext = format.split('/')[1];
                    const newName = file.name.substring(0, file.name.lastIndexOf('.')) + '.' + ext;
                    resolve({ name: newName, blob });
                }, format, quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

downloadBtn.onclick = async () => {
    const zip = new JSZip();
    processedFiles.forEach(f => {
        zip.file(f.name, f.blob);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'imagens_comprimidas_4u.zip';
    a.click();
    URL.revokeObjectURL(url);
};

clearBtn.onclick = () => {
    filesList = [];
    processedFiles = [];
    imagesGrid.innerHTML = '';
    controls.classList.add('hidden');
    actions.classList.add('hidden');
    progressContainer.classList.add('hidden');
    downloadBtn.classList.add('hidden');
    processBtn.disabled = false;
    processBtn.textContent = 'Comprimir Agora';
};
