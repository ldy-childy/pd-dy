// --- Data & Logic ---

// 1. Reference Search (Real Keyword-based Search using LoremFlickr)
let page = 1;

function getRandomImageHeight() {
  // Masonry needs varied heights
  return Math.floor(Math.random() * (450 - 250 + 1) + 250);
}

function loadReferenceImages(query = 'graphic', clear = false) {
  const grid = document.getElementById('referenceGrid');
  const loader = document.getElementById('searchLoader');
  
  if (clear) {
    grid.innerHTML = '';
    page = 1;
  }
  
  loader.style.display = 'block';

  // Keyword formatting (Flickr tags shouldn't strictly have spaces)
  const formattedQuery = encodeURIComponent(query.trim().replace(/\s+/g, ','));

  // Simulate loading to populate images
  setTimeout(() => {
    for (let i = 0; i < 12; i++) {
      const height = getRandomImageHeight();
      // Use lock parameter or unique path to ensure image isn't the identical one every time
      const seed = Date.now() + i + Math.floor(Math.random() * 10000); 
      
      // LoremFlickr fetches actual images matching the keyword from Flickr
      const imgUrl = `https://loremflickr.com/400/${height}/${formattedQuery}?lock=${seed}`;
      
      const item = document.createElement('div');
      item.className = 'grid-item';
      item.innerHTML = `
        <img src="${imgUrl}" loading="lazy" alt="Reference">
        <div class="overlay">
          <button class="select-btn" onclick="selectReference('${imgUrl}')">Make Reference</button>
        </div>
      `;
      // Error handling for dead images
      item.querySelector('img').onerror = function() {
        this.src = `https://picsum.photos/seed/${seed}/400/${height}`;
      };
      
      grid.appendChild(item);
    }
    loader.style.display = 'none';
    page++;
  }, 600);
}

function handleSearch(e) {
  if (e.key === 'Enter') performSearch();
}

function performSearch() {
  const query = document.getElementById('searchInput').value || 'graphic';
  loadReferenceImages(query, true);
}

function selectReference(url) {
  const preview = document.getElementById('refPreview');
  const img = document.getElementById('refImage');
  preview.classList.remove('empty');
  img.src = url;
  // Scroll to top of sidebar
  document.querySelector('.sidebar').scrollTo(0,0);
}

function setCustomReference(url) {
  if(url) selectReference(url);
}

// Infinite Scroll Implementation
const mainScroll = document.getElementById('mainScroll');
if(mainScroll) {
  mainScroll.addEventListener('scroll', () => {
    // If we are looking at the search section and near bottom
    const searchSec = document.getElementById('section-search');
    const rect = searchSec.getBoundingClientRect();
    if (rect.bottom < window.innerHeight + 200 && page < 5) { // limit pages for demo
      // Prevent multiple simultaneous triggers
      if (document.getElementById('searchLoader').style.display !== 'block') {
        const query = document.getElementById('searchInput').value || 'graphic';
        loadReferenceImages(query);
      }
    }
    updateActiveNav();
  });
}

// Initial Load 
// (사용자가 의류 디자이너이므로 streetwear graphic 키워드 기본 설정)
window.addEventListener('DOMContentLoaded', () => {
  loadReferenceImages('streetwear graphic');
});

// Navigation highlighting
function updateActiveNav() {
  const sections = document.querySelectorAll('.section');
  const links = document.querySelectorAll('.nav-link');
  
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop;
    if (mainScroll.scrollTop >= top - 100) {
      current = sec.getAttribute('id');
    }
  });
  
  links.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').substring(1) === current) {
      link.classList.add('active');
    }
  });
}

// 2. Generate Images
function generateImages() {
  const preview = document.getElementById('refPreview');
  if (preview.classList.contains('empty')) {
    alert('먼저 레퍼런스 이미지를 선택하거나 URL을 입력해주세요.');
    return;
  }

  const prompt = document.getElementById('prompt').value;
  if (!prompt) {
    alert('변형을 위한 프롬프트를 입력해주세요.');
    return;
  }

  const count = parseInt(document.getElementById('genCount').value);
  const btn = document.getElementById('btnGenerate');
  const container = document.getElementById('resultsContainer');

  // Animating button
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
  btn.disabled = true;

  container.innerHTML = `
    <div style="text-align:center; padding: 60px; color: var(--accent);">
      <i class="fa-solid fa-wand-magic-sparkles fa-spin fa-3x"></i>
      <p style="margin-top:20px;">AI가 이미지를 생성하고 있습니다... (${count}장)</p>
    </div>
  `;

  // Scroll to results
  document.getElementById('section-results').scrollIntoView({behavior: 'smooth'});

  // Simulate AI Generation logic based on prompt keywords
  const promptKeywords = encodeURIComponent(prompt.split(' ').slice(0,2).join(','));

  setTimeout(() => {
    let html = '<div class="results-grid">';
    for (let i = 0; i < count; i++) {
      const seed = Date.now() + i;
      // 생성된 이미지는 프롬프트와 기존 키워드를 합쳐 더 구체적으로 변환된 형태라는 느낌을 줌
      const imgUrl = `https://loremflickr.com/500/500/art,abstract,${promptKeywords}?lock=${seed}`;
      
      html += `
        <div class="result-card">
          <img src="${imgUrl}" alt="Generated Variation">
          <div class="result-actions">
            <button class="btn-secondary" onclick="exportToSVG('${imgUrl}')" style="width: 100%; border-color: var(--accent); color: var(--accent);">
              <i class="fa-solid fa-vector-square"></i> Vectorize (SVG)
            </button>
          </div>
        </div>
      `;
    }
    html += '</div>';
    container.innerHTML = html;

    btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Variants';
    btn.disabled = false;
  }, 2000);
}

// 3. Export & SVG Refine
function exportToSVG(imgUrl) {
  document.getElementById('section-export').style.display = 'block';
  document.getElementById('exportSourceImg').src = imgUrl;
  
  // Update mock SVG colors based on image mock
  const shape = document.getElementById('mockShape');
  if(shape) {
      shape.setAttribute('fill', 'var(--accent)');
  }
  
  setTimeout(() => {
    document.getElementById('section-export').scrollIntoView({behavior: 'smooth'});
  }, 100);
}

function updateSvgPreview(type, val) {
  // Mock interaction for SVG parameter tuning
  const shape = document.getElementById('mockShape');
  if(!shape) return;

  if (type === 'stroke') {
    shape.setAttribute('stroke-width', val);
  } else if (type === 'smooth') {
    const radius = 50 + parseInt(val)*2;
    shape.setAttribute('r', radius);
  } else if (type === 'colors') {
    shape.style.opacity = (0.5 + (val/16)*0.5);
  } else if (type === 'simplify') {
    const distort = val * 5;
    shape.setAttribute('cx', 100 + distort);
  }
}

function downloadSVG() {
  alert('SVG 파일이 다운로드됩니다. (Mock)');
  // 실제 구현시에는 SVG 데이터를 Blob으로 만들어 URL.createObjectURL로 다운로드 제공
}

function downloadAI() {
  alert('.AI 파일 (Adobe Illustrator) 다운로드가 시작됩니다. (Mock)');
}
