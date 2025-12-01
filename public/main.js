// public/main.js

let selectedDateInfo = null;

// [NEW] 1. 카테고리 전체 선택/해제
function toggleAllCategories(source) {
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = source.checked;
    });
    applyCategoryFilter(); // 필터 적용
}

// [NEW] 2. 카테고리 필터링 로직
function applyCategoryFilter() {
    // 체크된 카테고리 ID들을 배열로 수집
    const checkedIds = Array.from(document.querySelectorAll('.filter-checkbox:checked'))
                            .map(cb => cb.value);

    // 모든 날짜 칸을 순회하며 점(Dot) 표시/숨김 처리
    const dayElements = document.querySelectorAll('.day');
    
    dayElements.forEach(dayEl => {
        const dots = dayEl.querySelectorAll('.schedule-dot');
        dots.forEach(dot => {
            const catId = dot.getAttribute('data-category-id');
            // 카테고리가 없거나(none), 체크된 목록에 포함되어 있으면 보임
            if (catId === 'none' || checkedIds.includes(catId)) {
                dot.style.display = 'inline-block';
            } else {
                dot.style.display = 'none';
            }
        });
    });

    // 현재 선택된 날짜가 있다면, 우측 패널 목록도 갱신
    if (selectedDateInfo) {
        const { day } = selectedDateInfo;
        const currentDayEl = document.querySelector(`.day[data-day="${day}"]`);
        if(currentDayEl) {
            // UI 효과 유지를 위해 active-day 클래스 다시 확인 (selectDate 호출 시 초기화되므로)
            // 여기서는 selectDate를 직접 호출하여 리스트를 다시 그리게 함
            selectDate(currentDayEl, false); // false: 클릭 애니메이션 등 중복 방지용 플래그(선택사항)
        }
    }
}


