# Vmap — demo tương tác

Mở `demo.html` trực tiếp bằng trình duyệt. `index.html` tự chuyển sang bản mới; giao diện cũ vẫn được giữ trong file đó.

Không cần cài thư viện, API key hay backend. Font Google là tài nguyên tùy chọn; khi mất mạng dùng font hệ thống. Bản đồ SVG, hình minh họa và logic nằm trong repo.

## Kịch bản trình diễn

1. Bấm **Tìm nước gần tôi**. Chọn **Sân trung tâm** và xác nhận.
2. Bấm micro: demo hiện câu nói mẫu, sau đó bấm **Tìm điểm nước**.
3. Chọn điểm A. Xem thông tin rồi **Bắt đầu chỉ đường**.
4. Bấm **Đi tiếp một chặng**: chấm xanh di chuyển theo đường, quãng đường còn lại giảm.
5. Đến nơi, xác nhận đã lấy nước và đánh giá.
6. Thử lại từ **Lối vào thư viện**: điểm B được xếp đầu. Từ **Khu học tập phía đông**, điểm C được xếp đầu; chọn **Có refill bình** thì C bị loại.
7. Thử báo điểm nước không dùng được: điểm đó bị loại trong lượt demo, gợi ý tính lại từ vị trí đang đứng nếu báo khi đang đi hoặc đã đến.

Nhánh khác: **Tôi không rõ mình đang ở đâu** để chọn mốc; nhập yêu cầu ngoài phạm vi để nhận câu hỏi lại; báo tất cả điểm không hoạt động để xem trạng thái không có kết quả.

## Giới hạn

- Mọi vị trí, sơ đồ, khoảng cách, giờ mở cửa và trạng thái là dữ liệu giả lập. Đây không phải bản đồ VinUni đã xác minh.
- Không thu âm, không lấy GPS, không gọi AI, không gửi phản hồi lên server.
- Tuyến đường dùng đường đi ngắn nhất trên mạng lối đi mẫu, không vẽ đường thẳng xuyên các tòa nhà.
- Trạng thái chỉ giữ trong bộ nhớ của trang; tải lại hoặc bắt đầu lượt mới sẽ khởi tạo lại.
- Giao diện có bố cục desktop/mobile; chưa được xác nhận bằng kiểm tra trình duyệt trong môi trường hiện tại.

Kiểm tra logic: `node codebase/demo.test.cjs` từ thư mục repo.
