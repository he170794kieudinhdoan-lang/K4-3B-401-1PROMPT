# AI SPEC — Tìm điểm nước/refill gần nhất tại VinUni · Nhóm E402-C2 · Zone C2

Hướng: [x] E — Làn mở (Open Lane)  [ ] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Lesson Studio  [ ] D — Học tập thích ứng

Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

Nguồn CP1: Canvas *Vmap — Find Water. Keep Learning.* (Track E). Mục §1–§2 bên dưới là bản chuyển Canvas vào spec; số liệu khảo sát và quote nguyên văn **chưa đủ chuẩn A/B**, sẽ bổ sung trước CP4.

---

## §1. User & Job

### Job executor + workflow

**Job executor:** Học viên AI20k đang học trực tiếp tại VinUni — người cần lấy/refill nước trong lúc học, làm bài, workshop, sự kiện.

**Workflow as-is (từ Canvas):**

1. Đang học / làm bài / tham gia workshop tại một tòa nhà VinUni.
2. Khát hoặc hết nước → muốn lấy nước uống hoặc refill bình.
3. Không chắc điểm nước ở đâu, hoặc điểm nào gần vị trí hiện tại.
4. Hỏi bạn / hỏi người khác, hoặc tự đi tìm theo trí nhớ / bảng chỉ dẫn.
5. Tìm được (hoặc không) → quay lại chỗ học; mạch làm việc bị đứt.

*(Worksheet JTBD / ảnh sơ đồ campus: bổ sung khi có khảo sát thực địa.)*

### Core JTBD *(không tên sản phẩm / không chữ AI)*

Khi đang học hoặc sinh hoạt tại VinUni và hết nước / khát, tôi muốn biết điểm lấy hoặc refill nước nào đang dùng được và gần chỗ tôi đang đứng, để lấy nước xong quay lại học / làm bài / workshop nhanh, không phải hỏi người khác hay đi loanh quanh.

### Problem statement *(KHÔNG chữ AI)*

Học viên AI20k khi cần lấy/refill nước tại VinUni đôi khi không biết điểm nước ở đâu, hoặc điểm nào gần vị trí hiện tại, nên phải hỏi người khác hoặc mất thời gian tự tìm — đứt mạch học tập và sinh hoạt.

### Evidence (chuẩn A và/hoặc B — log đầy đủ trong repo)

**Trạng thái CP1:** mới có *mầm* evidence. **Chưa đạt** chuẩn A (khảo sát ≥20 người ngoài nhóm, ≥50% xác nhận, log nguyên văn) và **chưa đạt** chuẩn B (số mining đếm được + ≥5 ví dụ nguyên văn + phương pháp đếm). Track E chấm evidence nghiêm hơn A–D — mục này phải đủ trước hạn chốt spec (CP4, 21:00 18/9).

| Nguồn (Canvas dòng 4) | Đã có | Còn thiếu |
|---|---|---|
| Khảo sát học viên AI20k (Google Form + phỏng vấn nhanh) về trải nghiệm tìm khu vực nước uống | **n = 9** (17/9, đếm tay trên sheet) · **7/9 (78%)** từng không biết điểm nước | n ≥ 20 · log nguyên văn từng phiếu trong repo · file CSV |
| Quan sát thực tế một số tòa nhà VinUni: vị trí, tình trạng, khả năng tiếp cận điểm nước | Chưa có bản ghi điểm | Bản ghi từng điểm (tòa · tầng · loại: uống / refill · đang hoạt động?) |
| Willing users | 3 tên thật đã đồng ý | Dùng thử prototype lúc CP5 (R6) |

- Số liệu mining / kết quả khảo sát: **mầm:** n = 9 · 7/9 xác nhận pain · ≥3/9 mất >5 phút mỗi lần tìm. **Chưa chuẩn A.**
- Quote mở trên sheet (chưa gắn mã HV): *“Thiếu / khó thấy biển chỉ dẫn”* · *“Campus rộng, khó định hướng”* · *“Không biết điểm nào gần nhất”* · *“Không biết điểm nước có đang sử dụng được”*. Cần ≥1 quote nữa + nguồn phiếu để đủ 5.

**Việc phải ghi vào file nháp (trước CP4):** nhật ký câu hỏi · câu trả lời nguyên văn · n · số người xác nhận pain · quy tắc đếm nếu có mining.

---

## §2. Impact & quyết định chọn

