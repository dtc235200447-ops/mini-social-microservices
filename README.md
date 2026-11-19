# 🌸 Vibe Mini - Microservices Cloud Project

> Đồ án môn học Điện toán đám mây | Công nghệ thông tin và truyền thông
> Tác giả: Dương Thị Hoài Linh

## 📄 Báo cáo
[Báo cáo đồ án] https://docs.google.com/document/d/1FHytB99HhAXgqNrkZPvqhP8d4IoltKQAO65jXIqp9js/edit?tab=t.0

## 📖 Giới thiệu
**Vibe Mini** là một mạng xã hội thu nhỏ được xây dựng dựa trên kiến trúc **Microservices**. Dự án tập trung vào việc áp dụng các kỹ thuật lập trình phân tán, xử lý bất đồng bộ qua Message Queue và triển khai container hóa.

Khác với các mạng xã hội truyền thống, Vibe Mini mang đến trải nghiệm **User Interface (UI) tươi sáng, nhẹ nhàng theo phong cách Pastel Pink & Soft Glassmorphism** cùng nhiều hiệu ứng chuyển động mượt mà, thân thiện với người dùng.

## 🛠 Tech Stack

### Frontend (Client)
- **Core:** React (Vite), JavaScript (ES6+).
- **Styling:** Tailwind CSS (v4), Pastel Pink & Soft Glassmorphism UI.
- **Animation:** Framer Motion (Page transitions, Micro-interactions).
- **State Management:** React Query & Context API.

### Backend (Microservices)
- **Gateway:** Express Gateway (Proxy & Auth Middleware).
- **Services:**
  - `User Service`: Quản lý xác thực (JWT), thông tin người dùng.
  - `Post Service`: Quản lý bài đăng, media.
  - `Feed Service`: Tối ưu hóa việc hiển thị News Feed (Read-heavy).
  - `Comment Service`: Quản lý bình luận.
- **Communication:** REST API (Synchronous) & RabbitMQ (Asynchronous Event-driven).

### Infrastructure & Database
- **Database:** PostgreSQL (mỗi service 1 DB riêng biệt).
- **Message Broker:** RabbitMQ.
- **Containerization:** Docker & Docker Compose.

## 🏗 Kiến trúc hệ thống
Luồng dữ liệu cơ bản:
1.  **Client** gửi request đến **API Gateway**.
2.  **Gateway** xác thực JWT, điều hướng đến Service tương ứng.
3.  Khi có thay đổi dữ liệu (ví dụ: Tạo bài viết mới), **Post Service** bắn sự kiện `POST_CREATED` vào **RabbitMQ**.
4.  **Feed Service** lắng nghe sự kiện, cập nhật cache/database riêng để user load Feed nhanh nhất.

## 🚀 Cài đặt & Chạy dự án

### Yêu cầu
- Docker & Docker Desktop đã được cài đặt.
- Node.js (v20+) (nếu muốn chạy local).

### Khởi chạy (Docker)
Tạo file cấu hình cục bộ từ template, thay các placeholder bằng giá trị thật, sau đó chạy Docker Compose:

```bash
cp .env.example .env
docker compose --env-file .env up --build

```

## 📁 Cấu trúc thư mục

```text
.
├── backend/
│   ├── api-gateway/      # Cổng vào duy nhất
│   ├── comment-service/  # Comments management
│   ├── feed-service/     # News Feed aggregation
│   ├── notification-service/ # Notifications
│   ├── post-service/     # Content creation
│   └── user-service/     # Auth & Profile
├── frontend/             # React Application (Vibe Mini UI)
└── docker-compose.yml    # Orchestration config
```