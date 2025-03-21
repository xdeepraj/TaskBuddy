import { useState } from "react";
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
} from "@mui/material";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { useEditor, EditorContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Strikethrough } from "lucide-react";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

import "../App.css";

import { useTask } from "../context/TaskContext";

interface Task {
  title: string;
  description: string;
  category: string;
  dueDate: Dayjs | null;
  status: string;
  attachment: File | null;
}

interface TaskFormProps {
  open: boolean;
  handleClose: () => void;
}

// const TaskForm = () => {
const TaskForm: React.FC<TaskFormProps> = ({ open, handleClose }) => {
  const [createTitle, setCreateTitle] = useState<string>("");
  const [createDescription, setCreateDescription] = useState<string>("");
  const [createCategory, setCreateCategory] = useState<string>("");
  const [createDate, setCreateDate] = useState<Dayjs | null>(null);
  const [createStatus, setCreateStatus] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { addTask } = useTask();

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

  const onDrop = (acceptedFiles: File[]) => {
    setSelectedFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [], "application/pdf": [] },
  });

  const handleCreateTask = () => {
    const newTask: Task = {
      title: createTitle,
      description: createDescription,
      category: createCategory,
      dueDate: createDate,
      status: createStatus,
      attachment: selectedFile,
    };

    addTask(newTask); // Store task in context
    handleClose(); // Close the modal after adding task

    // Reset fields after adding task
    setCreateTitle("");
    setCreateDescription("");
    setCreateCategory("");
    setCreateDate(null);
    setCreateStatus("");
    setSelectedFile(null);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}
    >
      <DialogTitle>Create Task</DialogTitle>

      <Divider />
      <DialogContent>
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
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
                <Italic size={18} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => editor?.chain().focus().toggleStrike().run()}
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
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
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
            direction="row"
            alignItems="center"
            justifyContent="flex-start"
            spacing={15}
          >
            <Stack direction="column">
              <Typography>Task Category*</Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Button
                  sx={{ fontSize: "12px", border: "1px solid black", px: 3 }}
                  onClick={handleCreateCategoryChange}
                  variant={createCategory === "Work" ? "contained" : "outlined"}
                >
                  Work
                </Button>
                <Button
                  sx={{ fontSize: "12px", border: "1px solid black" }}
                  onClick={handleCreateCategoryChange}
                  variant={
                    createCategory === "Personal" ? "contained" : "outlined"
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
                        sx={{ width: 220, backgroundColor: "#f1f1f1" }}
                      />
                    ),
                  }}
                />
              </LocalizationProvider>
            </Stack>

            <Stack direction="column">
              <Typography>Task Status*</Typography>
              <FormControl
                sx={{ width: 220, backgroundColor: "#f1f1f1" }}
                size="small"
              >
                <Select
                  value={createStatus}
                  onChange={(event) => setCreateStatus(event.target.value)}
                  displayEmpty
                  renderValue={(selected) =>
                    selected ? (
                      selected
                    ) : (
                      <span style={{ color: "gray" }}>Choose status</span>
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
                      style={{ color: "blue", textDecoration: "underline" }}
                    >
                      upload from here
                    </span>
                  </>
                )}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{ flexDirection: "column", alignItems: "stretch", gap: 1 }}
      >
        {/* First row: Floating error message aligned to the right */}
        {isCreateDisabled && (
          <Typography
            variant="caption"
            color="error"
            sx={{ alignSelf: "flex-end" }}
          >
            {`**PLEASE PROVIDE: ${missingFields.join(", ")} to create a task.`}
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
            CREATE
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm;