Canvas CP1 chốt hướng tìm/refill nước. Bảng dưới so ≥3 ứng viên. Số #1 lấy từ Form 17/9 (n = 9); #2/#3 chưa có mẫu song song.

### Bảng impact ≥3 ứng viên

| # | Ứng viên (job / pain) | Bao nhiêu người gặp | Tần suất | Mỗi lần tốn gì | Build nổi trong sự kiện? | Chọn? |
|---|---|---|---|---|---|---|
| 1 | Tìm điểm lấy/refill nước gần vị trí đang học | Form 17/9: **7/9** HV AI20k từng không biết điểm nước (78%). Chưa đủ n=20 | Trong 9 phiếu: khá thường 3 · thỉnh thoảng ≥3 · chỉ 1 lần 1 | Đi mua / tự tìm / hỏi bạn hoặc bảo vệ; **≥3/9 mất >5 phút**, ≥2/9 mất 3–5 phút | Có — 1 user · 1 việc · data điểm nước quan sát được | **Chọn (CP1, mầm số)** |
| 2 | Tìm vị trí thư viện / bị lạc đường giữa các tòa | Có tín hiệu trong bản tin Discord khoá 4 (hỏi thư viện vì lạc đường) — chưa đếm trên `k4_messages.csv` | Cao tuần onboarding, giảm khi đã quen campus | Thời gian hỏi kênh / chờ reply; trễ buổi học | Có, nhưng gần với “bản đồ campus” hơn là một quyết định hẹp | Loại tạm (CP1) |
| 3 | Tìm đúng phòng lab / xử lý ngồi nhầm phòng | Có tín hiệu trong bản tin Discord (ngồi nhầm phòng lab) — chưa đếm | Tập trung buổi lab, không phải mọi giờ học | Trễ điểm danh / trễ lab; hỏi BTC/Mod | Khả thi nhưng dính lịch/phòng — dữ liệu đổi theo tuần, khó xác minh tại chỗ | Loại tạm (CP1) |

### Ứng viên ĐÃ LOẠI + vì sao

- **#2 Tìm thư viện / lạc tòa:** có mầm evidence trong `k4_daily_reports.md`, nhưng đó là pain *tìm một địa điểm cố định đã có câu trả lời hành chính* (thư viện đối diện Canteen/Highlands). Dễ thành bảng chỉ dẫn tĩnh; ít cần quyết định theo vị trí hiện tại + trạng thái “đang hoạt động”. Giữ lại nếu khảo sát cho thấy lạc đường *nặng hơn* khát nước.
- **#3 Ngồi nhầm phòng lab:** pain có thật tuần đầu, nhưng tần suất không ổn định sau onboarding; phụ thuộc lịch BTC, không quan sát “điểm vật lý đang mở” như cây nước. Ngoài lát cắt 5 phút.

### Ứng viên CHỌN + vì sao (bằng số)

**Chọn #1 — tìm/refill nước tại VinUni.**

**Cách đếm (kiểm lại được):** Google Form 17/9, đếm tay trên sheet nhóm (chưa file CSV trong repo).  
- Mẫu: dòng trả **Có** ở câu “học viên AI20k đang học tại VinUni” → **n = 9**.  
- Xác nhận pain: **Có** ở câu “đã từng cần tìm nơi lấy/refill nước nhưng không biết ở đâu” → **7/9 (78%)**.  
- Chưa đạt chuẩn A (cần ≥20). Nếu export CSV ra số khác, sửa dòng này — không làm tròn cho đẹp.

**So với #2 và #3 trên cùng thước đo:**

| | #1 Điểm nước (Form) | #2 Thư viện / lạc tòa | #3 Nhầm phòng lab |
|---|---|---|---|
| Người gặp (mẫu này) | **7/9** từng không biết điểm nước | 0 câu Form hỏi việc này; chỉ 1 tín hiệu bản tin Discord | 0 câu Form; 1 tín hiệu Discord |
| Tần suất | Khá thường **3/9** · thỉnh thoảng nhiều phiếu · chỉ 1 lần **1/9** | Chủ yếu tuần onboarding | Theo buổi lab |
| Mỗi lần tốn | **≥3/9 >5 phút**; ≥2/9 mất 3–5 phút; workaround: đi mua, tự tìm, hỏi bạn/bảo vệ | Chờ reply / hỏi kênh | Trễ lab / hỏi BTC |
| Build 3 buổi | Có | Có nhưng thành bản đồ tĩnh | Dính lịch phòng, data đổi |

