# Nhật ký test với người dùng ngoài nhóm — CP5

**Ngày test:** 18/9/2026
**Prototype version:** commit `ed620d4` (nhánh main — split layout với chat + map, provider live 9router)
**Người ghi log:** Phạm Minh Hiếu 

---

## Bảng nhật ký

| # | User (tên · MSSV/handle) | Từ CP1? | Task giao | Kẹt ở đâu (quan sát) | Quote nguyên văn | Quyết định (fix / giữ / để dành) |
|---|---|---|---|---|---|---|
| 1 | Đỗ Nguyễn Ngọc Long · 2A202602390 | ✅ có | Tìm nước từ cổng Tây | [ví dụ: rê chuột 40s ở nút mic, không bấm] | *"UI hay đấy nhưng tao nghĩ thêm dòng mô tả (description)" | fix — 1 dòng mô tả |
| 2 | Tạ Quang Dũng · 2A202602588 | ❌ | Tìm điểm nước ở gần vị trí của bạn hiện tại | thiếu thông tin | *"Toà G trên web đéo có điểm nước à, tao đang ở toà G vẫn thấy có mà"* | fix - Đi quoanh toà G rồi cập nhật thêm các điểm nước |
| 3 | Nguyễn Tuấn Thành · 2A202602640 | ❌ | hỏi chatbot "Tôi là 3 que, tôi khát nước, tìm tôi đi nước gần nhất"  | không nhận được thông tin mong muốn | *"AI chatbot ngu vkl"* | giữ - do không có tiền mua model mạnh hơn |
| 4 | Nguyễn Hoàng Nam · 2A202602485 | ✅ | Tìm điểm nước ở gần vị trí của bạn hiện tại | không có tính năng định vị | *"không cho người dùng pick điểm hiện tại theo gps à"* | để dành - mới chỉ demo, chưa có thời gian thêm tính năng đó |
| 5 | **[CẦN TEST THÊM 1 NGƯỜI — rubric yêu cầu ≥ 5]** | ? | ? | ? | *"..."* | ? |

**Ràng buộc rubric:**
- ≥ 5 dòng → **hiện 4/5 hợp lệ + 1 đang thiếu**. Ưu tiên mời `discord_user_123` hoặc `ai_learner_99` (từ CSV Form) trước 22:30 · 18/9.
- ≥ 2 dòng cột "Từ CP1?" = ✅ → **đã đạt** (Long #1 + Nam #4).

---

## 4 dòng tổng kết (bắt buộc theo rubric)

*(Phân tích trên 4 quote đã có; cập nhật lại sau khi có user #5.)*

- **Chủ đề lặp nhiều nhất:** **2/4 user** nêu vấn đề *dữ liệu / mô tả chưa đầy đủ* — Long muốn có **1 dòng description** cho gợi ý kết quả, Dũng phát hiện **tòa G không có điểm nước trên web** trong khi thực tế có. Data-gap + thiếu affordance là chủ đề nổi bật nhất.
- **Sẽ sửa gì trước demo:**
  1. Thêm **1–2 dòng mô tả** cho card kết quả (loại điểm · uống/refill · trạng thái mẫu) trong drawer trợ lý — fix Long, thao tác nhanh trong `codebase/campus-app.js`.
  2. Bổ sung ≥ 1 điểm nước cho **tòa G** vào `codebase/campus-data.json` (nếu kịp khảo sát thực địa chiều 18/9); nếu không kịp thì thêm **disclaimer nổi bật** trên UI: *"Data mô phỏng — hiện chỉ cover E/D, các tòa khác sẽ bổ sung sau."*
- **Giữ nguyên gì và vì sao:**
  1. **Không dùng GPS thật** — Nam (CP1) đề xuất pick vị trí bằng GPS, nhưng đây là **non-goal §4b #1** đã khai từ đầu spec vì 39h không đủ triển khai BLE/Wi-Fi RTT + GPS trong nhà VinUni lệch cả tầng. Feedback của Nam **validate** lựa chọn non-goal thay vì lật ngược.
  2. **Model AI hiện tại** — Thành chê *"AI chatbot ngu vkl"*, nhóm hết ngân sách nâng model mạnh hơn. Sẽ **nói thẳng giới hạn này trong slide demo** thay vì né tránh (rubric R5 thưởng minh bạch).
- **Để dành sau:**
  1. **Tích hợp GPS/BLE thực** (feedback Nam) — cần khảo sát định vị trong nhà, sau CP6+.
  2. **Mở rộng data điểm nước cho tất cả tòa** (feedback Dũng) — cần đi khảo sát thực địa nhiều buổi, không kịp CP5.
  3. Nâng cấp model AI khi có ngân sách (feedback Thành).

---


