# Bản đồ campus và trong nhà

Chạy FastAPI để phục vụ cả API agent và giao diện. Hướng dẫn đầy đủ: [run-agent.md](../docs/run-agent.md). Static server chỉ dùng thử chỉ đường thủ công; mở trực tiếp bằng `file://` không hỗ trợ nạp dữ liệu/API.

## Luồng dùng thử

1. Chọn và xác nhận mốc xuất phát; hình người xanh biểu diễn vị trí mô phỏng.
2. Chọn tìm nước hoặc tới tòa D; có thể ghé lấy nước trên đường tới D. Chọn ưu tiên mái che hoặc ràng buộc chỉ trong nhà.
3. Bấm **Bắt đầu**; nhân vật chưa tự chạy. Giữ **Đi tiếp** để đi nhỏ dọc tuyến, thả để dừng. Giữ **Quay lại** để lùi. Trên máy tính có thể giữ ↑/↓ khi không nhập chat.
4. Mở chat để hỏi “Giờ đi đâu tiếp?” hoặc đổi đích. Mở chat dừng nhân vật; backend LangGraph xử lý công cụ. Chế độ mock được ghi rõ, không đồng nghĩa gọi model thật.
5. Tới cửa tòa E, xác nhận vào tòa; bản đồ chuyển sang tầng 1.
6. Tới cầu thang, xác nhận lên tầng; sau đó giữ Đi tiếp mới đi tiếp. Đến điểm ghé nước cần xác nhận đã lấy nước.
7. Thử xem tầng khác: thao tác này chỉ đổi góc xem, không di chuyển người dùng. Nút **Xem vị trí tôi** quay về đúng tầng.
8. Báo máy nước không hoạt động và xác nhận điểm cụ thể; hệ thống loại trong phiên. Đổi tuyến từ vị trí giữa đường không kéo nhân vật về mốc đầu. Dừng dẫn đường giữ vị trí và điểm đã báo hỏng.

## Phạm vi và nguồn

- Bố cục campus được vẽ tham chiếu `docs/images_map/image.png` do người dùng cung cấp; chưa có dữ liệu tọa độ địa lý hay tỷ lệ khoảng cách được hiệu chỉnh.
- Toàn bộ đường đi, cửa tòa, mặt bằng tầng, máy nước và trạng thái khả dụng là giả lập. Không sử dụng để chỉ đường thực tế.
- Chỉ tòa E có mặt bằng mô phỏng tầng 1 và 2. Các tòa khác hiển thị trên toàn cảnh; bấm vào sẽ thông báo chưa có mặt bằng.
- Có nhiều điểm nước mẫu để kiểm tra chọn gần nhất và ghé nước trước khi tới D. Chưa thể chứng minh “gần nhất toàn trường” bằng dữ liệu mô phỏng.
- Mọi điểm nước đều hỗ trợ refill; không chia loại hoặc có bộ lọc refill.
- Agent dùng LangGraph và công cụ tính tuyến xác định. Chế độ mock phân tích bằng kịch bản; live cần cấu hình provider phía server và bằng chứng gọi thật. Chưa có GPS hoặc thu âm thật; không tự coi CP3 hoàn thành từ test mock.
- `demo.js`, `demo.css` và `DEMO.md` lưu bản demo trước. Trang `demo.html` hiện sử dụng `campus-map.js`, `campus-app.js`, `campus.css`.

## Kiểm thử

```bash
node codebase/campus.test.cjs
node codebase/demo.test.cjs
node codebase/navigation.test.cjs
python3 -m pytest backend/test_agent.py
```

Để thay bằng dữ liệu thực, cần xác minh cửa vào, các đoạn đường được đi, mái che, sơ đồ từng tầng và vị trí máy nước. `campus-data.json` là dữ liệu chung cho backend, thuật toán và hình vẽ; không chỉ di chuyển ghim độc lập với mạng đường. Khoảng cách chưa hiệu chỉnh không được hiển thị thành mét/phút thật.
