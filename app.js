const courseListEl = document.getElementById('courseList');
const detailTitleEl = document.getElementById('detailTitle');
const detailScheduleEl = document.getElementById('detailSchedule');
const detailDescriptionEl = document.getElementById('detailDescription');
const detailApplicantsEl = document.getElementById('detailApplicants');
const detailRemainingEl = document.getElementById('detailRemaining');
const detailCapacityEl = document.getElementById('detailCapacity');
const applyForm = document.getElementById('applyForm');
const courseIdInput = document.getElementById('courseId');
const adminListEl = document.getElementById('adminList');
const adminSummaryEl = document.getElementById('adminSummary');

const scrollCoursesBtn = document.getElementById('scrollCourses');
const scrollAdminBtn = document.getElementById('scrollAdmin');

const storeKey = 'eduflow-courses';

const defaultCourses = [
  {
    id: crypto.randomUUID(),
    title: '디지털 전환 전략 캠프',
    schedule: '2024-07-05 10:00',
    capacity: 25,
    description: 'AI와 클라우드를 활용한 디지털 전환 전략과 로드맵 설계를 실습 중심으로 다룹니다.',
    applicants: [
      { org: '코드엑스', name: '김민준', email: 'mj.kim@example.com', phone: '010-1111-2222', at: Date.now() - 86400000 },
      { org: '퓨처랩', name: '이서연', email: 'sy.lee@example.com', phone: '010-3333-4444', at: Date.now() - 3600000 }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: '생성형 AI 활용 교육',
    schedule: '2024-07-12 14:00',
    capacity: 30,
    description: '프롬프트 엔지니어링부터 워크플로 자동화까지 생성형 AI 활용법을 배우는 집중 과정입니다.',
    applicants: []
  },
  {
    id: crypto.randomUUID(),
    title: '디자인 시스템 & UI 모션',
    schedule: '2024-07-20 09:30',
    capacity: 18,
    description: '디자인 시스템 설계와 마이크로 인터랙션을 실습하며 프로덕트 완성도를 높입니다.',
    applicants: []
  }
];

function loadCourses() {
  const stored = localStorage.getItem(storeKey);
  if (!stored) return defaultCourses;
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : defaultCourses;
  } catch (e) {
    return defaultCourses;
  }
}

let courses = loadCourses();
let selectedId = courses[0]?.id;

function saveCourses() {
  localStorage.setItem(storeKey, JSON.stringify(courses));
}

function setSelected(id) {
  selectedId = id;
  renderCourses();
  renderDetail();
}

function renderCourses() {
  courseListEl.innerHTML = '';
  courses.forEach((course) => {
    const total = course.applicants.length;
    const remaining = Math.max(course.capacity - total, 0);
    const card = document.createElement('article');
    card.className = `course ${remaining === 0 ? 'full' : ''}`;
    card.innerHTML = `
      <div class="status">${remaining === 0 ? '마감' : '접수 중'}</div>
      <h3>${course.title}</h3>
      <div class="meta">📅 ${course.schedule}</div>
      <div class="capacity">정원 ${course.capacity} · 신청 ${total}명</div>
      <p class="muted" style="margin-top:8px;">남은 자리 ${remaining}자리</p>
    `;
    card.addEventListener('click', () => setSelected(course.id));
    if (course.id === selectedId) {
      card.style.borderColor = 'rgba(107, 124, 255, 0.7)';
      card.style.boxShadow = '0 12px 30px rgba(107, 124, 255, 0.2)';
    }
    courseListEl.appendChild(card);
  });
}

function renderDetail() {
  const course = courses.find((c) => c.id === selectedId) || courses[0];
  if (!course) return;
  const total = course.applicants.length;
  const remaining = Math.max(course.capacity - total, 0);

  detailTitleEl.textContent = course.title;
  detailScheduleEl.textContent = course.schedule;
  detailDescriptionEl.textContent = course.description;
  detailApplicantsEl.textContent = `${total} 명`;
  detailRemainingEl.textContent = `${remaining} 자리`;
  detailCapacityEl.textContent = `정원: ${course.capacity}명`;
  courseIdInput.value = course.id;

  applyForm.querySelector('button').disabled = remaining === 0;
  applyForm.querySelector('button').textContent = remaining === 0 ? '정원 마감' : '신청하기';
}

function renderAdmin() {
  const totalApplicants = courses.reduce((sum, c) => sum + c.applicants.length, 0);
  adminSummaryEl.textContent = `총 ${courses.length}개 교육, ${totalApplicants}명 신청`;

  adminListEl.innerHTML = '';
  courses.forEach((course) => {
    const total = course.applicants.length;
    const remaining = Math.max(course.capacity - total, 0);
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <div>
        <div class="admin-row__title">${course.title}</div>
        <div class="admin-row__meta">📅 ${course.schedule} · 정원 ${course.capacity} · 신청 ${total}명 · 잔여 ${remaining}</div>
      </div>
      <button class="btn ghost" data-id="${course.id}">신청자 보기</button>
    `;
    const button = row.querySelector('button');
    button.addEventListener('click', () => toggleApplicants(course.id, row));
    adminListEl.appendChild(row);
  });
}

function toggleApplicants(id, rowEl) {
  const existing = rowEl.querySelector('.applicants');
  if (existing) {
    existing.remove();
    return;
  }
  const course = courses.find((c) => c.id === id);
  const list = document.createElement('div');
  list.className = 'applicants';
  list.style.gridColumn = '1 / -1';
  list.style.marginTop = '8px';
  list.style.padding = '10px 12px';
  list.style.borderRadius = '12px';
  list.style.background = 'rgba(255,255,255,0.03)';
  list.style.border = '1px solid var(--border)';

  if (!course.applicants.length) {
    list.innerHTML = '<p class="muted">아직 신청자가 없습니다.</p>';
  } else {
    const items = course.applicants
      .map((a, idx) => `<div style="display:flex; justify-content:space-between; padding:6px 0; gap:8px; flex-wrap:wrap;">
        <span>#${idx + 1}. ${a.org} · ${a.name}</span>
        <span class="muted">${a.email} · ${a.phone}</span>
      </div>`)
      .join('');
    list.innerHTML = items;
  }
  rowEl.appendChild(list);
}

applyForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = courseIdInput.value;
  const course = courses.find((c) => c.id === id);
  if (!course) return;
  if (course.applicants.length >= course.capacity) return;

  course.applicants.push({
    org: document.getElementById('org').value,
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    at: Date.now()
  });

  saveCourses();
  renderCourses();
  renderDetail();
  renderAdmin();
  applyForm.reset();
});

const createCourseForm = document.getElementById('createCourse');
createCourseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('newTitle').value.trim();
  const schedule = document.getElementById('newSchedule').value.trim();
  const capacity = parseInt(document.getElementById('newCapacity').value, 10);
  const description = document.getElementById('newDescription').value.trim();
  if (!title || !schedule || !description || Number.isNaN(capacity)) return;

  const newCourse = {
    id: crypto.randomUUID(),
    title,
    schedule,
    capacity,
    description,
    applicants: []
  };
  courses.unshift(newCourse);
  selectedId = newCourse.id;
  saveCourses();
  renderCourses();
  renderDetail();
  renderAdmin();
  createCourseForm.reset();
});

scrollCoursesBtn.addEventListener('click', () => {
  document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
});

scrollAdminBtn.addEventListener('click', () => {
  document.getElementById('admin').scrollIntoView({ behavior: 'smooth' });
});

renderCourses();
renderDetail();
renderAdmin();
