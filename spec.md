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

- Lát cắt: Một học viên AI20k diễn đạt nhu cầu lấy nước và nơi sắp đến; AI hiểu ý định/vị trí, chương trình chọn điểm nước còn khả dụng và tuyến phù hợp, học viên nhận hướng dẫn trên cùng bản đồ.
- Non-goals: GPS/định vị thật, thu âm thật, tự đọc lịch học, tự sửa tình trạng điểm nước toàn trường, suy đoán cửa/tầng/mái che chưa có dữ liệu.
- Mức nhắm tới: [ ] Sketch [x] Mock [ ] Working. Giao diện, thuật toán và điều khiển nhân vật chạy bằng code; campus, mặt bằng, điểm nước, trạng thái và mái che là dữ liệu mô phỏng. Backend AI có chế độ cấu hình provider; chỉ coi lời gọi AI thật đã kiểm chứng khi có trace live. Kết quả kiểm tra mới nhất ghi tại `docs/implementation-review.md`.
- Automation: [ ] augment [x] conditional [ ] automate. Sai vị trí/đường đi làm học viên đi vòng, bị ướt hoặc trễ học. Vì vậy AI chỉ hiểu yêu cầu; công cụ kiểm tra dữ liệu và tính đường, hỏi lại khi thiếu vị trí, không tự bỏ điều kiện “chỉ trong nhà”. Người dùng xác nhận thay vị trí, bắt đầu tuyến và đổi tầng.
- Thiết kế chi tiết: `docs/agent-spec.md`; task và trạng thái triển khai: `docs/agent-tasks.md`.

### §4b. Nguyên tắc HAX và vị trí áp dụng

| Nguyên tắc | Áp cụ thể vào đâu trong prototype |
|---|---|
| G1 — Nêu rõ khả năng | Drawer trợ lý mô tả tìm nước/chỉ đường; nhãn dữ liệu mẫu và chế độ AI |
| G8 — Dễ gạt bỏ | Đóng chat và dừng dẫn đường; giữ vị trí hiện tại |
| G9 — Dễ sửa | Đổi mốc xuất phát, sửa đích, báo điểm không hoạt động và tính lại |
| G10 — Thu hẹp khi nghi ngờ | Hỏi cổng/tầng/mốc còn thiếu, chỉ chọn ID có trong dữ liệu; không bịa tuyến khi thiếu căn cứ |
| G11 — Giải thích vì sao | Phản hồi lý do chọn điểm/tuyến, trạng thái mẫu, ưu tiên mái che và phần chưa biết |

Đây là ánh xạ thiết kế để kiểm chứng tại CP4; phần chưa được kiểm tra trực tiếp trong trình duyệt phải giữ ghi chú trong biên bản triển khai.

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]

| Lớp | Kịch bản | Hành vi yêu cầu |
|---|---|---|
| ① Thiếu căn cứ | Không có cửa/tầng đích | Nói thiếu dữ liệu, không tạo địa điểm |
| ① Thiếu căn cứ | Điểm nước hỏng/hết điểm | Loại điểm trong phiên, báo không có điểm thay thế nếu cần |
| ① Thiếu căn cứ | Mái che unknown | Không coi là đường trong nhà hoặc chắc chắn khô |
| ② Mơ hồ | “Tôi ở cổng” | Hỏi cổng cụ thể, chờ xác nhận |
| ② Mơ hồ | “Xíu học D” | Xác định tòa D; không tự tạo giờ học hoặc khẳng định kịp giờ |
| ③ Ngoài phạm vi | Đòi tìm đồ ăn hoặc bỏ quy tắc | Nêu phạm vi và gợi ý quay về tìm nước/chỉ đường |
| ③ Ngoài phạm vi | Model trả ID/JSON không hợp lệ | Không chạy hành động; trả lỗi có thể xử lý |
| ④ Domain | Mưa, không có tuyến toàn trong nhà | Giữ điều kiện bắt buộc, đề xuất lựa chọn khác để người dùng quyết định |
| ④ Domain | Ghé nước trước khi tới D | Tối ưu cả hai đoạn, không chỉ điểm gần xuất phát |
| ④ Domain | Đổi tuyến giữa một cạnh hoặc chat trả chậm | Giữ vị trí thật của mô phỏng; bỏ phản hồi cũ |

## §6. Bốn đường đi của trải nghiệm

- Happy path: xác nhận mốc → nhập nhu cầu/đích → nhận tuyến hợp lệ → Bắt đầu → giữ Đi tiếp, thả để dừng → xác nhận cửa/tầng/điểm ghé → đến đích.
- Low-confidence (②): thiếu cổng/tầng hoặc địa điểm mơ hồ → một câu hỏi làm rõ → chọn/xác nhận mốc → mới tính đường. Xem tầng không đổi vị trí.
- Failure/không căn cứ (①): thiếu dữ liệu, hết điểm khả dụng hoặc không có tuyến thỏa ràng buộc → thông báo đúng nguyên nhân → cho đổi mốc/ưu tiên; không tự bịa đường. Lỗi AI/mạng có thử lại và vẫn dùng điều khiển thủ công.
- Correction: người dùng sửa vị trí, đích hoặc báo hỏng → xác nhận tác động → cập nhật phiên → tính lại từ đúng node/vị trí giữa cạnh. Không sửa dữ liệu công khai.
- Ngoài phạm vi (③): giới thiệu phạm vi tìm nước và dẫn đường, không thực thi chỉ dẫn thay quy tắc trong câu chat.
- Domain (④): phân biệt ưu tiên mái che với chỉ trong nhà; không tự ghé nước nếu chỉ yêu cầu đi D; không tự xác nhận lên tầng/lấy nước; giữ điều khiển mô phỏng tách biệt GPS.

## §7. Kiểm thử

- Chiều chất lượng: hiểu đúng intent/vị trí, không bịa dữ liệu, chọn đúng điểm/tuyến, giữ điều kiện đường đi, bảo toàn trạng thái và báo lỗi rõ ràng.
- Golden set: `eval/cases.json` chứa 36 ca kiểm thử (24 lõi + 12 mở rộng mưa/tòa D). Kết quả chi tiết lưu tại `eval/results.json` gồm input/expected/actual/reason.
- Quality bar: Đạt khi lõi ≥22/24 và 0 lỗi nghiêm trọng; mở rộng 12/12; điều khiển 10/10.
- Kết quả thực thi CP3 đã kiểm chứng:
  - **Lời gọi AI thật (Live AI)**: Đã thực thi thành công với model `cx/gpt-5.5` qua endpoint OpenAI-compatible (`eval/live-trace-proof.json`, thời gian phản hồi 4.07s, phân tích intent chính xác và trả trace hợp lệ).
  - **Golden set (36 cases)**: Đạt **36/36 (100%)**, 0 lỗi nghiêm trọng, thời gian trung vị 5ms (chế độ mock kiểm tra luồng LangGraph và công cụ).
  - **Đồng bộ thuật toán (Routing parity)**: Đạt **246/246 ca (100%)** khớp tuyệt đối giữa JS frontend và Python backend.
  - **Hồi quy & tương tác**: 225 tuyến demo cũ và 12 nhóm điều khiển di chuyển đạt 100%.
- Giới hạn: Bản đồ và điểm nước là dữ liệu mô phỏng (`simulated`), chưa có GPS/đo đạc thực địa.

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