// ---------------------------------------------------------
// 3. 캘린더 날짜 클릭 처리 (필터링 반영)
// ---------------------------------------------------------
function selectDate(element, isClick = true) {
    const year = element.getAttribute('data-year');
    const month = element.getAttribute('data-month');
    const day = element.getAttribute('data-day');
    const holidayName = element.getAttribute('data-holiday'); // [NEW] 휴일 이름 가져오기
    
    const schedulesData = JSON.parse(element.getAttribute('data-schedules') || '[]');
    const checkedIds = Array.from(document.querySelectorAll('.filter-checkbox:checked')).map(cb => cb.value);

    const filteredSchedules = allSchedules = schedulesData.filter(s => {
        if (!s.Categories || s.Categories.length === 0) return true;
        return checkedIds.includes(String(s.Categories[0].id));
    });

    if(isClick) selectedDateInfo = { year, month, day };

    // --- 우측 패널 업데이트 로직 ---
    const dateTitle = document.getElementById('panel-date');
    const holidayInfo = document.getElementById('panel-holiday-info');
    const listInfo = document.getElementById('panel-list');

    // 1. 날짜 텍스트 업데이트
    dateTitle.textContent = `${year}년 ${month}월 ${day}일`;

    // 2. 날짜 색상 결정 (요일 및 휴일 여부)
    // 현재 날짜 객체 생성
    const currentDate = new Date(year, month - 1, day);
    const dayOfWeek = currentDate.getDay(); // 0: 일, 6: 토

    // 기본 검정
    dateTitle.style.color = 'black';

    // 토요일이면 파랑
    if (dayOfWeek === 6) {
        dateTitle.style.color = 'blue';
    }
    // 일요일이거나 휴일이면 빨강 (우선순위 높음)
    if (dayOfWeek === 0 || holidayName) {
        dateTitle.style.color = 'red';
    }

    // 3. 휴일 정보 표시 (기존 '음력 준비중' 대신)
    if (holidayName) {
        holidayInfo.textContent = `★ ${holidayName}`;
        holidayInfo.style.color = 'red';
        holidayInfo.style.fontWeight = 'bold';
    } else {
        holidayInfo.textContent = ""; // 휴일 아니면 비워둠
    }
    
    // 4. 리스트 그리기
    if (filteredSchedules.length > 0) {
        let html = '';
        filteredSchedules.forEach(s => {
            const scheduleJson = JSON.stringify(s).replace(/"/g, "'");
            const start = new Date(s.startDate);
            const end = new Date(s.endDate);
            const startTime = start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const endTime = end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            let catTags = '';
            if(s.Categories) {
                s.Categories.forEach(c => {
                    catTags += `<span class="panel-category-tag" style="background-color:${c.color}">${c.name}</span>`;
                });
            }

            html += `
                <div class="panel-schedule-item" onclick="openViewModal(${scheduleJson})" style="cursor: pointer;">
                    <div class="panel-schedule-title">${s.title}</div>
                    <div style="margin-bottom:5px;">${catTags}</div>
                    <div class="panel-schedule-time">
                        ${s.isAllDay ? '하루 종일' : `${startTime} ~ ${endTime}`}
                    </div>
                </div>
            `;
        });
        listInfo.innerHTML = html;
    } else {
        listInfo.textContent = "표시할 일정이 없습니다.";
    }

    if (isClick) {
        const prevSelected = document.querySelector('.day.active-day');
        if (prevSelected) prevSelected.classList.remove('active-day');
        element.classList.add('active-day');
    }
}


// --- 나머지 CRUD 및 모달 함수들 (기존 유지) ---

function openViewModal(schedule) {
    const modal = document.getElementById('view-schedule-modal');
    const start = new Date(schedule.startDate);
    const end = new Date(schedule.endDate);
    const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formatDate = (date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

    let timeText;
    if (schedule.isAllDay) {
        timeText = `${formatDate(start)} ~ ${formatDate(end)} (하루 종일)`;
    } else {
        if (start.toDateString() === end.toDateString()) {
            timeText = `${formatDate(start)} ${formatTime(start)} ~ ${formatTime(end)}`;
        } else {
            timeText = `${formatDate(start)} ${formatTime(start)} ~ ${formatDate(end)} ${formatTime(end)}`;
        }
    }

    let catTags = '';
    if (schedule.Categories) {
        schedule.Categories.forEach(c => {
            catTags += `<span class="panel-category-tag" style="background-color:${c.color}; color: white; padding: 4px 8px;">${c.name}</span>`;
        });
    }

    document.getElementById('view-title').textContent = schedule.title;
    document.getElementById('view-time').textContent = timeText;
    document.getElementById('view-categories').innerHTML = catTags;
    document.getElementById('view-description').textContent = schedule.description || "(내용 없음)";

    document.getElementById('view-edit-btn').onclick = () => {
        closeViewModal();
        openAddModal(schedule);
    };
    document.getElementById('view-delete-btn').onclick = () => deleteSchedule(schedule.id);

    modal.style.display = 'flex';
}

function closeViewModal() {
    document.getElementById('view-schedule-modal').style.display = 'none';
}

function reloadWithSelection() {
    if (selectedDateInfo) {
        const { year, month, day } = selectedDateInfo;
        window.location.href = `/?year=${year}&month=${month}&selectedDay=${day}`;
    } else {
        window.location.reload();
    }
}

// [수정] 모달 열기 시 라디오 버튼 처리
function openAddModal(schedule = null) { 
    const modal = document.getElementById('add-modal');
    const form = modal.querySelector('form');
    form.reset(); 
    
    let scheduleIdField = document.getElementById('schedule-id-field');
    if (!scheduleIdField) {
        scheduleIdField = document.createElement('input');
        scheduleIdField.type = 'hidden';
        scheduleIdField.id = 'schedule-id-field';
        scheduleIdField.name = 'id';
        form.appendChild(scheduleIdField);
    }
    
    const title = modal.querySelector('h2');
    const saveBtn = modal.querySelector('.btn-save');
    // [수정] radio 버튼 선택
    const categoryRadios = form.querySelectorAll('input[name="categoryIds"]');
    
    if (schedule) {
        title.textContent = '일정 수정';
        saveBtn.textContent = '수정 완료';
        form.setAttribute('data-mode', 'edit');
        scheduleIdField.value = schedule.id;

        document.getElementById('title').value = schedule.title;
        document.getElementById('description').value = schedule.description;
        document.getElementById('isAllDay').checked = schedule.isAllDay;
        
        const start = new Date(schedule.startDate).toISOString().slice(0, 16);
        const end = new Date(schedule.endDate).toISOString().slice(0, 16);
        document.getElementById('startDate').value = start;
        document.getElementById('endDate').value = end;
        
        // 라디오 버튼 체크 (단일 선택이므로 하나만 매칭되면 break)
        if (schedule.Categories && schedule.Categories.length > 0) {
            const catId = schedule.Categories[0].id;
            for (let radio of categoryRadios) {
                if (radio.value == catId) {
                    radio.checked = true;
                    break;
                }
            }
        }

        toggleTimeInputs();

    } else {
        title.textContent = '새 일정 추가';
        saveBtn.textContent = '저장';
        form.setAttribute('data-mode', 'add');
        scheduleIdField.value = '';
        
        // 라디오 버튼 초기화 (선택 안 함)
        categoryRadios.forEach(radio => { radio.checked = false; });
        
        if (selectedDateInfo) {
            const y = selectedDateInfo.year;
            const m = String(selectedDateInfo.month).padStart(2, '0');
            const d = String(selectedDateInfo.day).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}T09:00`;
            document.getElementById('startDate').value = dateStr;
            document.getElementById('endDate').value = dateStr;
        }
        
        document.getElementById('isAllDay').checked = false;
        toggleTimeInputs();
    }
    
    modal.style.display = 'flex';
}

function handleScheduleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const mode = form.getAttribute('data-mode');
    const id = document.getElementById('schedule-id-field').value;
    
    const formData = new URLSearchParams(new FormData(form));
    let url = '/schedule';
    let method = 'POST';

    if (mode === 'edit') {
        url = `/schedule/${id}`;
        method = 'PATCH';
    }

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
    })
    .then(response => {
        if (response.ok) {
            closeModal();
            reloadWithSelection();
        } else {
            alert('처리 실패: 서버 응답을 확인하세요.');
        }
    })
    .catch(err => console.error('폼 제출 오류:', err));
}

function deleteSchedule(id) {
    if (!confirm('정말 이 일정을 삭제하시겠습니까?')) return;
    fetch(`/schedule/${id}`, { method: 'DELETE' })
    .then(response => {
        if (response.ok) { reloadWithSelection(); } else { alert('일정 삭제에 실패했습니다.'); }
    })
    .catch(err => console.error('삭제 오류:', err));
}

function closeModal() { document.getElementById('add-modal').style.display = 'none'; }

function toggleTimeInputs() {
    const isChecked = document.getElementById('isAllDay').checked;
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');
    const startTimeValue = startInput.value;
    const endTimeValue = endInput.value;

    if (isChecked) {
        const startDateOnly = startTimeValue.substring(0, 10); 
        const endDateOnly = endTimeValue.substring(0, 10); 
        startInput.type = 'date';
        endInput.type = 'date';
        startInput.value = startDateOnly;
        endInput.value = endDateOnly;
    } else {
        startInput.type = 'datetime-local';
        endInput.type = 'datetime-local';
        if (startTimeValue.length === 10) { 
             startInput.value = startTimeValue + 'T09:00';
             endInput.value = endTimeValue + 'T09:00';
        }
    }
}

// 카테고리 관리 함수들
function deleteCategory(id) {
    if (!confirm('정말 이 카테고리를 삭제하시겠습니까?')) return;
    fetch(`/category/${id}`, { method: 'DELETE' })
    .then(res => { if (res.ok) window.location.reload(); })
    .catch(err => console.error(err));
}

function openEditCategoryModal(id, name, color) {
    document.getElementById('edit-cat-id').value = id;
    document.getElementById('edit-cat-name').value = name;
    document.getElementById('edit-cat-color').value = color; 
    document.getElementById('edit-category-modal').style.display = 'flex';
}

function submitEditCategoryForm() {
    const id = document.getElementById('edit-cat-id').value;
    const name = document.getElementById('edit-cat-name').value;
    const color = document.getElementById('edit-cat-color').value;
    if (name.trim() === "") { alert("이름을 입력하세요."); return; }
    fetch(`/category/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, color: color }),
    })
    .then(response => { if (response.ok) window.location.reload(); else alert('수정 실패'); })
    .catch(err => console.error(err));
}

function closeEditCategoryModal() { document.getElementById('edit-category-modal').style.display = 'none'; }

document.addEventListener('DOMContentLoaded', () => {
    const scheduleForm = document.querySelector('#add-modal form');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', handleScheduleFormSubmit);
    }

    const params = new URLSearchParams(window.location.search);
    const selectedDay = params.get('selectedDay');
    if (selectedDay) {
        const dayEl = document.querySelector(`.day[data-day="${selectedDay}"]`);
        if (dayEl) {
            selectDate(dayEl);
        }
    }
});