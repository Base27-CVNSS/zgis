# ZGIS — Giao diện ví Zcash bằng tiếng Việt

Đây là **bản trình diễn UI/UX** cho repository \`Base27-CVNSS/zgis\`, bổ sung bên cạnh ứng dụng ví **Zkool (Flutter + Rust)** hiện hữu. Các chức năng ví gốc vẫn nằm trong \`lib/\` và \`rust/\`; không bị thay thế hoặc thay đổi bởi giao diện web.

## Chạy giao diện

- **Trên máy tính**: mở \`index.html\` bằng trình duyệt hiện đại.
- **Máy chủ tĩnh**: tại thư mục gốc của repository chạy \`python -m http.server 8080\`, mở \`http://localhost:8080/\`.
- **GitHub Pages**: vào Settings → Pages của repository, chọn Deploy from a branch, Branch \`main\`, Folder \`/(root)\`, Save. Sau khi GitHub xác nhận triển khai, địa chỉ dự kiến là \`https://base27-cvnss.github.io/zgis/\`. Việc bật Pages phải được thực hiện từ tài khoản có quyền và không được coi là đang hoạt động chỉ vì đã có HTML.

Không cần build Flutter, Rust, Node.js hoặc cài phụ thuộc để xem bản giao diện tĩnh.

## Các màn hình được thiết kế

1. **Tổng quan**: tổng số dư mẫu, tách nhóm được bảo vệ/công khai, biểu đồ phân bổ, bảng giao dịch mẫu.
2. **Gửi ZEC**: nhập địa chỉ, số lượng, ghi chú, kiểm tra định dạng cơ bản, mở bản xem trước **không thể phát giao dịch**.
3. **Nhận ZEC**: lựa chọn nhóm địa chỉ và nội dung giải thích; cố ý **không tạo hoặc sao chép địa chỉ ví giả**.
4. **Lịch sử giao dịch**: tìm kiếm, lọc gửi/nhận, xuất CSV hoàn toàn **dữ liệu mẫu**.
5. **Sổ địa chỉ**: các liên hệ minh họa, không sử dụng địa chỉ thực.
6. **Cài đặt & bảo mật**: đổi chế độ sáng/tối, ẩn số dư, giảm chuyển động; lựa chọn giao diện được lưu **cục bộ trong trình duyệt**.

## Phạm vi an toàn

- Không gọi máy chủ, blockchain RPC, lightwalletd, hoặc API bên thứ ba.
- Không hiển thị khóa, không yêu cầu seed phrase, private key, mật khẩu.
- Không có chức năng kết nối ví, ký, phát sóng, rút tiền, nạp tiền hoặc QR nhận thật.
- Không khẳng định kết nối mạng thành công.
- Mọi giao dịch, số dư, biểu đồ, liên hệ được tạo sẵn và được ghi rõ là minh họa.
- Toàn bộ CSS và JavaScript được lưu kèm; không dùng CDN, không gửi dữ liệu ra bên ngoài.
- Không sao chép dữ liệu địa chỉ/số dư từ ảnh tham khảo của người sử dụng vào repository.

## Lộ trình kết nối ví thật

Chỉ nên triển khai sau khi có thiết kế bảo mật, kiểm toán giao diện và kiểm thử tích hợp:

\`Giao diện web → API đọc chỉ cho phép → dịch vụ trung gian xác thực → lớp ứng dụng Zkool / lõi Rust → mạng Zcash\`.

Các chức năng nhạy cảm như tạo khóa, giải mã seed, ký giao dịch **không được đặt trực tiếp trong frontend web tĩnh**. Nếu cần điều khiển ví, nên dùng một kênh được xác thực mạnh trên máy cục bộ, phân quyền, kiểm tra địa chỉ và hiển thị xác nhận độc lập từ ví.

**Không được gửi ZEC vào bất kỳ chuỗi hiển thị trong bản demo này.**