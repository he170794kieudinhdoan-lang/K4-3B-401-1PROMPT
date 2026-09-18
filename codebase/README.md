# Vmap — Hướng dẫn cài đặt và chạy ứng dụng

Vmap hỗ trợ học viên tìm kiếm **điểm nước uống gần nhất đang sử dụng được** từ vị trí hiện tại trong khuôn viên campus VinUni, kèm theo chỉ đường đi bộ và trợ lý AI thông minh.

Giao diện ứng dụng được thiết kế theo phong cách hiện đại chia 2 cột:
- **Bên trái (chiếm phần lớn)**: Bản đồ campus trực quan và sơ đồ trong nhà (Tòa E), hiển thị vị trí người dùng và lộ trình đi bộ.
- **Bên phải**: Bảng điều khiển hành trình và khung chat trò chuyện với Trợ lý AI (lưu lịch sử hội thoại liên tục).

---

## 1. Cấu trúc thư mục `codebase/`

| Tệp tin | Vai trò |
| :--- | :--- |
| **`demo.html`** | Giao diện web chính của ứng dụng Vmap. |
| **`campus-app.js`** | Xử lý logic giao diện, tương tác bản đồ, điều khiển mô phỏng di chuyển và kết nối Trợ lý AI. |
| **`campus-map.js`** | Render đồ họa SVG toàn cảnh campus VinUni và mặt bằng từng tầng Tòa E. |
| **`campus.css`** | Định dạng giao diện 2 cột (`split-layout`), responsive trên cả điện thoại và máy tính. |
| **`campus-data.json`** | Dữ liệu mô phỏng mạng lưới đường đi, điểm nước, các mốc địa điểm và tòa nhà. |
| **`navigation.js`** | Thuật toán định tuyến tìm đường ngắn nhất, ưu tiên mái che, tránh mưa. |
| **`index.html`** | Trang điều hướng mặc định chuyển sang `demo.html`. |
| **`*.test.cjs`** | Bộ kiểm thử tự động cho thuật toán và logic giao diện phía frontend. |

---

## 2. Yêu cầu môi trường

- **Python**: Phiên bản 3.10 trở lên (dùng chạy backend FastAPI & LangGraph AI Agent).
- **Node.js**: Phiên bản 18 trở lên (dùng chạy bộ test frontend).
- **Trình duyệt**: Chrome, Brave, Edge, Safari hoặc Firefox phiên bản mới.

---

## 3. Các bước cài đặt và khởi chạy

### Bước 1: Chuẩn bị môi trường Python

Mở terminal tại thư mục gốc của dự án (`K4-3B-402-1PROMPT`):

```bash
# Tạo môi trường ảo
python3 -m venv .venv

# Kích hoạt môi trường ảo
# Trên Linux / macOS:
source .venv/bin/activate
# Trên Windows:
# .venv\Scripts\activate

# Cài đặt các thư viện cần thiết
pip install -r requirements.txt
```

### Bước 2: Khởi chạy máy chủ Backend & Frontend

FastAPI đóng vai trò phục vụ cả API trợ lý `/api/agent` lẫn file giao diện tĩnh trong `codebase/`. Bạn có thể chọn 1 trong 2 chế độ:

#### Cách 1: Chế độ Thử nghiệm Mock (Không cần API Key)
Chế độ này dùng kịch bản phân tích quy chuẩn để phản hồi ý định người dùng ngay lập tức:

```bash
VMAP_AGENT_MODE=mock python3 -m uvicorn backend.app:app --host 127.0.0.1 --port 4173
```

#### Cách 2: Chế độ AI Thật (Kết nối qua 9router hoặc OpenAI Endpoint)
Chế độ này kết nối trực tiếp với model AI qua proxy cục bộ:

```bash
python3 -m backend.run_live --model Test --port 4173
```
*(Có thể truyền thêm cấu hình qua biến môi trường `VMAP_MODEL_BASE_URL`, `VMAP_MODEL_API_KEY` nếu cần).*

---

### Bước 3: Mở ứng dụng trên trình duyệt

Truy cập đường dẫn sau trên trình duyệt:

