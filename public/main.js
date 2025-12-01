// public/main.js

// 날짜 클릭 시 실행되는 함수
function selectDate(element) {
    // 1. 선택된 날짜 정보 가져오기
    const year = element.getAttribute('data-year');
    const month = element.getAttribute('data-month');
    const day = element.getAttribute('data-day');

    // 2. 우측 패널 정보 업데이트
    const dateTitle = document.getElementById('panel-date');
    const lunarInfo = document.getElementById('panel-lunar');
    const listInfo = document.getElementById('panel-list');

    // 날짜 표시
    dateTitle.textContent = `${year}년 ${month}월 ${day}일`;
    lunarInfo.textContent = `(음력 변환 기능 준비 중)`; 
    listInfo.textContent = "등록된 일정이 없습니다."; // 추후 AJAX로 실제 일정 로드 필요

    // 3. 선택 효과 (파란 테두리) 변경
    const prevSelected = document.querySelector('.day.active-day');
    if (prevSelected) {
        prevSelected.classList.remove('active-day');
    }
    element.classList.add('active-day');
    
    // 선택된 날짜를 전역 변수나 hidden input에 저장해두면 '일정 추가' 시 유용함
    // window.selectedDate = { year, month, day }; 
}

// (추후 구현) 일정 추가 버튼 클릭 시 모달 열기
function openAddModal() {
    alert("아직 일정 추가 기능이 구현되지 않았습니다.\n다음 단계에서 모달창을 띄울 예정입니다!");
}

// 카테고리 삭제 함수 (AJAX 요청)
function deleteCategory(id) {
    if (!confirm('정말 이 카테고리를 삭제하시겠습니까?')) return;

    fetch(`/category/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            window.location.reload(); // 성공 시 페이지 새로고침
        } else {
            alert('삭제 실패');
        }
    })
    .catch(err => console.error(err));
}

// [추가] 카테고리 수정 함수
function editCategory(id, currentName) {
    // 1. 사용자에게 새로운 이름 입력받기
    const newName = prompt("카테고리 이름을 수정하세요:", currentName);

    // 취소했거나 이름이 없으면 중단
    if (newName === null || newName.trim() === "") return;
    if (newName === currentName) return; // 변경사항 없으면 중단

    // 2. 서버에 수정 요청 (PATCH)
    fetch(`/category/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
    })
    .then(response => {
        if (response.ok) {
            window.location.reload(); // 성공 시 새로고침
        } else {
            alert('수정 실패');
        }
    })
    .catch(err => console.error(err));
}