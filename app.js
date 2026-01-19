// app.js
(() => {
  // === (임시) 데모용 데이터 ===
  // 실제 서비스에서는 절대 프론트에 비밀번호/원본 계정목록(민감정보)을 넣지 마세요.
  // 다음 단계에서 "서버(API)로 조회" 방식으로 바꾸는 걸 추천합니다.
  const ACCOUNTS = [
    { studentNo: "20251234", name: "홍길동", googleId: "20251234@yssm.school" },
    { studentNo: "20251235", name: "김철수", googleId: "20251235@yssm.school" },
  ];

  const $ = (sel) => document.querySelector(sel);

  const form = $("#searchForm");
  const studentNoInput = $("#studentNo");
  const studentNameInput = $("#studentName");

  const resetBtn = $("#resetBtn");

  const statusEl = $("#status");
  const resultEl = $("#result");

  const googleIdEl = $("#googleId");
  const googlePwEl = $("#googlePw");

  const copyIdBtn = $("#copyIdBtn");
  const copyPwBtn = $("#copyPwBtn");
  const togglePwBtn = $("#togglePwBtn");

  // 상태 메시지 표시 도우미
  function showStatus(message, type = "info") {
    statusEl.hidden = false;
    statusEl.textContent = message;

    // 간단한 타입별 표현(색상은 CSS에서 해도 됨)
    statusEl.dataset.type = type;
  }

  function hideStatus() {
    statusEl.hidden = true;
    statusEl.textContent = "";
    statusEl.dataset.type = "";
  }

  function hideResult() {
    resultEl.hidden = true;
    googleIdEl.textContent = "-";
    googlePwEl.textContent = "••••••••";
  }

  function showResult({ googleId }) {
    resultEl.hidden = false;
    googleIdEl.textContent = googleId;

    // ✅ 보안상 PW는 표시하지 않음
    googlePwEl.textContent = "비밀번호는 보안상 표시하지 않습니다";
    googlePwEl.classList.remove("masked");
  }

  function normalizeName(name) {
    return String(name).trim().replace(/\s+/g, "");
  }

  function findAccount(studentNo, name) {
    const no = String(studentNo).trim();
    const nm = normalizeName(name);

    return ACCOUNTS.find(
      (a) => String(a.studentNo).trim() === no && normalizeName(a.name) === nm
    );
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  }

  function disablePwButtons() {
    // PW 관련 기능 비활성화(보안)
    togglePwBtn.disabled = true;
    copyPwBtn.disabled = true;

    togglePwBtn.title = "보안상 비밀번호 표시 기능은 비활성화되어 있습니다.";
    copyPwBtn.title = "보안상 비밀번호 복사 기능은 비활성화되어 있습니다.";

    togglePwBtn.style.opacity = "0.5";
    copyPwBtn.style.opacity = "0.5";
    togglePwBtn.style.cursor = "not-allowed";
    copyPwBtn.style.cursor = "not-allowed";
  }

  function enableIdCopy() {
    copyIdBtn.addEventListener("click", async () => {
      const text = googleIdEl.textContent?.trim();
      if (!text || text === "-") return;

      const ok = await copyToClipboard(text);
      showStatus(ok ? "Google ID를 복사했어요." : "복사에 실패했어요.", ok ? "success" : "error");
      setTimeout(hideStatus, 1400);
    });
  }

  function wireReset() {
    resetBtn.addEventListener("click", () => {
      form.reset();
      hideStatus();
      hideResult();
      studentNoInput.focus();
    });
  }

  async function onSearchSubmit(e) {
    e.preventDefault();
    hideStatus();
    hideResult();

    const studentNo = studentNoInput.value;
    const studentName = studentNameInput.value;

    if (!studentNo.trim() || !studentName.trim()) {
      showStatus("학번과 이름을 모두 입력해 주세요.", "error");
      return;
    }

    // 데모에서는 로컬 배열에서 검색
    // ✅ 실제 운영은 서버(API)에 studentNo/name을 보내고, 서버에서 권한 체크 후 결과를 내려주는 방식 권장
    const found = findAccount(studentNo, studentName);

    if (!found) {
      showStatus("일치하는 정보가 없어요. 학번/이름을 다시 확인해 주세요.", "error");
      return;
    }

    showResult(found);
    showStatus("조회 완료! (비밀번호는 보안상 표시하지 않습니다)", "success");
    setTimeout(hideStatus, 1600);
  }

  // 초기화
  function init() {
    disablePwButtons();
    enableIdCopy();
    wireReset();
    form.addEventListener("submit", onSearchSubmit);

    // 첫 진입 포커스
    studentNoInput.focus();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