👉 **[http://127.0.0.1:4173/demo.html](http://127.0.0.1:4173/demo.html)**

> ⚠️ **Lưu ý quan trọng**: Không mở trực tiếp file bằng cách nhấp đúp hoặc qua giao thức `file://` vì trình duyệt sẽ chặn tính năng nạp dữ liệu bản đồ (`fetch campus-data.json`) và gọi API trợ lý.

---

## 4. Hướng dẫn sử dụng và trải nghiệm luồng chính

1. **Chọn vị trí xuất phát**:
   - Tại mục **"Bạn đang ở đâu?"** ở bảng bên phải, chọn một mốc xuất phát (ví dụ: *Cổng Tây*, *Sân trung tâm*, *Cổng Nam*).
   - Biểu tượng vị trí người dùng sẽ xuất hiện tương ứng trên bản đồ.

2. **Thiết lập hành trình**:
   - Chọn điểm đến: *Điểm nước gần nhất* hoặc *Cửa tòa D* (có tùy chọn ghé lấy nước).
   - Chọn điều kiện thời tiết (*Đang mưa* / *Không mưa*) và ưu tiên đường đi (*Ngắn nhất* / *Ưu tiên mái che* / *Chỉ trong nhà*).
   - Bấm nút **"Bắt đầu chỉ đường ↗"**.

3. **Mô phỏng di chuyển**:
   - Nhấn và **giữ nút "↑ Giữ Đi tiếp"** (hoặc phím mũi tên `↑` trên bàn phím) để nhân vật di chuyển từng bước dọc tuyến đường. Thả nút để dừng lại.
   - Nhấn giữ **"↓ Quay lại"** (hoặc phím `↓`) nếu muốn lùi bước.
   - Khi tới cửa tòa hoặc cầu thang, màn hình sẽ hiển thị nút xác nhận để chuyển tầng tương ứng.

4. **Trò chuyện với Trợ lý Vmap**:
   - Sử dụng ô nhập ở đáy bảng bên phải để hỏi bằng câu nói tự nhiên (ví dụ: *"Trời đang mưa, tìm chỗ lấy nước giúp tôi"* hoặc *"Giờ đi đâu tiếp?"*).
   - Có thể bấm các phím gợi ý nhanh: `💧 Tìm nước`, `🧭 Đi đâu tiếp?`, `⚠ Báo hỏng`.
   - Toàn bộ lịch sử trao đổi được lưu lại đầy đủ, không bị biến mất khi gửi câu mới.

---

## 5. Chạy bộ kiểm thử (Automated Tests)

Để đảm bảo toàn bộ thuật toán điều hướng và hệ thống hoạt động chính xác theo chuẩn quy định:

```bash
# 1. Kiểm thử logic giao diện và các màn hình demo
node codebase/demo.test.cjs

# 2. Kiểm thử tương tác bản đồ, di chuyển, chuyển tầng và xử lý sự cố
node codebase/campus.test.cjs

# 3. Kiểm thử thuật toán tìm đường (tránh mưa, mái che, ghé lấy nước)
node codebase/navigation.test.cjs

# 4. Kiểm thử tính nhất quán định tuyến giữa frontend và backend
node codebase/routing-parity.test.cjs

# 5. Kiểm thử toàn diện Backend AI Agent (LangGraph)
python3 -m pytest backend/test_agent.py
```

---

## 6. Quy ước nghiệp vụ (Theo `AGENTS.md`)

- **Không tách riêng "nước uống" và "refill"**: Mọi điểm nước trong trường đều được coi là có thể uống trực tiếp hoặc đổ đầy bình cá nhân.
- **Tính toán xác định**: AI chỉ làm nhiệm vụ thấu hiểu câu nói và trích xuất ý định của người dùng; khoảng cách, tính khả dụng và tuyến đường luôn do thuật toán đồ thị cục bộ tính toán chính xác, tuyệt đối không để AI tự suy đoán.
- **Dữ liệu minh bạch**: Toàn bộ tọa độ, sơ đồ và tình trạng điểm nước hiện tại là dữ liệu mô phỏng phục vụ đánh giá tính khả thi giải pháp (CP2/CP3).
