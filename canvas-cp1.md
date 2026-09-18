# Canvas CP1 — Vmap

**Track:** Track E – Open Lane
**Đề:** Vmap – AI Assistant giúp học viên AI20k tìm khu vực lấy/refill nước tại VinUni.
**Nhóm:** 1PROMPT · Lớp 3B · Phòng: **E402**
**Đội trưởng:** **Đoàn Quang Thắng** · MSSV **2A202602395** · GitHub [conanWinner](https://github.com/conanWinner)
**Repo:** [K4-3B-402-1PROMPT](https://github.com/he170794kieudinhdoan-lang/K4-3B-402-1PROMPT)

---

## 1 · Job executor (một vai cụ thể)

Học viên AI20k đang học trực tiếp tại VinUni và cần tìm nơi lấy/refill nước trong quá trình học, làm bài hoặc tham gia workshop.

## 2 · Pain (1 câu — ai · đang làm gì · vướng đâu · hậu quả)

Khi cần lấy/refill nước tại VinUni, học viên AI20k đôi khi không biết điểm nước ở đâu hoặc điểm nào gần vị trí hiện tại, dẫn đến phải hỏi người khác hoặc mất thời gian tự tìm.

## 3 · Bằng chứng đầu (1–2 con số + quote)

**Nguồn:** Google Form + phỏng vấn nhanh học viên AI20k (17–18/9). Log CSV nguyên văn: [`evidence/Khảo_sát_trải_nghiệm_tìm_khu_vự2026-09-18_06_44_07.csv`](evidence/Kh%E1%BA%A3o_s%C3%A1t_tr%E1%BA%A3i_nghi%E1%BB%87m_t%C3%ACm_khu_v%E1%BB%B12026-09-18_06_44_07.csv) — **n = 21** phiếu hợp lệ (đạt chuẩn A ≥ 20).

**Con số chính:**
- **17/21 (81%)** học viên AI20k từng cần tìm nơi lấy/refill nước nhưng không biết ở đâu.
- **18/21 (86%)** hiện chỉ biết **0–2 điểm nước** quanh khu vực học thường xuyên.
- **5/17 (29%) confirmed pain** mất **trên 5 phút** mỗi lần tìm; **14/21 (67%)** muốn thông tin "điểm nước gần nhất".

**Quote nguyên văn từ CSV** (số trong ngoặc = số phiếu ghi đúng cụm này):

- *"Không biết điểm nước nằm ở đâu"* (×10)
- *"Thiếu / khó thấy biển chỉ dẫn"* (×6)
- *"Campus rộng, khó định hướng"* (×5)
- *"Không biết điểm nào gần nhất"* (×4)
- *"Không biết điểm nước có đang sử dụng được không"* (×2)
- *"Cần có bản đồ rõ ràng hơn"* — quote mở về mong muốn cải thiện.

Chi tiết bảng phân bố 6 chiều + willing users để trong `spec.md` §1.

## 4 · Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả)

> Một học viên AI20k cần tìm điểm nước gần nhất; hệ thống hiểu vị trí hiện tại và nhu cầu, chọn điểm nước phù hợp từ dữ liệu đã xác minh và hướng dẫn học viên đến đúng điểm nước.

## 5 · Automation dự kiến + lý do (cost-of-error)

AI hiểu yêu cầu bằng ngôn ngữ tự nhiên, xác định nhu cầu “tìm nước” và vị trí hiện tại, sau đó chọn điểm nước phù hợp từ dữ liệu đã xác minh; route engine tính đường và AI diễn đạt hướng dẫn dễ hiểu.

## 6 · Willing users (≥2 tên có mã HV)

1. Đỗ Nguyễn Ngọc Long - 2A202602390
2. Cao Đức Anh - 2A202602754
Dự kiến ≥3 học viên ngoài nhóm sẵn sàng test prototype.

## 7 · Phân công có tên (mỗi người 1 dòng)

| Thành viên · MSSV | Vai trò | Phần việc cụ thể (giám khảo có thể hỏi bất kỳ ai — vibe-coding rule) |
|---|---|---|
| Phạm Minh Hiếu · 2A202602630 | Product/BA + spec | Canvas, spec §1–§2, câu hỏi khảo sát, chốt lát cắt |
| Đỗ Việt Hoàng · 2A202602882 | AI/backend | Prompt, chọn điểm từ data đã xác minh, lời gọi AI thật |
| Kiều Đình Đoàn · 2A202602936 | frontend/prototype | UI luồng tìm nước, mock/prototype bấm được (CP2) |
| **Đoàn Quang Thắng** · 2A202602395 | test + data + slide/demo + docs + form (Đội trưởng) | Nhật ký evidence, eval, slide/demo, docs, nộp form CP1–CP5 |

---

**Checklist tự soát trước 19:30:**

- [X] Lát cắt đúng format **1 câu · 4 phần MỘT** (user · việc · quyết định AI · kết quả)
- [X] Có ≥1 bằng chứng bằng **con số thật** (không phải "nhiều người thấy khó")
- [X] Có ≥1 **quote nguyên văn** từ khảo sát
- [X] Đủ tên + MSSV cho ≥2 willing user (không phải tên nhóm)
- [X] Phân công có tên rõ ai làm gì (vibe-coding rule)
- [X] Repo GitHub đã **public** (thử mở cửa sổ ẩn danh)
- [X] Đội trưởng đã sẵn form, mã HV đúng
