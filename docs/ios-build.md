# Nhịp Tập: từ Windows đến iPhone

## Trạng thái

- Mã ứng dụng native: `mobile/` (React Native + Expo SDK 58).
- Đã nâng từ SDK 57 lên SDK 58 để khớp với Expo Go trên iPhone của người dùng.
- Expo MCP: URL chính thức đã khai báo trong `.codex/config.toml` ở gốc dự án.
- Dự án EAS đã liên kết: [@longvy/nhip-tap](https://expo.dev/accounts/longvy/projects/nhip-tap), ID `8e188183-3845-454e-98ca-f992654745b9`.
- Expo CLI đã đăng nhập tài khoản `longvy`; Expo MCP đã xác thực OAuth thành công. Đã tạo IPA chưa ký bằng GitHub Actions; chưa ký hoặc đưa lên TestFlight.
- Người dùng có tài khoản Expo và chưa có Apple Developer.
- Kho nguồn: [longlo2k3/nhipdem](https://github.com/longlo2k3/nhipdem); `mobile/` là submodule trỏ đến [longlo2k3/mobile](https://github.com/longlo2k3/mobile).

## Thử ngay trên iPhone bằng Expo Go

1. Cài **Expo Go** từ App Store trên iPhone.
2. Mở terminal tại thư mục `Training` và chạy `npm run mobile`.
3. Máy Windows và iPhone dùng chung Wi-Fi. Quét mã QR bằng Camera iPhone để mở bằng Expo Go.
4. Nếu kết nối Wi-Fi bị chặn, chạy `npm --prefix mobile run start:tunnel`; Expo có thể yêu cầu cài thành phần tunnel và đăng nhập tài khoản Expo.

Expo Go là môi trường thử ứng dụng. Đây chưa phải bản cài riêng có biểu tượng của bạn.
Nếu Expo Go báo phiên bản SDK không tương thích, kiểm tra SDK mà Expo Go trên điện thoại đang hỗ trợ trước khi nâng cấp.

App dùng thành phần native, gồm chọn ngày, lưu trên thiết bị và chia sẻ/chọn tệp sao lưu. Không cần backend cho nhật ký tập.
Kết quả từ bản web có thể chuyển qua **Lịch sử → Xuất sao lưu**, gửi tệp JSON sang điện thoại, rồi **Lịch sử → Nhập sao lưu** trong app.
Dữ liệu của Expo Go và bản app độc lập không tự chuyển cho nhau; dùng cùng cách xuất/nhập khi chuyển sang bản cài riêng.
Đồng hồ nghỉ tính lại thời gian khi quay lại app, nhưng không phát thông báo nền lúc khóa màn hình.

## Kết nối MCP với tài khoản Expo

MCP phục vụ trợ lý phát triển và quản lý build. Nhật ký tập trên iPhone không cần đăng nhập MCP.

Trong Codex/ChatGPT desktop:

1. Mở lại dự án `Training` để tải cấu hình MCP của dự án đã tin cậy.
2. Vào **Settings → MCP servers**, kiểm tra server **expo** với loại **Streamable HTTP**, URL `https://mcp.expo.dev/mcp`.
3. Nếu server chưa xuất hiện, thêm đúng tên và URL trên. Không cần nhập khóa API.
4. Chọn **Authenticate**, tự đăng nhập Expo trong trình duyệt rồi quay lại app. Chọn **Restart** để kết nối lại nếu cần.
5. Dùng `/mcp` để kiểm tra trạng thái. Chỉ coi đã kết nối khi server báo xác thực thành công.

Nếu đã có Codex CLI, có thể dùng `codex mcp login expo` từ thư mục dự án.
Không lưu mật khẩu hoặc token vào mã nguồn.

Để bật khả năng MCP cục bộ:

```powershell
cd mobile
npx expo login
npm run start:mcp
```

Tài khoản Expo CLI và tài khoản MCP cần giống nhau. Khởi động lại kết nối MCP sau khi bật/tắt dev server.
Khả năng điều khiển iOS Simulator tại máy không dùng được trên Windows; không coi kết nối MCP là có sẵn iOS Simulator.

## Build bản cài iPhone trên dịch vụ EAS

Windows dùng được EAS cloud build; máy chủ macOS của EAS thực hiện bước biên dịch và ký iOS.
Để cài bản riêng lên iPhone qua EAS hoặc dùng TestFlight, cần Apple Developer đang hoạt động và quyền ký ứng dụng.
Hiện chưa có Apple Developer nên EAS chưa tạo được bản cài cho iPhone thật; có thể dùng Expo Go hoặc quy trình IPA chưa ký bên dưới. Không tự mua gói hoặc gửi build tính phí.

Sau khi có tài khoản và chọn đúng dự án:

```powershell
cd mobile
npx eas-cli@latest login
npx eas-cli@latest project:info
npx eas-cli@latest device:create
npm run build:ios
```

- Dự án đã có `extra.eas.projectId`. `project:info` dùng để kiểm tra đúng tài khoản/dự án; không tạo dự án mới.
- `device:create` đăng ký iPhone cho bản phân phối nội bộ.
- Profile `preview` tạo bản cài nội bộ, không phụ thuộc dev server.
- Profile `development` phục vụ dev client tùy biến, cũng cần quyền ký cho thiết bị thật.
- Profile `simulator` tạo bản cho iOS Simulator; không cài tệp đó lên iPhone thật và không chạy Simulator Apple trực tiếp trên Windows.
- Bundle ID hiện là `com.longvi.nhiptap`; kiểm tra quyền sở hữu/tính duy nhất trước build đầu tiên.

Để dùng TestFlight sau khi cấu hình App Store Connect:

```powershell
cd mobile
npm run build:testflight
npx eas-cli@latest submit --platform ios --latest
```

Build production chưa có nghĩa app đã hiện trên TestFlight. Cần submit và chờ Apple xử lý, hoàn tất yêu cầu tuân thủ và cấu hình người thử.

## Tạo IPA chưa ký trên GitHub Actions

Đã build thành công ngày 03/11/2026: [lần chạy 41499341703](https://github.com/longlo2k3/nhipdem/actions/runs/41499341703).
Artifact **NhipTap-unsigned-ipa** chứa IPA đã kiểm tra arm64/iPhoneOS, JavaScript
bundle không rỗng, ZIP hợp lệ và SHA-256. Chưa kiểm tra ký/cài trên iPhone thật.

Workflow `.github/workflows/ios-unsigned.yml` chạy thủ công trên máy macOS tiêu chuẩn
của GitHub. Không cần Apple ID, chứng chỉ ký, token Expo hoặc gói EAS trả phí.
Kho `mobile` là riêng tư. Workflow lấy đúng gitlink bằng một bước checkout riêng,
dùng secret `MOBILE_READONLY_DEPLOY_KEY`. Khóa này chỉ có quyền đọc kho `mobile`;
không dùng token cá nhân và không công khai mã app. Có thể thu hồi trong
**mobile → Settings → Deploy keys**, đồng thời xóa secret tương ứng ở kho `nhipdem`.
Máy build dùng `macos-26-intel` để tránh hàng đợi arm64 đang thiếu công suất.

1. Mở [Build iPhone IPA (unsigned)](https://github.com/longlo2k3/nhipdem/actions/workflows/ios-unsigned.yml).
2. Chọn **Run workflow**, nhánh `main`, rồi **Run workflow**.
3. Chờ tác vụ thành công. Trong mục **Artifacts**, tải **NhipTap-unsigned-ipa**.
4. Giải nén ZIP tải về để lấy **NhipTap-unsigned.ipa** và tệp kiểm tra SHA-256.
5. Dùng **AltStore Classic / AltServer** trên Windows để ký và cài IPA bằng Apple ID miễn phí.

Đây là bản Release cho iPhone thật, có JavaScript đóng gói sẵn để chạy khi máy tính
tắt. IPA chưa ký không cài trực tiếp bằng Safari và không dùng cho TestFlight.
Apple ID miễn phí cần gia hạn chữ ký mỗi 7 ngày; kiểm tra khả năng cài và các quyền
native trên iPhone trước khi coi là hoàn tất. Xuất sao lưu trước khi chuyển từ Expo Go.

Workflow chỉ tải artifact khi có app arm64 cho iPhoneOS, JavaScript bundle không
rỗng và IPA hợp lệ. Log Xcode được lưu riêng để chẩn đoán nếu biên dịch thất bại.
Build lấy đúng commit của submodule `mobile` đang được kho gốc ghi nhận. Khi đổi mã
app, cần đẩy commit lên kho `mobile` và cập nhật gitlink trong kho gốc trước khi build.

## Chạy build qua MCP

- `build_list`, `build_info`, `build_logs`: xem build và chẩn đoán lỗi.
- `build_run`: gọi profile trong `eas.json`. Theo tài liệu hiện hành, dự án EAS phải liên kết GitHub để chạy từ MCP.
- Nếu kho GitHub đặt app trong thư mục con, cấu hình thư mục ứng dụng là `mobile` trong phần GitHub integration của EAS.
- Người dùng đã chọn repo `longlo2k3/nhipdem`; chưa xác nhận liên kết GitHub integration của EAS.
- Nếu chưa liên kết GitHub, dùng EAS CLI để gửi mã từ thư mục `mobile` lên EAS khi người dùng sẵn sàng.
- Trước thao tác tính phí, kiểm tra gói/quota và giới hạn chi phí được người dùng duyệt.

## Nguồn chính thức

- [Khởi tạo Expo và SDK cho Expo Go](https://docs.expo.dev/get-started/create-a-project/)
- [Expo MCP, OAuth và các công cụ build](https://docs.expo.dev/mcp/)
- [Tạo bản build và điều kiện tài khoản Apple](https://docs.expo.dev/build/setup/)
- [EAS Submit cho iOS từ Windows](https://docs.expo.dev/submit/ios/)
- [Cấu hình và xác thực MCP của Codex](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)
