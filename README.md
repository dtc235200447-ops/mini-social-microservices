# ☁️ OmniSocial - Microservices Cloud Project

> Đồ án môn học Điện toán đám mây | Học viện Công nghệ Bưu chính Viễn thông (PTIT)
> Tác giả: Nguyễn Khắc Bảo-N22DCCN006 X Nguyễn Chí Hiếu-N22DCCN079

## 📄 Báo cáo
[Báo cáo đồ án](https://docs.google.com/document/d/1tp6U1Whrb6y0G63zJf2P249p3XzsuBPt/edit?usp=sharing&ouid=103131779567105929050&rtpof=true&sd=true)

## 📖 Giới thiệu
**OmniSocial** là một mạng xã hội thu nhỏ được xây dựng dựa trên kiến trúc **Microservices**. Dự án tập trung vào việc áp dụng các kỹ thuật lập trình phân tán, xử lý bất đồng bộ qua Message Queue và triển khai container hóa.

Khác với các mạng xã hội truyền thống tối ưu cho hàng tỷ người dùng với giao diện tối giản, OmniSocial hướng tới trải nghiệm **User Interface (UI) hiện đại, đậm chất tương lai (Futuristic/Glassmorphism)** với nhiều hiệu ứng chuyển động mượt mà.

## 🛠 Tech Stack

### Frontend (Client)
* **Core:** React (Vite), JavaScript (ES6+).
* **Styling:** Tailwind CSS (v4), Glassmorphism UI.
* **Animation:** Framer Motion (Page transitions, Micro-interactions).
* **State Management:** React Query & Context API.

### Backend (Microservices)
* **Gateway:** Express Gateway (Proxy & Auth Middleware).
* **Services:**
    * `User Service`: Quản lý xác thực (JWT), thông tin người dùng.
    * `Post Service`: Quản lý bài đăng, media.
    * `Feed Service`: Tối ưu hóa việc hiển thị News Feed (Read-heavy).
    * `Comment Service`: Quản lý bình luận.
* **Communication:** REST API (Synchronous) & RabbitMQ (Asynchronous Event-driven).

### Infrastructure & Database
* **Database:** PostgreSQL (mỗi service 1 DB riêng biệt).
* **Message Broker:** RabbitMQ.
* **Containerization:** Docker & Docker Compose.

## 🏗 Kiến trúc hệ thống
Luồng dữ liệu cơ bản:
1.  **Client** gửi request đến **API Gateway**.
2.  **Gateway** xác thực JWT, điều hướng đến Service tương ứng.
3.  Khi có thay đổi dữ liệu (ví dụ: Tạo bài viết mới), **Post Service** bắn sự kiện `POST_CREATED` vào **RabbitMQ**.
4.  **Feed Service** lắng nghe sự kiện, cập nhật cache/database riêng để user load Feed nhanh nhất.

## 🚀 Cài đặt & Chạy dự án

### Yêu cầu
* Docker & Docker Desktop đã được cài đặt.
* Node.js (v20+) (nếu muốn chạy local).

### Khởi chạy (Docker)
Tạo file cấu hình cục bộ từ template, thay các placeholder bằng giá trị thật, sau đó chạy Docker Compose:

```bash
cp .env.example .env
docker compose --env-file .env up --build
```

Truy cập trang web tại: http://localhost:5173

## 🔐 Bảo mật cấu hình

Không commit `.env`, `gcs-key.json`, Google service account key, database password, JWT secret, RabbitMQ password hoặc Cloud project credential vào repo. Các giá trị nhạy cảm phải nằm trong `.env` cục bộ, GitHub Actions/Cloud Run secrets, hoặc secret manager tương ứng.

Nếu credential đã từng bị push lên GitHub, cần xử lý bên ngoài codebase:

1. Revoke hoặc rotate Google service account key đang nằm trong `gcs-key.json`.
2. Đổi mật khẩu Cloud SQL/PostgreSQL và RabbitMQ.
3. Đổi `JWT_SECRET` để vô hiệu hóa token cũ.
4. Xóa secret khỏi lịch sử git bằng `git filter-repo` hoặc BFG, rồi force-push repo đã làm sạch nếu thật sự cần giữ repo public.
5. Kiểm tra lại GitHub Actions, Cloud Run, Vercel và Docker registry để bảo đảm chỉ dùng secret mới.

## 📁 Cấu trúc thư mục

```text
.
├── backend/
│   ├── api-gateway/      # Cổng vào duy nhất
│   ├── user-service/     # Auth & Profile
│   ├── post-service/     # Content creation
│   └── feed-service/     # News Feed aggregation
├── frontend/             # React Application
└── docker-compose.yml    # Orchestration config
```
