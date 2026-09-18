# R6 · Validation với người dùng ngoài nhóm

**Điểm:** 8 (bonus). Không làm thì trần điểm 92. Làm ở CP5.

## Yêu cầu (từ rubric)

1. **5 người ngoài nhóm** dùng thử, trong đó **≥ 2 người đã khai từ CP1**.
2. **Quote nguyên văn** — chép đúng lời họ nói, kể cả viết sai chính tả.
3. **Bảng nhật ký** — ai · task · kẹt ở đâu · quote · quyết định.
4. **≥ 1 thay đổi** ghi vào `spec.md` §9 Changelog. Giữ nguyên thì nói rõ vì sao.
5. **Cuối bảng viết 4 dòng:** chủ đề lặp nhiều nhất · sửa gì trước demo · giữ gì và vì sao · để dành sau.

## Quote thế nào MỚI ăn điểm

| CHƯA ĐẠT (lời khen xã giao) | ĐẠT (lời người dùng nói LÚC ĐANG CỐ LÀM VIỆC) |
|---|---|
| *"Demo này ok rồi đấy"* | *"Ơ, sao mình bấm mà không thấy tuyến hiện lên?"* |
| *"Hay đấy"* | *"Mình muốn tìm điểm nước ở tầng 2 tòa E, không phải tầng 1"* |
| *"Sản phẩm này hay không?"* | *"Cái nút xanh này là gì? Bấm đúng không?"* |

**Cách để có quote đạt:** giao task rồi **ngồi im xem họ làm**. **Đừng hỏi "sản phẩm này hay không"** — hỏi vậy chỉ nhận được lời khen xã giao.

## Protocol — mỗi user test 10–15 phút

**Bước 1 — mở đầu (30 giây):**
> "Cảm ơn bạn dành thời gian. Mình đưa bạn 1 task, bạn thử làm. **Mình không hỗ trợ gì trong lúc bạn làm**, cứ nói to suy nghĩ ra thành tiếng. Kẹt cũng cứ nói. Không có đúng sai."

**Bước 2 — giao task cụ thể (không giải thích UI):**

Chọn 1 trong 3 task, mỗi user chỉ 1 task:

- **Task A (happy path):** *"Bạn đang ở cổng Tây campus. Bạn khát nước. Dùng app này tìm điểm nước gần nhất."*
- **Task B (correction):** *"Bạn tìm được điểm nước rồi nhưng đến nơi thấy máy hỏng. Báo cho app và tìm điểm khác."*
- **Task C (mưa/ràng buộc):** *"Trời đang mưa. Bạn cần tìm nước, chỉ đi trong nhà hoặc lối mái che."*

**Bước 3 — quan sát + ghi (10 phút):**

- **Ngồi im.** Không chỉ, không giải thích, không "à cái nút đó ở góc trên nè".
- Chép **nguyên văn** mọi câu họ tự nói ra ("Ủa cái này là gì", "Sao không thấy", "À thế à").
- Ghi cả **im lặng dài + rê chuột lung tung** — đó là dấu hiệu kẹt.

**Bước 4 — hỏi sau (2 phút, CHỈ SAU khi họ xong hoặc bỏ cuộc):**

- ❌ Đừng hỏi: *"App này hay không?"*, *"Bạn thấy đẹp không?"*
- ✅ Hỏi: *"Chỗ nào khó nhất?"*, *"Nếu dùng thật, bạn sẽ dùng lúc nào?"*, *"Có gì bạn tưởng làm được mà app không làm được?"*

**Bước 5 — ghi vào `log-cp5.md`** ngay, đừng để cuối ngày mới ghi (quên chi tiết).

## Danh sách 5 người cần mời

**Từ CP1 (canvas §6, ≥ 2 người, đây là bắt buộc):**

- [ ] Đỗ Nguyễn Ngọc Long · `2A202602390`
- [ ] Nguyễn Hoàng Nam · `2A202602485`
- [ ] Cao Đức Anh · `2A202602754`

**Từ CSV khảo sát (có contact — dễ mời):**

- [ ] `discord_user_123` (phiếu 15, biết 2 điểm nước)
- [ ] `ai_learner_99` (phiếu 20, biết 3+ điểm nước)

Nếu 2 người CSV bận, bổ sung từ 6 phiếu tick "Có" nhưng bỏ trống contact — hỏi trực tiếp trên Discord AI20k.

## Deadline

- **CP5 (22:30 · 18/9):** phải có `log-cp5.md` điền xong + ≥ 1 dòng Changelog mới trong `spec.md`.
- Test sớm (chiều 18/9) để còn kịp sửa trước demo sáng 19/9.
