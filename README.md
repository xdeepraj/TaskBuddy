# Task Manager

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

## Live Demo

Check out the hosted version of the application here: **[Task Manager](https://task-buddy-lime-three.vercel.app/)**

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

## Next Steps

## Challenges Faced & Solutions Implemented

- **Firebase Storage Payment Requirement**: Firebase Storage required payment information to proceed, so Cloudinary was used instead for file uploads.
- **Drag & Drop Functionality**: Implemented using `@hello-pangea/dnd` to allow smooth movement of tasks within the board view.
- **Bulk Updates with Logs**: Since multiple actions can occur at the same time, logs are structured to capture each change with precise timestamps, ensuring accurate tracking.

🚀 Happy coding!