**Vì sao chọn #1 bằng số hiện có:** cùng n=9, pain nước **đo được 78%** và có phân bố thời gian; #2/#3 **chưa có mẫu song song**. Đa số phiếu chọn thông tin hữu ích là **điểm nước gần nhất** (khớp lát cắt).

**Chưa được khóa sau CP4:** n < 20. Nếu Form đủ ≥20 mà xác nhận pain **< 50%**, chọn lại ứng viên.

Giả định còn mở:

- 2/9 trả Không (chưa từng lạc điểm nước) — có thể biết chỗ rồi, hoặc ít khi lấy nước tại campus.
- Tiêu chí “gần nhất” thắng trên Form; refill / đang hoạt động chỉ xuất hiện ở 1 phiếu (Sảnh, biết ≥3 điểm).
- Số vị trí đang nhớ: nhiều phiếu **0–2** điểm quanh chỗ học; 1 phiếu **≥3**.

---

## §3. Giải pháp tương tự đã nghiên cứu

- [Sản phẩm 1]: flow / đáng học / đáng né / mình khác gì
- [Sản phẩm 2]: ...

## §4. Thiết kế

- Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả):
- Non-goals (≥3 thứ KHÔNG build):
- Mức prototype nhắm tới: [ ] Sketch [ ] Mock [ ] Working — phần nào mock, phần nào thật:
- Automation: [ ] augment [ ] conditional [ ] automate — lý do theo cost-of-error:
- §4b. Nguyên tắc đã áp dụng (≥4 — HAX/PAIR, xem guide):
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]

## §6. Bốn đường đi của trải nghiệm

- Happy path: · Low-confidence (②): · Failure/không căn cứ (①): · Correction (user sửa):
- Khi bị đòi ngoài phạm vi (③): · Case đặc thù domain (④):

## §7. Kiểm thử

- Chiều chất lượng + định nghĩa kiểm chứng được:
- Golden set (≥20 case theo cơ cấu trong guide §2.6, file trong eval/):
- Quality bar (chốt từ hạn chốt spec của khoá, giữ nguyên sau đó): "Đạt khi ≥ ___% qua bộ, và ___"
- Kết quả các lượt chạy (bảng % — cập nhật đến trước CP6):

## §8. Phân công & kế hoạch

Nhóm 4 người (không có thành viên 5). Đội trưởng nộp form: **Đoàn Quang Thắng** · `2A202602395`.

| Họ tên | Mã HV | Vai trò | Phần việc |
|---|---|---|---|
| Phạm Minh Hiếu | 2A202602630 | Product/BA + spec | Canvas, spec §1–§2, câu hỏi khảo sát, chốt lát cắt |
| Đỗ Việt Hoàng | 2A202602882 | AI/backend | Prompt, chọn điểm từ data đã xác minh, lời gọi AI thật |
| Kiều Đình Đoàn | 2A202602936 | frontend/prototype | UI luồng tìm nước, mock/prototype bấm được (CP2) |
| Đoàn Quang Thắng | 2A202602395 | test + data + slide/demo + docs + form | Nhật ký evidence, eval, slide/demo, nộp form CP1–CP5 |

**Willing users (ngoài nhóm, đã hỏi và đồng ý thử prototype):**

1. Đỗ Nguyễn Ngọc Long — `2A202602390`
2. Nguyễn Hoàng Nam — `2A202602485`
3. Cao Đức Anh — `2A202602754`

Kế hoạch validation (R6, bonus): CP5 giao task “tìm điểm nước gần chỗ đang đứng”, ghi nhật ký + quote nguyên văn; ít nhất 1 thay đổi vào §9 Changelog.

- Multi-prototype (nếu làm): chưa làm.

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
|---|---|---|
| 17/9 · CP1 | Đưa Canvas Vmap (Track E) vào §1–§2 | Nộp mầm evidence; số khảo sát và quote còn trống |
| 17/9 · CP1 | Chốt phân công 4 người + 3 willing users | Bỏ “Thành viên 5” / placeholder A–E trên poster |
| 17/9 · CP1 | Điền lý do chọn #1 bằng số Form n=9, 7/9 xác nhận pain | Thay đoạn “lý do bằng số: chưa có”; chưa đủ chuẩn A |
