import { useState, useEffect, SetStateAction } from "react";
import { useDropzone } from "react-dropzone";
import {
  Button,
  Typography,
  Stack,
  TextField,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CloseIcon from "@mui/icons-material/Close";

import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Strikethrough } from "lucide-react";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

import { Timestamp } from "firebase/firestore";

import "../App.css";

import { useAuth } from "../context/AuthContext";
import { useTask } from "../context/TaskContext";
import { useActivityLog } from "../context/ActivityLogContext";
import { Task } from "../types/types";

const TaskForm: React.FC = () => {
  const [createTitle, setCreateTitle] = useState<string>("");
  const [createDescription, setCreateDescription] = useState<string>("");
  const [createCategory, setCreateCategory] = useState<string>("");
  const [createDate, setCreateDate] = useState<Dayjs | null>(null);
  const [createStatus, setCreateStatus] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");

  const { user } = useAuth();
  const { openForm, setOpenForm, currentTask, addTask, updateTask } = useTask();
  const { logs, logActivity } = useActivityLog();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeTab, setActiveTab] = useState("Details");

  const handleClose = () => {
    setOpenForm(false);
  };

  // Populate fields for editing
  useEffect(() => {
    if (currentTask) {
      setCreateTitle(currentTask.title);
      setCreateDescription(currentTask.description);
      setCreateCategory(currentTask.category);

      // Check if dueDate is a Firestore Timestamp
      const dueDate: Dayjs | null =
        currentTask.dueDate && "seconds" in currentTask.dueDate
          ? dayjs(currentTask.dueDate.toDate())
          : dayjs.isDayjs(currentTask.dueDate)
          ? currentTask.dueDate
          : null;

      setCreateDate(dueDate);
      setCreateStatus(currentTask.status);
      setSelectedFile(currentTask.attachment || null);
      setFileUrl(currentTask.attachmentUrl || "");
    } else {
      setCreateTitle("");
      setCreateDescription("");
      setCreateCategory("");
      setCreateDate(null);
      setCreateStatus("");
      setSelectedFile(null);
      setFileUrl("");
    }
  }, [currentTask]);

  // Compute missing fields
  const missingFields = [];
  if (!createTitle) missingFields.push("Title");
  if (!createCategory) missingFields.push("Category");
  if (!createDate) missingFields.push("Due Date");
  if (!createStatus) missingFields.push("Status");

  const isCreateDisabled = missingFields.length > 0;

  const handleCreateCategoryChange = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setCreateCategory(event.currentTarget.textContent || "");
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Add description",
      }),
    ],
    content: createDescription || null,
    onUpdate: ({ editor }) => {
      const textContent = editor.getText();
      if (textContent.length <= 300) {
        setCreateDescription(textContent);
      } else {
        editor.commands.setContent(createDescription); // Prevent further input
      }
    },
  });

  // Update editor content when currentTask changes
  useEffect(() => {
    if (editor && currentTask) {
      // Set editor content if currentTask is present
      editor.commands.setContent(currentTask.description || "");
    }
  }, [editor, currentTask]);

  const onDrop = (acceptedFiles: File[]) => {
    setSelectedFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [],
      "application/pdf": [],
      "application/msword": [], // Word (.doc)
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [], // Word (.docx)
      "application/vnd.ms-excel": [], // Excel (.xls)
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [], // Excel (.xlsx)
      "text/plain": [], // Text files (.txt)
    },
  });

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!file) return null;

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      return data.secure_url; // Cloudinary URL for the uploaded file
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };

  const handleCreateTask = async () => {
    // Closing the modal before adding task so that user don't have to wait on the modal
    // it can take some time to upload file in cloudinary & get the link
    handleClose();

    let fileURL: string | null = null;
    if (selectedFile) {
      fileURL = await uploadFile(selectedFile);
    }

    const newTask: Task = {
      title: createTitle,
      description: createDescription,
      category: createCategory,
      dueDate: createDate,
      status: createStatus,
      attachment: "",
      attachmentUrl: fileURL || fileUrl || null,
    };

    if (currentTask) {
      // Collect all changes in one object
      const changes: Record<string, [any, any]> = {};

      Object.keys(newTask).forEach((key) => {
        const field = key as keyof Task;
        let oldValue = currentTask[field];
        const newValue = newTask[field];

        if (field === "dueDate") {
          let oldTimestamp: number | null = null;
          let newTimestamp: number | null = null;

          // Convert old value to timestamp
          if (oldValue instanceof Timestamp) {
            oldTimestamp = oldValue.toMillis();
          } else if (dayjs.isDayjs(oldValue)) {
            oldTimestamp = oldValue.valueOf();
          }

          // Convert new value to timestamp & Firestore Timestamp for storage
          if (dayjs.isDayjs(newValue)) {
            newTimestamp = newValue.valueOf();
          }

          // Compare timestamps
          if (oldTimestamp !== newTimestamp) {
            changes[field] = [oldValue ?? null, newValue ?? null];
          }
        } else if (oldValue !== newValue) {
          changes[field] = [oldValue ?? null, newValue ?? null];
        }
      });

      // Filter out undefined values from changes
      Object.keys(changes).forEach((key) => {
        if (changes[key][0] === undefined || changes[key][1] === undefined) {
          delete changes[key];
        }
      });

      await logActivity(currentTask?.id ?? "", changes, user?.uid ?? "", false);
      updateTask({ ...currentTask, ...newTask });
    } else {
      const taskId = await addTask(newTask);
      if (taskId !== null) {
        await logActivity(taskId, {}, user?.uid ?? "", true);
      }
    }
  };

  const getFilePreview = (fileUrl: string | null) => {
    if (!fileUrl) return null;

    const fileExtension = fileUrl.split(".").pop()?.toLowerCase();
    if (!fileExtension) return null;

    return (
      <Box sx={{ width: "100%", maxWidth: "600px", my: 2 }}>
        {/* Image files */}
        {["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(
          fileExtension
        ) && (
          <img
            src={fileUrl}
            alt="Uploaded Image"
            style={{
              width: "100%",
              maxWidth: "600px",
              height: "auto",
              borderRadius: "5px",
            }}
          />
        )}

        {/* PDF files */}
        {fileExtension === "pdf" && (
          <iframe
            src={fileUrl}
            width="100%"
            height="600px"
            style={{ border: "1px solid gray", borderRadius: "5px" }}
          />
        )}

        {/* Text files (Show content instead of link) */}
        {["txt", "json", "csv"].includes(fileExtension) && (
          <Box
            sx={{
              maxHeight: "200px",
              overflowY: "auto",
              p: 2,
              border: "1px solid #ccc",
              borderRadius: "5px",
              backgroundColor: "#f5f5f5",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "14px",
            }}
          >
            <Typography variant="body2">📄 Text File Preview:</Typography>
            <iframe src={fileUrl} width="100%" height="150px" />
          </Box>
        )}

        {/* Word, Excel, PPT files */}
        {["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(
          fileExtension
        ) && (
          <iframe
            src={`https://docs.google.com/gview?url=${fileUrl}&embedded=true`}
            width="100%"
            height="700px"
            style={{ border: "1px solid gray", borderRadius: "5px" }}
          />
        )}

        {/* Download Link for all files */}
        <Typography variant="body2" sx={{ mt: 1 }}>
          🔗{" "}
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            Download / Open File
          </a>
        </Typography>
      </Box>
    );
  };

  // Function to format the date to "ddth MMM, yy at hh:mm AM/PM or ddth MMM, yy"
  const formatDate = (timestamp: Timestamp, includeTime = true) => {
    const date = timestamp.toDate();
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);

    const suffix = `${day}${["st", "nd", "rd", "th"][(day % 10) - 1] || "th"}`;

    if (!includeTime) {
      // If time is not required, return only the date
      return `${suffix} ${month}, ${year}`;
    }

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${suffix} ${month}, ${year} at ${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const handleTabChange = (tab: SetStateAction<string>) => {
    setActiveTab(tab);
  };

  return (
    <Dialog
      open={openForm}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {currentTask ? "Update Task" : "Create Task"}{" "}
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />
      <DialogContent>
        {isSmallScreen && currentTask && (
          <Stack
            direction="row"
            gap={2}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              mb: 3,
            }}
          >
            <Button
              sx={{
                width: "50%",
                border: "1px solid black",
                backgroundColor:
                  activeTab === "Details" ? "primary.main" : "grey.300",
                color: activeTab === "Details" ? "white" : "black",
              }}
              onClick={() => handleTabChange("Details")}
            >
              Details
            </Button>
            <Button
              sx={{
                width: "50%",
                border: "1px solid black",
                backgroundColor:
                  activeTab === "Activity" ? "primary.main" : "grey.300",
                color: activeTab === "Activity" ? "white" : "black",
              }}
              onClick={() => handleTabChange("Activity")}
            >
              Activity
            </Button>
          </Stack>
        )}
        {/* Render content based on activeTab in mobile view */}
        {isSmallScreen ? (
          activeTab === "Details" ? (
            <Box sx={{ flex: 2 }}>
              <Stack spacing={2}>
                {/* For title */}
                <TextField
                  label="Task Title"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  fullWidth
                  sx={{ backgroundColor: "#f1f1f1" }}
                />

                {/* Description Field using TipTap */}
                <Box
                  sx={{
                    position: "relative",
                    backgroundColor: "#f1f1f1",
                    padding: "8px",
                    borderRadius: "5px",
                    minHeight: "150px",
                    border: "1px solid #d9d9d9",
                    pb: 3,
                    cursor: "text",
                  }}
                  onClick={() => editor?.commands.focus()}
                >
                  <EditorContent editor={editor} />

                  {/* Toolbar positioned at bottom-left */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 1,
                      left: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                    >
                      <Bold size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        editor?.chain().focus().toggleItalic().run()
                      }
                    >
                      <Italic size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        editor?.chain().focus().toggleStrike().run()
                      }
                    >
                      <Strikethrough size={18} />
                    </IconButton>

                    <Divider
                      orientation="vertical"
                      sx={{
                        height: 20,
                        mx: 1,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                      }}
                    />

                    <IconButton
                      size="small"
                      onClick={() =>
                        editor?.chain().focus().toggleBulletList().run()
                      }
                    >
                      <List size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        editor?.chain().focus().toggleOrderedList().run()
                      }
                    >
                      <ListOrdered size={18} />
                    </IconButton>
                  </Box>

                  {/* Character Count Display */}
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      bottom: 5,
                      right: 10,
                      color: "gray",
                      fontSize: "12px",
                    }}
                  >
                    {editor?.getText().length || 0}/300 characters
                  </Typography>
                </Box>

                {/* For category, date, status */}
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  justifyContent="flex-start"
                  gap={2}
                >
                  <Stack direction="column">
                    <Typography>Task Category*</Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      <Button
                        sx={{
                          fontSize: "12px",
                          border: "1px solid black",
                          px: 3,
                        }}
                        onClick={handleCreateCategoryChange}
                        variant={
                          createCategory === "Work" ? "contained" : "outlined"
                        }
                      >
                        Work
                      </Button>
                      <Button
                        sx={{ fontSize: "12px", border: "1px solid black" }}
                        onClick={handleCreateCategoryChange}
                        variant={
                          createCategory === "Personal"
                            ? "contained"
                            : "outlined"
                        }
                      >
                        Personal
                      </Button>
                    </Stack>
                  </Stack>
                  <Stack direction="column">
                    <Typography>Due on*</Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        disablePast
                        value={createDate}
                        onChange={(newValue) => setCreateDate(newValue)}
                        slots={{
                          textField: (params) => (
                            <TextField
                              {...params}
                              size="small"
                              sx={{
                                width: "160px",
                                backgroundColor: "#f1f1f1",
                              }}
                            />
                          ),
                        }}
                      />
                    </LocalizationProvider>
                  </Stack>

                  <Stack direction="column">
                    <Typography>Task Status*</Typography>
                    <FormControl
                      sx={{ width: "170px", backgroundColor: "#f1f1f1" }}
                      size="small"
                    >
                      <Select
                        value={createStatus}
                        onChange={(event) =>
                          setCreateStatus(event.target.value)
                        }
                        displayEmpty
                        renderValue={(selected) =>
                          selected ? (
                            selected
                          ) : (
                            <span style={{ color: "grey" }}>Choose status</span>
                          )
                        }
                      >
                        <MenuItem value="TODO">TODO</MenuItem>
                        <MenuItem value="IN PROGRESS">IN PROGRESS</MenuItem>
                        <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Stack>

                {/* For file upload */}
                <Stack direction="column">
                  <Typography>Attachment</Typography>
                  <Box
                    {...getRootProps()}
                    sx={{
                      border: "1px solid gray",
                      padding: "10px",
                      textAlign: "center",
                      cursor: "pointer",
                      borderRadius: "10px",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <input {...getInputProps()} />
                    <Typography>
                      {selectedFile ? (
                        selectedFile.name
                      ) : (
                        <>
                          Drag & drop file here or{" "}
                          <span
                            style={{
                              color: "blue",
                              textDecoration: "underline",
                            }}
                          >
                            upload from here
                          </span>
                        </>
                      )}
                    </Typography>
                  </Box>

                  {/* Allowed file types message */}
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ mt: 1 }}
                  >
                    Allowed file types: Images (JPG, PNG, GIF), PDFs, Word Docs,
                    Excel Sheets, and Text Files.
                  </Typography>
                </Stack>

                {/* For file view */}
                {currentTask?.attachmentUrl && (
                  <Box mt={2}>
                    <Typography variant="subtitle2">Attached File:</Typography>
                    {getFilePreview(currentTask.attachmentUrl)}
                  </Box>
                )}
              </Stack>
            </Box>
          ) : (
            currentTask && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 2,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 2,
                  minHeight: "665px",
                  border: "1px solid #ddd",
                }}
              >
                {/* First row: Centered heading */}
                <Box
                  sx={{
                    borderBottom: "1px solid #ddd",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "50px",
                  }}
                >
                  <Typography variant="h6">Activity Logs</Typography>
                </Box>

                {/* Second row: Logs container */}
                <Box sx={{ flex: 1, padding: 1, overflowY: "auto" }}>
                  {logs.length > 0 ? (
                    [...logs]
                      .sort(
                        (a, b) =>
                          b.timestamp.toDate().getTime() -
                          a.timestamp.toDate().getTime()
                      )
                      .map((log, index) => (
                        <Box key={index} sx={{ marginBottom: 2 }}>
                          {/* First Row: Formatted Timestamp with Date & Time */}
                          <Typography
                            variant="body2"
                            fontSize={12}
                            fontWeight="bold"
                          >
                            {formatDate(log.timestamp, true)}
                          </Typography>

                          {/* Check if the task was created */}
                          {log.isCreated && (
                            <Typography
                              variant="body2"
                              fontSize={12}
                              sx={{ marginLeft: 2 }}
                            >
                              You created this task.
                            </Typography>
                          )}

                          {/* Second Row: Changes */}
                          {Object.entries(log.changes).map(
                            ([field, value], idx) => {
                              let message = "";
                              if (
                                ["title", "category", "status"].includes(field)
                              ) {
                                // Show field change details for non-date fields
                                const [oldValue, newValue] = value;
                                message = `You changed ${field} from ${oldValue} to ${newValue}.`;
                              } else if (field === "dueDate") {
                                // Use formatDate without time for dueDate field
                                const [oldDate, newDate] = value.map((date) =>
                                  formatDate(date, false)
                                );
                                message = `You changed due date from ${oldDate} to ${newDate}.`;
                              } else if (field === "description") {
                                message = "You changed description.";
                              } else if (field === "attachmentUrl") {
                                message = "You uploaded a file.";
                              }

                              return (
                                <Typography
                                  key={idx}
                                  variant="body2"
                                  fontSize={12}
                                  sx={{ marginLeft: 2 }}
                                >
                                  {message}
                                </Typography>
                              );
                            }
                          )}
                        </Box>
                      ))
                  ) : (
                    <Typography variant="body2">
                      No log available yet.
                    </Typography>
                  )}
                </Box>
              </Box>
            )
          )
        ) : (
          <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
            {/* Left Section - Task Form */}
            <Box sx={{ flex: 2 }}>
              <Stack spacing={2}>
                {/* For title */}
                <TextField
                  label="Task Title"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  fullWidth
                  sx={{ backgroundColor: "#f1f1f1" }}
                />

                {/* Description Field using TipTap */}
                <Box
                  sx={{
                    position: "relative",
                    backgroundColor: "#f1f1f1",
                    padding: "8px",
                    borderRadius: "5px",
                    minHeight: "150px",
                    border: "1px solid #d9d9d9",
                    pb: 3,
                    cursor: "text",
                  }}
                  onClick={() => editor?.commands.focus()}
                >
                  <EditorContent editor={editor} />

                  {/* Toolbar positioned at bottom-left */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 1,
                      left: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                    >
                      <Bold size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        editor?.chain().focus().toggleItalic().run()
                      }
                    >
                      <Italic size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        editor?.chain().focus().toggleStrike().run()
                      }
                    >
                      <Strikethrough size={18} />
                    </IconButton>

                    <Divider
                      orientation="vertical"
                      sx={{
                        height: 20,
                        mx: 1,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                      }}
                    />

                    <IconButton
                      size="small"
                      onClick={() =>
                        editor?.chain().focus().toggleBulletList().run()
                      }
                    >
                      <List size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        editor?.chain().focus().toggleOrderedList().run()
                      }
                    >
                      <ListOrdered size={18} />
                    </IconButton>
                  </Box>

                  {/* Character Count Display */}
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      bottom: 5,
                      right: 10,
                      color: "gray",
                      fontSize: "12px",
                    }}
                  >
                    {editor?.getText().length || 0}/300 characters
                  </Typography>
                </Box>

                {/* For category, date, status */}
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  justifyContent="flex-start"
                  gap={2}
                >
                  <Stack direction="column">
                    <Typography>Task Category*</Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      <Button
                        sx={{
                          fontSize: "12px",
                          border: "1px solid black",
                          px: 3,
                        }}
                        onClick={handleCreateCategoryChange}
                        variant={
                          createCategory === "Work" ? "contained" : "outlined"
                        }
                      >
                        Work
                      </Button>
                      <Button
                        sx={{ fontSize: "12px", border: "1px solid black" }}
                        onClick={handleCreateCategoryChange}
                        variant={
                          createCategory === "Personal"
                            ? "contained"
                            : "outlined"
                        }
                      >
                        Personal
                      </Button>
                    </Stack>
                  </Stack>
                  <Stack direction="column">
                    <Typography>Due on*</Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        disablePast
                        value={createDate}
                        onChange={(newValue) => setCreateDate(newValue)}
                        slots={{
                          textField: (params) => (
                            <TextField
                              {...params}
                              size="small"
                              sx={{
                                width: "180px",
                                backgroundColor: "#f1f1f1",
                              }}
                            />
                          ),
                        }}
                      />
                    </LocalizationProvider>
                  </Stack>

                  <Stack direction="column">
                    <Typography>Task Status*</Typography>
                    <FormControl
                      sx={{ width: "180px", backgroundColor: "#f1f1f1" }}
                      size="small"
                    >
                      <Select
                        value={createStatus}
                        onChange={(event) =>
                          setCreateStatus(event.target.value)
                        }
                        displayEmpty
                        renderValue={(selected) =>
                          selected ? (
                            selected
                          ) : (
                            <span style={{ color: "grey" }}>Choose status</span>
                          )
                        }
                      >
                        <MenuItem
                          value="TODO"
                          sx={{
                            transition: "transform 0.2s, font-size 0.5s",
                            "&:hover": {
                              color: "#EA00FF",
                              backgroundColor: "transparent",
                              transform: "scale(1.1)",
                              fontSize: "16px",
                            },
                          }}
                        >
                          TODO
                        </MenuItem>
                        <MenuItem
                          value="IN PROGRESS"
                          sx={{
                            transition: "transform 0.2s, font-size 0.5s",
                            "&:hover": {
                              color: "#00C6FF",
                              backgroundColor: "transparent",
                              transform: "scale(1.1)",
                              fontSize: "16px",
                            },
                          }}
                        >
                          IN PROGRESS
                        </MenuItem>
                        <MenuItem
                          value="COMPLETED"
                          sx={{
                            transition: "transform 0.2s, font-size 0.5s",
                            "&:hover": {
                              color: "#0AFF00",
                              backgroundColor: "transparent",
                              transform: "scale(1.1)",
                              fontSize: "16px",
                            },
                          }}
                        >
                          COMPLETED
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Stack>

                {/* For file upload */}
                <Stack direction="column">
                  <Typography>Attachment</Typography>
                  <Box
                    {...getRootProps()}
                    sx={{
                      border: "1px solid gray",
                      padding: "10px",
                      textAlign: "center",
                      cursor: "pointer",
                      borderRadius: "10px",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <input {...getInputProps()} />
                    <Typography>
                      {selectedFile ? (
                        selectedFile.name
                      ) : (
                        <>
                          Drag & drop file here or{" "}
                          <span
                            style={{
                              color: "blue",
                              textDecoration: "underline",
                            }}
                          >
                            upload from here
                          </span>
                        </>
                      )}
                    </Typography>
                  </Box>

                  {/* Allowed file types message */}
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ mt: 1 }}
                  >
                    Allowed file types: Images (JPG, PNG, GIF), PDFs, Word Docs,
                    Excel Sheets, and Text Files.
                  </Typography>
                </Stack>

                {/* For file view */}
                {currentTask?.attachmentUrl && (
                  <Box mt={2}>
                    <Typography variant="subtitle2">Attached File:</Typography>
                    {getFilePreview(currentTask.attachmentUrl)}
                  </Box>
                )}
              </Stack>
            </Box>

            <Divider orientation="vertical" flexItem />

            {/* Right Section - Logs (Only when currentTask exists) */}
            {currentTask && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 2,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 2,
                  height: "100%",
                  border: "1px solid #ddd",
                }}
              >
                {/* First row: Centered heading */}
                <Box
                  sx={{
                    borderBottom: "1px solid #ddd",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "50px",
                  }}
                >
                  <Typography variant="h6">Activity Logs</Typography>
                </Box>

                {/* Second row: Logs container */}
                <Box sx={{ flex: 1, padding: 1, overflowY: "auto" }}>
                  {logs.length > 0 ? (
                    [...logs]
                      .sort(
                        (a, b) =>
                          b.timestamp.toDate().getTime() -
                          a.timestamp.toDate().getTime()
                      )
                      .map((log, index) => (
                        <Box key={index} sx={{ marginBottom: 2 }}>
                          {/* First Row: Formatted Timestamp with Date & Time */}
                          <Typography
                            variant="body2"
                            fontSize={12}
                            fontWeight="bold"
                          >
                            {formatDate(log.timestamp, true)}
                          </Typography>

                          {/* Check if the task was created */}
                          {log.isCreated && (
                            <Typography
                              variant="body2"
                              fontSize={12}
                              sx={{ marginLeft: 2 }}
                            >
                              You created this task.
                            </Typography>
                          )}

                          {/* Second Row: Changes */}
                          {Object.entries(log.changes).map(
                            ([field, value], idx) => {
                              let message = "";
                              if (
                                ["title", "category", "status"].includes(field)
                              ) {
                                // Show field change details for non-date fields
                                const [oldValue, newValue] = value;
                                message = `You changed ${field} from ${oldValue} to ${newValue}.`;
                              } else if (field === "dueDate") {
                                // Use formatDate without time for dueDate field
                                const [oldDate, newDate] = value.map((date) =>
                                  formatDate(date, false)
                                );
                                message = `You changed due date from ${oldDate} to ${newDate}.`;
                              } else if (field === "description") {
                                message = "You changed description.";
                              } else if (field === "attachmentUrl") {
                                message = "You uploaded a file.";
                              }

                              return (
                                <Typography
                                  key={idx}
                                  variant="body2"
                                  fontSize={12}
                                  sx={{ marginLeft: 2 }}
                                >
                                  {message}
                                </Typography>
                              );
                            }
                          )}
                        </Box>
                      ))
                  ) : (
                    <Typography variant="body2">
                      No log available yet.
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>

      {(!isSmallScreen || activeTab !== "Activity") && (
        <DialogActions
          sx={{ flexDirection: "column", alignItems: "stretch", gap: 1 }}
        >
          {/* First row: Floating error message aligned to the right */}
          {isCreateDisabled && (
            <Typography
              variant="caption"
              color="error"
              sx={{
                alignSelf: { xs: "center", md: "flex-end" },
                textAlign: { xs: "center", md: "right" },
              }}
            >
              {`**PLEASE PROVIDE: ${missingFields.join(
                ", "
              )} to create a task.`}
            </Typography>
          )}

          {/* Second row: Buttons aligned to the right */}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={handleClose} color="error">
              CANCEL
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateTask}
              disabled={isCreateDisabled}
            >
              {currentTask ? "UPDATE" : "CREATE"}
            </Button>
          </Stack>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default TaskForm;
