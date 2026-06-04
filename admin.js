// FRC 10034 Gammaland - Admin Panel Logic

document.addEventListener('DOMContentLoaded', () => {
  let appData = window.getGammalandData();

  // Elements
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const tabPanels = document.querySelectorAll('.admin-tab-panel');
  const toast = document.getElementById('toast-notify');
  const toastMessage = document.getElementById('toast-message');

  // Basic Info Form
  const formTeamInfo = document.getElementById('form-team-info');
  
  // Lists
  const listSponsors = document.getElementById('admin-sponsors-list');
  const listNews = document.getElementById('admin-news-list');
  const listMembers = document.getElementById('admin-members-list');
  const listGallery = document.getElementById('admin-gallery-list');
  
  // Robot specs form & container
  const formRobotSpecs = document.getElementById('form-robot-specs');
  const robotSpecsFieldsContainer = document.getElementById('robot-specs-fields-container');

  // Modals & Editor Forms
  const editorModal = document.getElementById('admin-editor-modal');
  const editorForm = document.getElementById('admin-editor-form');
  const modalTitle = document.getElementById('modal-title');
  const modalFormFields = document.getElementById('modal-form-fields');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  // Export / Reset Buttons
  const exportBtn = document.getElementById('admin-export-btn');
  const resetBtn = document.getElementById('admin-reset-btn');

  // Add Item Buttons
  const addSponsorBtn = document.getElementById('admin-add-sponsor-btn');
  const addNewsBtn = document.getElementById('admin-add-news-btn');
  const addMemberBtn = document.getElementById('admin-add-member-btn');
  const addPhotoBtn = document.getElementById('admin-add-photo-btn');

  // Current Editing State
  let currentEditType = ''; // 'sponsor', 'news', 'member', 'photo'
  let currentEditId = null;  // null for Add, string ID for Edit

  // ==========================================
  // 1. TAB MANAGEMENT
  // ==========================================
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.getAttribute('data-tab');
      tabPanels.forEach(panel => {
        if (panel.id === `panel-${targetTab}`) {
          panel.style.display = 'block';
        } else {
          panel.style.display = 'none';
        }
      });
    });
  });

  // Global entry point called when #admin page becomes visible
  window.initAdminPanel = function() {
    appData = window.getGammalandData();
    loadTeamInfoForm();
    loadRobotSpecsForm();
    renderAdminSponsors();
    renderAdminNews();
    renderAdminMembers();
    renderAdminGallery();
  };

  // ==========================================
  // 2. TOAST NOTIFICATIONS
  // ==========================================
  function showToast(message) {
    if (!toast) return;
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // ==========================================
  // 3. TEAM INFO TAB
  // ==========================================
  function loadTeamInfoForm() {
    const info = appData.teamInfo;
    document.getElementById('info-name').value = info.name || '';
    document.getElementById('info-number').value = info.number || '';
    document.getElementById('info-motto').value = info.motto || '';
    document.getElementById('info-founded').value = info.foundedYear || '';
    document.getElementById('info-about').value = info.aboutText || '';
    document.getElementById('info-instagram').value = info.socialLinks.instagram || '';
    document.getElementById('info-github').value = info.socialLinks.github || '';
    document.getElementById('info-email').value = info.socialLinks.email || '';
  }

  if (formTeamInfo) {
    formTeamInfo.addEventListener('submit', (e) => {
      e.preventDefault();
      
      appData.teamInfo = {
        name: document.getElementById('info-name').value,
        number: document.getElementById('info-number').value,
        motto: document.getElementById('info-motto').value,
        foundedYear: document.getElementById('info-founded').value,
        aboutText: document.getElementById('info-about').value,
        location: appData.teamInfo.location || "台灣 (Taiwan)",
        socialLinks: {
          instagram: document.getElementById('info-instagram').value,
          github: document.getElementById('info-github').value,
          email: document.getElementById('info-email').value
        }
      };

      window.saveGammalandData(appData);
      window.rebuildWebsiteViews();
      showToast('團隊基本資訊儲存成功！');
    });
  }

  // ==========================================
  // 4. SPONSORS TAB
  // ==========================================
  function renderAdminSponsors() {
    if (!listSponsors) return;
    listSponsors.innerHTML = '';
    
    if (appData.sponsors.length === 0) {
      listSponsors.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">目前無贊助商。</div>';
      return;
    }

    appData.sponsors.forEach(sponsor => {
      const item = document.createElement('div');
      item.className = 'admin-list-item';
      item.innerHTML = `
        <div class="admin-item-info">
          <h4>${escapeHTML(sponsor.name)} (${sponsor.logo || '無文字標誌'})</h4>
          <span>層級：${sponsor.tier.toUpperCase()} | 連結：${sponsor.link || '無'}</span>
        </div>
        <div class="admin-item-btns">
          <button class="btn btn-secondary btn-small edit-btn" data-id="${sponsor.id}">編輯</button>
          <button class="btn btn-danger btn-small delete-btn" data-id="${sponsor.id}">刪除</button>
        </div>
      `;

      item.querySelector('.edit-btn').onclick = () => openEditor('sponsor', sponsor.id);
      item.querySelector('.delete-btn').onclick = () => deleteItem('sponsor', sponsor.id);
      
      listSponsors.appendChild(item);
    });
  }

  // ==========================================
  // 5. NEWS TAB
  // ==========================================
  function renderAdminNews() {
    if (!listNews) return;
    listNews.innerHTML = '';

    if (appData.news.length === 0) {
      listNews.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">目前無公告消息。</div>';
      return;
    }

    appData.news.forEach(newsItem => {
      const item = document.createElement('div');
      item.className = 'admin-list-item';
      item.innerHTML = `
        <div class="admin-item-info">
          <h4>${escapeHTML(newsItem.title)}</h4>
          <span>發布日期：${newsItem.date}</span>
        </div>
        <div class="admin-item-btns">
          <button class="btn btn-secondary btn-small edit-btn" data-id="${newsItem.id}">編輯</button>
          <button class="btn btn-danger btn-small delete-btn" data-id="${newsItem.id}">刪除</button>
        </div>
      `;

      item.querySelector('.edit-btn').onclick = () => openEditor('news', newsItem.id);
      item.querySelector('.delete-btn').onclick = () => deleteItem('news', newsItem.id);

      listNews.appendChild(item);
    });
  }

  // ==========================================
  // 6. TEAM MEMBERS TAB
  // ==========================================
  function renderAdminMembers() {
    if (!listMembers) return;
    listMembers.innerHTML = '';

    if (appData.teamMembers.length === 0) {
      listMembers.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">目前無團員資料。</div>';
      return;
    }

    appData.teamMembers.forEach(member => {
      const item = document.createElement('div');
      item.className = 'admin-list-item';
      item.innerHTML = `
        <div class="admin-item-info">
          <h4>${escapeHTML(member.name)} (${escapeHTML(member.role)})</h4>
          <span>組別：${member.subteam.toUpperCase()}</span>
        </div>
        <div class="admin-item-btns">
          <button class="btn btn-secondary btn-small edit-btn" data-id="${member.id}">編輯</button>
          <button class="btn btn-danger btn-small delete-btn" data-id="${member.id}">刪除</button>
        </div>
      `;

      item.querySelector('.edit-btn').onclick = () => openEditor('member', member.id);
      item.querySelector('.delete-btn').onclick = () => deleteItem('member', member.id);

      listMembers.appendChild(item);
    });
  }

  // ==========================================
  // 7. ROBOT TAB
  // ==========================================
  function loadRobotSpecsForm() {
    const robot = appData.robotSpecs;
    document.getElementById('robot-name-input').value = robot.name || '';
    document.getElementById('robot-year-input').value = robot.year || '';
    document.getElementById('robot-cad-input').value = robot.cadLink || '';
    document.getElementById('robot-code-input').value = robot.codeLink || '';
    document.getElementById('robot-desc-input').value = robot.description || '';

    // Generate fields for specs (Exactly 6 specs table rows)
    if (robotSpecsFieldsContainer) {
      robotSpecsFieldsContainer.innerHTML = '';
      
      // Ensure we have exactly 6 details slot or fill them
      const details = robot.details || [];
      for (let i = 0; i < 6; i++) {
        const spec = details[i] || { label: '', value: '' };
        
        const row = document.createElement('div');
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '1fr 1fr';
        row.style.gap = '1rem';
        row.style.marginBottom = '1rem';
        row.innerHTML = `
          <div class="form-group" style="margin-bottom: 0;">
            <label>規格標籤 ${i+1} (如: 重量)</label>
            <input type="text" class="form-control spec-label-input" value="${escapeHTML(spec.label)}" placeholder="例如: 重量 (Weight)" required>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label>規格數值 ${i+1} (如: 120 lbs)</label>
            <input type="text" class="form-control spec-value-input" value="${escapeHTML(spec.value)}" placeholder="例如: 120 lbs" required>
          </div>
        `;
        robotSpecsFieldsContainer.appendChild(row);
      }
    }
  }

  if (formRobotSpecs) {
    formRobotSpecs.addEventListener('submit', (e) => {
      e.preventDefault();

      // Retrieve specifications list
      const labelInputs = robotSpecsFieldsContainer.querySelectorAll('.spec-label-input');
      const valueInputs = robotSpecsFieldsContainer.querySelectorAll('.spec-value-input');
      const details = [];

      for (let i = 0; i < 6; i++) {
        details.push({
          label: labelInputs[i].value.trim(),
          value: valueInputs[i].value.trim()
        });
      }

      appData.robotSpecs = {
        name: document.getElementById('robot-name-input').value.trim(),
        year: document.getElementById('robot-year-input').value.trim(),
        description: document.getElementById('robot-desc-input').value.trim(),
        image: appData.robotSpecs.image || "robot_main.jpg",
        cadLink: document.getElementById('robot-cad-input').value.trim(),
        codeLink: document.getElementById('robot-code-input').value.trim(),
        details: details
      };

      window.saveGammalandData(appData);
      window.rebuildWebsiteViews();
      showToast('機器人規格儲存成功！');
    });
  }

  // ==========================================
  // 8. GALLERY TAB
  // ==========================================
  function renderAdminGallery() {
    if (!listGallery) return;
    listGallery.innerHTML = '';

    if (appData.gallery.length === 0) {
      listGallery.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">目前相簿無照片。</div>';
      return;
    }

    appData.gallery.forEach(photo => {
      const item = document.createElement('div');
      item.className = 'admin-list-item';
      item.innerHTML = `
        <div class="admin-item-info">
          <h4>${escapeHTML(photo.title)}</h4>
          <span>分組類別：${photo.category.toUpperCase()} | 描述：${escapeHTML(photo.description || '無')}</span>
        </div>
        <div class="admin-item-btns">
          <button class="btn btn-secondary btn-small edit-btn" data-id="${photo.id}">編輯</button>
          <button class="btn btn-danger btn-small delete-btn" data-id="${photo.id}">刪除</button>
        </div>
      `;

      item.querySelector('.edit-btn').onclick = () => openEditor('photo', photo.id);
      item.querySelector('.delete-btn').onclick = () => deleteItem('photo', photo.id);

      listGallery.appendChild(item);
    });
  }


  // ==========================================
  // 9. MODAL EDITOR MANAGER (CRUD)
  // ==========================================
  function openEditor(type, id = null) {
    currentEditType = type;
    currentEditId = id;
    
    // Reset Form Fields
    modalFormFields.innerHTML = '';
    
    let title = '';
    let item = null;

    if (type === 'sponsor') {
      title = id ? '編輯贊助商' : '新增贊助商';
      item = id ? appData.sponsors.find(s => s.id === id) : { name: '', tier: 'gold', logo: '', link: '' };
      
      modalFormFields.innerHTML = `
        <div class="form-group">
          <label for="f-sp-name">贊助商名稱</label>
          <input type="text" id="f-sp-name" class="form-control" value="${escapeHTML(item.name)}" required>
        </div>
        <div class="form-group">
          <label for="f-sp-tier">贊助等級</label>
          <select id="f-sp-tier" class="form-control" style="background:#1f2937;" required>
            <option value="diamond" ${item.tier === 'diamond' ? 'selected' : ''}>鑽石級 (Diamond)</option>
            <option value="gold" ${item.tier === 'gold' ? 'selected' : ''}>黃金級 (Gold)</option>
            <option value="silver" ${item.tier === 'silver' ? 'selected' : ''}>白銀級 (Silver)</option>
            <option value="bronze" ${item.tier === 'bronze' ? 'selected' : ''}>青銅級與夥伴 (Bronze)</option>
          </select>
        </div>
        <div class="form-group">
          <label for="f-sp-logo">文字Logo縮寫 (如: TSMC, Intel)</label>
          <input type="text" id="f-sp-logo" class="form-control" value="${escapeHTML(item.logo || '')}" required>
        </div>
        <div class="form-group">
          <label for="f-sp-link">贊助商官網連結</label>
          <input type="url" id="f-sp-link" class="form-control" value="${escapeHTML(item.link || '')}">
        </div>
      `;
    } 
    else if (type === 'news') {
      title = id ? '編輯公告消息' : '發布公告消息';
      item = id ? appData.news.find(n => n.id === id) : { title: '', date: new Date().toISOString().split('T')[0], summary: '', content: '' };

      modalFormFields.innerHTML = `
        <div class="form-group">
          <label for="f-news-title">公告標題</label>
          <input type="text" id="f-news-title" class="form-control" value="${escapeHTML(item.title)}" required>
        </div>
        <div class="form-group">
          <label for="f-news-date">發布日期</label>
          <input type="date" id="f-news-date" class="form-control" value="${item.date}" required>
        </div>
        <div class="form-group">
          <label for="f-news-summary">前言/簡介 (列表顯示用)</label>
          <input type="text" id="f-news-summary" class="form-control" value="${escapeHTML(item.summary)}" required>
        </div>
        <div class="form-group">
          <label for="f-news-content">公告內容細節</label>
          <textarea id="f-news-content" class="form-control" required>${escapeHTML(item.content)}</textarea>
        </div>
      `;
    } 
    else if (type === 'member') {
      title = id ? '編輯團員資料' : '新增團員';
      item = id ? appData.teamMembers.find(m => m.id === id) : { name: '', role: '', subteam: 'mechanical', bio: '', image: '' };

      modalFormFields.innerHTML = `
        <div class="form-group">
          <label for="f-mem-name">成員姓名</label>
          <input type="text" id="f-mem-name" class="form-control" value="${escapeHTML(item.name)}" required>
        </div>
        <div class="form-group">
          <label for="f-mem-role">職位 / 職責 (如: 隊長、軟體工程師)</label>
          <input type="text" id="f-mem-role" class="form-control" value="${escapeHTML(item.role)}" required>
        </div>
        <div class="form-group">
          <label for="f-mem-subteam">所屬組別</label>
          <select id="f-mem-subteam" class="form-control" style="background:#1f2937;" required>
            <option value="mechanical" ${item.subteam === 'mechanical' ? 'selected' : ''}>機構設計組 (Mechanical)</option>
            <option value="software" ${item.subteam === 'software' ? 'selected' : ''}>軟體控制組 (Software)</option>
            <option value="cad" ${item.subteam === 'cad' ? 'selected' : ''}>CAD 3D建模組 (CAD)</option>
            <option value="outreach" ${item.subteam === 'outreach' ? 'selected' : ''}>公關推廣組 (Outreach)</option>
            <option value="mentor" ${item.subteam === 'mentor' ? 'selected' : ''}>指導老師 / Mentor</option>
          </select>
        </div>
        <div class="form-group">
          <label for="f-mem-bio">個人簡介</label>
          <textarea id="f-mem-bio" class="form-control" required>${escapeHTML(item.bio)}</textarea>
        </div>
      `;
    } 
    else if (type === 'photo') {
      title = id ? '編輯照片資訊' : '新增相簿照片';
      item = id ? appData.gallery.find(g => g.id === id) : { title: '', category: 'build', url: '', description: '' };

      modalFormFields.innerHTML = `
        <div class="form-group">
          <label for="f-gal-title">照片標題</label>
          <input type="text" id="f-gal-title" class="form-control" value="${escapeHTML(item.title)}" required>
        </div>
        <div class="form-group">
          <label for="f-gal-cat">分類標籤</label>
          <select id="f-gal-cat" class="form-control" style="background:#1f2937;" required>
            <option value="build" ${item.category === 'build' ? 'selected' : ''}>機器人製作 (Build)</option>
            <option value="competition" ${item.category === 'competition' ? 'selected' : ''}>大賽實況 (Competition)</option>
            <option value="outreach" ${item.category === 'outreach' ? 'selected' : ''}>公關活動 (Outreach)</option>
          </select>
        </div>
        <div class="form-group">
          <label for="f-gal-desc">照片描述與活動背景說明</label>
          <textarea id="f-gal-desc" class="form-control">${escapeHTML(item.description || '')}</textarea>
        </div>
      `;
    }

    modalTitle.textContent = title;
    editorModal.classList.add('active');
  }

  function closeEditor() {
    if (editorModal) editorModal.classList.remove('active');
  }

  if (modalCloseBtn) modalCloseBtn.onclick = closeEditor;
  if (modalCancelBtn) modalCancelBtn.onclick = closeEditor;
  if (editorModal) {
    editorModal.onclick = (e) => {
      if (e.target === editorModal) closeEditor();
    };
  }

  // Handle CRUD Form Submission
  if (editorForm) {
    editorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (currentEditType === 'sponsor') {
        const payload = {
          id: currentEditId || `sp-${Date.now()}`,
          name: document.getElementById('f-sp-name').value.trim(),
          tier: document.getElementById('f-sp-tier').value,
          logo: document.getElementById('f-sp-logo').value.trim(),
          link: document.getElementById('f-sp-link').value.trim()
        };

        if (currentEditId) {
          // Edit Mode
          const idx = appData.sponsors.findIndex(s => s.id === currentEditId);
          appData.sponsors[idx] = payload;
        } else {
          // Create Mode
          appData.sponsors.push(payload);
        }
        renderAdminSponsors();
      } 
      else if (currentEditType === 'news') {
        const payload = {
          id: currentEditId || `news-${Date.now()}`,
          title: document.getElementById('f-news-title').value.trim(),
          date: document.getElementById('f-news-date').value,
          summary: document.getElementById('f-news-summary').value.trim(),
          content: document.getElementById('f-news-content').value.trim()
        };

        if (currentEditId) {
          const idx = appData.news.findIndex(n => n.id === currentEditId);
          appData.news[idx] = payload;
        } else {
          appData.news.push(payload);
        }
        renderAdminNews();
      } 
      else if (currentEditType === 'member') {
        const payload = {
          id: currentEditId || `mem-${Date.now()}`,
          name: document.getElementById('f-mem-name').value.trim(),
          role: document.getElementById('f-mem-role').value.trim(),
          subteam: document.getElementById('f-mem-subteam').value,
          bio: document.getElementById('f-mem-bio').value.trim(),
          image: ''
        };

        if (currentEditId) {
          const idx = appData.teamMembers.findIndex(m => m.id === currentEditId);
          appData.teamMembers[idx] = payload;
        } else {
          appData.teamMembers.push(payload);
        }
        renderAdminMembers();
      } 
      else if (currentEditType === 'photo') {
        const payload = {
          id: currentEditId || `gal-${Date.now()}`,
          title: document.getElementById('f-gal-title').value.trim(),
          category: document.getElementById('f-gal-cat').value,
          url: '',
          description: document.getElementById('f-gal-desc').value.trim()
        };

        if (currentEditId) {
          const idx = appData.gallery.findIndex(g => g.id === currentEditId);
          appData.gallery[idx] = payload;
        } else {
          appData.gallery.push(payload);
        }
        renderAdminGallery();
      }

      // Save & Update View
      window.saveGammalandData(appData);
      window.rebuildWebsiteViews();
      closeEditor();
      showToast('項目儲存成功！');
    });
  }

  // Delete Action
  function deleteItem(type, id) {
    if (!confirm('您確定要刪除此項目嗎？此操作無法還原。')) return;

    if (type === 'sponsor') {
      appData.sponsors = appData.sponsors.filter(s => s.id !== id);
      renderAdminSponsors();
    } 
    else if (type === 'news') {
      appData.news = appData.news.filter(n => n.id !== id);
      renderAdminNews();
    } 
    else if (type === 'member') {
      appData.teamMembers = appData.teamMembers.filter(m => m.id !== id);
      renderAdminMembers();
    } 
    else if (type === 'photo') {
      appData.gallery = appData.gallery.filter(g => g.id !== id);
      renderAdminGallery();
    }

    window.saveGammalandData(appData);
    window.rebuildWebsiteViews();
    showToast('項目刪除成功！');
  }

  // Link Add buttons
  if (addSponsorBtn) addSponsorBtn.onclick = () => openEditor('sponsor');
  if (addNewsBtn) addNewsBtn.onclick = () => openEditor('news');
  if (addMemberBtn) addMemberBtn.onclick = () => openEditor('member');
  if (addPhotoBtn) addPhotoBtn.onclick = () => openEditor('photo');

  // ==========================================
  // 10. CONFIG EXPORT / RESET
  // ==========================================
  
  // Reset Data to Default Configuration
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('警告！這將會清除您目前在瀏覽器中所有的修改，並重設回隊伍預設資料，確定要重設嗎？')) {
        localStorage.removeItem('gammaland_website_data');
        appData = window.getGammalandData();
        window.rebuildWebsiteViews();
        window.initAdminPanel();
        showToast('資料已成功重設為預設配置！');
      }
    });
  }

  // Export current configuration into data.js file download
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dataStr = JSON.stringify(appData, null, 2);
      const codeOutput = `// FRC 10034 Gammaland Robotics - Website Data Configuration
// This file stores all content on the website.
// You can edit this file directly, or use the online /admin panel to make changes and download a new version.

window.GammalandDefaultData = ${dataStr};

// Data Helper to sync with localStorage so edits persist locally
window.getGammalandData = function() {
  const localData = localStorage.getItem('gammaland_website_data');
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch(e) {
      console.error("Error parsing local website data, using default", e);
    }
  }
  return window.GammalandDefaultData;
};

window.saveGammalandData = function(data) {
  localStorage.setItem('gammaland_website_data', JSON.stringify(data));
};
`;

      const blob = new Blob([codeOutput], { type: 'application/javascript;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.download = 'data.js';
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      URL.revokeObjectURL(url);
      
      showToast('設定檔已成功導出！請下載後替換原有的 data.js 檔案即可完成更新。');
    });
  }

  // Helper Escape HTML
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
});
