# Canvas CP1 — Vmap

**Track:** Track E – Open Lane
**Đề:** Vmap – AI Assistant giúp học viên AI20k tìm khu vực lấy/refill nước tại VinUni.
**Nhóm:** Vmap · Lớp 3A · Phòng: **E402**
**Đội trưởng:** **Đoàn Quang Thắng** · MSSV **2A202602395** · GitHub [conanWinner](https://github.com/conanWinner)
**Repo:** `K4-3A-E402-Vmap` — [đội trưởng tạo và paste link public tại đây trước 19:30]

---

## 1 · Job executor (một vai cụ thể)

Học viên AI20k đang học trực tiếp tại VinUni và cần tìm nơi lấy/refill nước trong quá trình học, làm bài hoặc tham gia workshop.

## 2 · Pain (1 câu — ai · đang làm gì · vướng đâu · hậu quả)

Khi cần lấy/refill nước tại VinUni, học viên AI20k đôi khi không biết điểm nước ở đâu hoặc điểm nào gần vị trí hiện tại, dẫn đến phải hỏi người khác hoặc mất thời gian tự tìm.

## 3 · Bằng chứng đầu (1–2 con số + quote)

Nhóm đang khảo sát học viên AI20k qua form/phỏng vấn nhanh và quan sát thực địa các điểm nước tại VinUni để ghi nhận vị trí, tình trạng, cách người học đang tự tìm nước và thời gian họ mất.

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
| **Đoàn Quang Thắng** · 2A202602395 | Product lead | Canvas/spec, system prompt, output contract |
| Phạm Minh Hiếu · 2A202602630 | Data & evidence | Mining, khảo sát |
| Đỗ Việt Hoàng · 2A202602882 | Eval, UI/UX | Golden set, quality bar, eval, UI, 4 đường trải nghiệm, user test |
| Kiều Đình Đoàn · 2A202602936 | Backend | Gọi model, validator |

---

**Checklist tự soát trước 19:30:**

- [X] Lát cắt đúng format **1 câu · 4 phần MỘT** (user · việc · quyết định AI · kết quả)
- [X] Có ≥1 bằng chứng bằng **con số thật** (không phải "nhiều người thấy khó")
- [X] Có ≥1 **quote nguyên văn** từ khảo sát
- [X] Đủ tên + MSSV cho ≥2 willing user (không phải tên nhóm)
- [X] Phân công có tên rõ ai làm gì (vibe-coding rule)
- [X] Repo GitHub đã **public** (thử mở cửa sổ ẩn danh)
- [X] Đội trưởng đã sẵn form, mã HV đúng
