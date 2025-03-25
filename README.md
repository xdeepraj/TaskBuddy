# TuskBuddy (Task management application)

A feature-rich task management application built with React, TypeScript, and Vite. This app integrates Firebase for authentication and Firestore for data storage, while Cloudinary is used for file uploads. The UI is designed with MUI, and the app supports both list and board views with drag-and-drop functionality.

## Features

- **Google Login**: Quick and hassle-free authentication via Firebase.
- **Task Management**: Add, edit, delete tasks individually or in bulk.
- **Bulk Updates**: Change task status & delete for multiple tasks at once.
- **Multiple Views with drag & drop functionality**:
  - **List View**: Traditional task list.
  - **Board View**: Kanban-style board.
- **Filters & Search**:
  - Filter tasks by category and due date.
  - Search tasks by title.
- **Activity Log Tracker**: Keeps track of task updates and modifications.
- **File Uploads**:
  - Supports images, PDFs, MS Word, MS Excel, and text (.txt) files.
  - Files are stored in **Cloudinary**.
- **Smart Date Formatting**:
  - Displays dates as "Today," "Tomorrow," or "Yesterday" for a more intuitive experience.
  - Uses different formats for mobile (`dd/mm/yy`) and desktop (`ddth MMM, yyyy`).
- **Mobile Compatibility**:
  - Fully responsive design.
  - Bulk updates, editing, and deleting are also available on mobile.
  - Optimized date display for mobile devices.

## Technologies Used

- **React (UI library)**
- **TypeScript (Static typing)**
- **Vite (Build tool)**
- **MUI (UI components)**
- **Firebase (Authentication & Firestore)**
- **Cloudinary (File uploads)**
- **@hello-pangea/dnd (Drag & drop functionality)**
- **react-router-dom (Routing)**
- **dayjs (Date formatting)**
- **Tiptap (Rich text editor)**
- **lucide-react (Icons)**
- **@mui/x-date-pickers (Date selection)**

## Live Demo

Check out the hosted version of the application here: **[TaskBuddy](https://task-buddy-lime-three.vercel.app/)**

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (latest LTS recommended)
- **Git** (for cloning the repository)
- **A Firebase Project** with Authentication and Firestore enabled.
- **Cloudinary Account** for file storage.

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-username/task-manager.git
   cd task-manager
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Create a `.env` file in the project root and add the following environment variables:**

   ```sh
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
   ```

4. **Start the development server:**

   ```sh
   npm run dev
   ```

5. **Open your browser and visit** `http://localhost:5173/`.

## Challenges Faced & Solutions Implemented

- **Firebase Storage Payment Requirement**: Initially, Firebase Storage was considered for file uploads, but it required payment information to proceed. To avoid this, I explored various alternatives and ultimately chose Cloudinary. Cloudinary provides a free tier with generous storage and bandwidth limits, easy integration with React, and built-in optimizations for images and other files. This made it the best choice for handling file uploads efficiently.

- **Drag & Drop Functionality**: Initially, I attempted to use `react-dnd` a popular React drag-and-drop library, but it had dependency issues with React 19. After troubleshooting and testing different solutions, I decided to use `@hello-pangea/dnd`, which is actively maintained and compatible with the latest React versions. This allowed me to implement smooth drag-and-drop functionality in the board view without compatibility issues.

- **Bulk Updates with Logs**: Managing bulk updates required careful implementation to ensure accurate tracking. For deleting multiple tasks, I ensured that only selected tasks were deleted and no unintended actions occurred. For status updates, I implemented logging for each individual task update, ensuring that every change was recorded. Additionally, before updating a task’s status, I checked if the new status was different from the current one to prevent unnecessary updates and redundant log entries.

🚀 Happy coding!
