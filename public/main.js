// public/main.js

let selectedDateInfo = null;

// ---------------------------------------------------------
// 캘린더 날짜 클릭 처리
// ---------------------------------------------------------
function selectDate(element, isClick = true) {
    const year = element.getAttribute('data-year');
    const month = element.getAttribute('data-month');
    const day = element.getAttribute('data-day');
    const holidayName = element.getAttribute('data-holiday');
    
    const schedulesData = JSON.parse(element.getAttribute('data-schedules') || '[]');
    const checkedIds = Array.from(document.querySelectorAll('.filter-checkbox:checked')).map(cb => cb.value);

    // 필터링
    const filteredSchedules = schedulesData.filter(s => {
        if (!s.Categories || s.Categories.length === 0) return true;
        const scheduleCatId = String(s.Categories[0].id);
        return checkedIds.includes(scheduleCatId);
    });

    if(isClick) selectedDateInfo = { year, month, day };

    // 우측 패널 업데이트
    const dateTitle = document.getElementById('panel-date');
    const holidayInfo = document.getElementById('panel-holiday-info');
    const listInfo = document.getElementById('panel-list');

    dateTitle.textContent = `${year}년 ${month}월 ${day}일`;
    
    // 요일/휴일 색상 처리
    const currentDate = new Date(year, month - 1, day);
    const dayOfWeek = currentDate.getDay(); 

    dateTitle.style.color = 'black';
    if (dayOfWeek === 6) dateTitle.style.color = 'blue'; 
    if (dayOfWeek === 0 || holidayName) dateTitle.style.color = 'red'; 

    if (holidayName) {
        holidayInfo.textContent = `★ ${holidayName}`;
        holidayInfo.style.color = 'red';
        holidayInfo.style.fontWeight = 'bold';
        holidayInfo.style.display = 'block';
    } else {
        holidayInfo.textContent = "";
        holidayInfo.style.display = 'none';
    }
    
    // 리스트 그리기
    if (filteredSchedules.length > 0) {
        let html = '';
        // 시작 시간 순 정렬
        filteredSchedules.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        filteredSchedules.forEach(s => {
            const scheduleJson = JSON.stringify(s).replace(/"/g, "'");
            const start = new Date(s.startDate);
            const end = new Date(s.endDate);
            
            const timeOpts = { hour: '2-digit', minute: '2-digit', hour12: false };
            const startTime = start.toLocaleTimeString([], timeOpts);
            const endTime = end.toLocaleTimeString([], timeOpts);
            
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
        listInfo.innerHTML = '<div style="color:#999; padding:10px;">등록된 일정이 없습니다.</div>';
    }

    if (isClick) {
        const prevSelected = document.querySelector('.day.active-day');
        if (prevSelected) prevSelected.classList.remove('active-day');
        element.classList.add('active-day');
    }
}

function toggleAllCategories(source) {
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = source.checked;
    });
    applyCategoryFilter();
}

function applyCategoryFilter() {
    const checkedIds = Array.from(document.querySelectorAll('.filter-checkbox:checked')).map(cb => cb.value);
    const dots = document.querySelectorAll('.schedule-dot');
    
    dots.forEach(dot => {
        const catId = dot.getAttribute('data-category-id');
        if (catId === 'none' || checkedIds.includes(catId)) {
            dot.style.display = 'inline-block';
        } else {
            dot.style.display = 'none';
        }
    });

    if (selectedDateInfo) {
        const { day } = selectedDateInfo;
        const currentDayEl = document.querySelector(`.day[data-day="${day}"]`);
        if(currentDayEl) selectDate(currentDayEl, false);
    }
}


// ---------------------------------------------------------
// 일정 상세 보기
// ---------------------------------------------------------
function openViewModal(schedule) {
    const modal = document.getElementById('view-schedule-modal');
    const start = new Date(schedule.startDate);
    const end = new Date(schedule.endDate);
    
    const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
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


// ---------------------------------------------------------
// 일정 추가/수정
// ---------------------------------------------------------

// 날짜 포맷팅 헬퍼 함수 (YYYY-MM-DDTHH:mm 변환)
function formatDateForInput(dateStr) {
    const date = new Date(dateStr);
    const YYYY = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const DD = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${YYYY}-${MM}-${DD}T${HH}:${mm}`;
}

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
    const categoryRadios = form.querySelectorAll('input[name="categoryIds"]');
    
    // input 요소 가져오기
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');
    const isAllDayCheckbox = document.getElementById('isAllDay');

    // 수정 모드
    if (schedule) {
        title.textContent = '일정 수정';
        saveBtn.textContent = '수정 완료';
        form.setAttribute('data-mode', 'edit');
        scheduleIdField.value = schedule.id;

        document.getElementById('title').value = schedule.title;
        document.getElementById('description').value = schedule.description;
        
        // 값을 넣기 전에 타입을 'datetime-local'로 강제 초기화
        startInput.type = 'datetime-local';
        endInput.type = 'datetime-local';

        // 포맷팅 함수 사용
        startInput.value = formatDateForInput(schedule.startDate);
        endInput.value = formatDateForInput(schedule.endDate);
        
        isAllDayCheckbox.checked = schedule.isAllDay;
        
        // 카테고리 체크
        if (schedule.Categories && schedule.Categories.length > 0) {
            const catId = schedule.Categories[0].id;
            for (let radio of categoryRadios) {
                if (radio.value == catId) {
                    radio.checked = true;
                    break;
                }
            }
        }

        // 체크 여부에 따라 UI 조정
        toggleTimeInputs();

    // 추가 모드
    } else {
        title.textContent = '새 일정 추가';
        saveBtn.textContent = '저장';
        form.setAttribute('data-mode', 'add');
        scheduleIdField.value = '';
        
        categoryRadios.forEach(radio => { radio.checked = false; });
        
        // 초기화
        startInput.type = 'datetime-local';
        endInput.type = 'datetime-local';
        isAllDayCheckbox.checked = false;

        if (selectedDateInfo) {
            const y = selectedDateInfo.year;
            const m = String(selectedDateInfo.month).padStart(2, '0');
            const d = String(selectedDateInfo.day).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}T09:00`;
            startInput.value = dateStr;
            endInput.value = dateStr;
        }
        
        toggleTimeInputs();
    }
    
    modal.style.display = 'flex';
}

function handleScheduleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const mode = form.getAttribute('data-mode');
    const id = document.getElementById('schedule-id-field').value;
    
    // 유효성 검사
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (startDate > endDate) {
        alert("종료 시간은 시작 시간보다 빠를 수 없습니다.");
        return; 
    }

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
    .then(response => { if (response.ok) { reloadWithSelection(); } else { alert('삭제 실패'); } })
    .catch(err => console.error(err));
}

function closeModal() { document.getElementById('add-modal').style.display = 'none'; }

// 하루 종일 체크 시 값 유지하며 타입 변경
function toggleTimeInputs() {
    const isChecked = document.getElementById('isAllDay').checked;
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');

    // 현재 값 백업
    const startTimeValue = startInput.value;
    const endTimeValue = endInput.value;

    if (isChecked) {
        // datetime -> date (앞 10자리만)
        if (startInput.type !== 'date') {
            startInput.type = 'date';
            endInput.type = 'date';
            // 값이 날라갔을 수 있으므로 백업본에서 잘라서 복구
            if (startTimeValue) startInput.value = startTimeValue.substring(0, 10);
            if (endTimeValue) endInput.value = endTimeValue.substring(0, 10);
        }
    } else {
        // date -> datetime (T09:00 추가)
        if (startInput.type !== 'datetime-local') {
            startInput.type = 'datetime-local';
            endInput.type = 'datetime-local';
            // 날짜만 있는 경우 시간 추가
            if (startTimeValue && startTimeValue.length === 10) {
                startInput.value = startTimeValue + 'T09:00';
            } else if (startTimeValue) {
                startInput.value = startTimeValue; // 이미 시간 있으면 유지
            }
            
            if (endTimeValue && endTimeValue.length === 10) {
                endInput.value = endTimeValue + 'T09:00';
            } else if (endTimeValue) {
                endInput.value = endTimeValue;
            }
        }
    }
}

// 카테고리 관리
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
        if (dayEl) selectDate(dayEl);
    }
});