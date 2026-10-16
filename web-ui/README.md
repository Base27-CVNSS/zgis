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

## Khôi phục ví cũ: HEX, WIF, Sweep và Restore (2026)

Giao diện công khai bổ sung menu **Khôi phục & Quét WIF** (\`#khoi-phuc\`) với phần giải thích, quy trình khôi phục và trình chọn dạng chứng thực. **Không có ô nhập khóa bí mật trên GitHub Pages**.

File \`tools/zcash-recovery-offline.html\` là công cụ chuyển đổi khóa thực, độc lập (không tải thư viện ngoài). Sau khi tải về, kiểm tra nguồn, ngắt kết nối mạng và mở qua \`file://\` trên máy tin cậy:
- HEX 32 byte ⇄ WIF Mainnet \`0x80\`, lựa chọn biểu diễn nén (\`K/L\`) / không nén (\`5\`).
- Decode Base58Check, xác minh SHA-256 hai lần / 4 byte checksum, độ dài, cờ \`0x01\` và miền vô hướng secp256k1.
- Không làm nhầm **đổi WIF** với **chuyển ZEC**. Không suy ra địa chỉ t1; xác minh địa chỉ bằng ví đáng tin trước khi quét. Không hỗ trợ seed, xprv, khóa shielded trong bộ chuyển đổi.
- Tab Sweep trình bày checklist an toàn, Restore giải thích đường khôi phục theo loại khóa. **Không ký, không chuyển tiền, không đọc UTXO, không có RPC**.
- Khi HTML được phục vụ qua \`http:\` hoặc \`https:\`, ô nhập khóa và nút chuyển đổi bị vô hiệu hóa. Chỉ mở nhập ở \`file://\`; cả trong trường hợp này, người dùng phải tự ngắt mạng.
- Tự kiểm tra WIF với secret thử nghiệm = 1 (không dùng làm khóa lưu tiền), phát hiện checksum sai.
- Dữ liệu khóa không ghi vào \`localStorage\`, \`sessionStorage\`, URL, cookies hoặc gửi qua network; CSP chặn \`connect-src\`. DOM được xóa khi trang ẩn/đóng và theo nút xóa, nhưng JavaScript không thể bảo đảm xóa sạch bộ nhớ trình duyệt/clipboard.
- Không coi mã HTML này là thư viện mật mã đã kiểm toán. Bản dựng cho người dùng thực cần đánh giá bảo mật độc lập và xác minh tích hợp phiên bản Zkool được hỗ trợ.

Nguồn đối chiếu: [Zcash ZEWIF](https://github.com/zcash/zewif), [Zkool](https://github.com/hhanh00/zkool2), [hướng dẫn Restore](https://hhanh00.github.io/zkool2/guide/accounts.html) và [zcashd end-of-life](https://z.cash/support/zcashd-deprecation/).
