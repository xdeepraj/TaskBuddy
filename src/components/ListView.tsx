import { useState } from "react";
import {
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  Box,
  Divider,
  TextField,
  Popover,
  IconButton,
  List,
  ListItemButton,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SubdirectoryArrowLeftIcon from "@mui/icons-material/SubdirectoryArrowLeft";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

import { useTask } from "../context/TaskContext";

const ListView = () => {
  const { tasks, addTask } = useTask();

  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [newTask, setNewTask] = useState({
    title: "",
    dueDate: null as Dayjs | null,
    status: "",
    category: "",
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [popoverType, setPopoverType] = useState<"status" | "category" | "">(
    ""
  );

  const missingFields: string[] = [];
  if (!newTask.title) missingFields.push("TASK TITLE");
  if (!newTask.category) missingFields.push("TASK CATEGORY");
  if (!newTask.dueDate) missingFields.push("DUE DATE");
  if (!newTask.status) missingFields.push("TASK STATUS");

  // Filter tasks based on their status
  const todoTasks = tasks.filter((task) => task.status === "TODO");
  const inProgressTasks = tasks.filter((task) => task.status === "IN PROGRESS");
  const completedTasks = tasks.filter((task) => task.status === "COMPLETED");

  // Creating three accordian
  const taskAccordions = [
    {
      title: `TODO (${todoTasks.length})`,
      taskList: todoTasks,
      bgColor: "#fac3ff",
      showAddButton: true,
    },
    {
      title: `IN PROGRESS (${inProgressTasks.length})`,
      taskList: inProgressTasks,
      bgColor: "#85d9f1",
    },
    {
      title: `COMPLETED (${completedTasks.length})`,
      taskList: completedTasks,
      bgColor: "#ceffcc",
    },
  ];

  const handleAddTask = () => {
    if (
      !newTask.title ||
      !newTask.dueDate ||
      !newTask.status ||
      !newTask.category
    ) {
      return; // Prevent adding if any field is missing
    }

    addTask({
      ...newTask,
      dueDate: newTask.dueDate,
      description: "",
      attachment: null,
    });

    // Reset form and hide input fields
    setNewTask({ title: "", dueDate: null, status: "", category: "" });
    setShowAddTask(false);
  };

  const handleClose = () => {
    setShowAddTask(false);
    newTask.title = "";
    newTask.category = "";
    newTask.status = "";
    newTask.dueDate = null;
  };

  const handleOpenPopover = (
    event: React.MouseEvent<HTMLButtonElement>,
    type: "status" | "category"
  ) => {
    setAnchorEl(event.currentTarget);
    setPopoverType(type);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setPopoverType("");
  };

  return (
    <Paper
      sx={{
        padding: 2,
        backgroundColor: "transparent",
        boxShadow: "none",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          padding: 1,
        }}
      >
        <Typography sx={{ width: "50%" }}>Task Name</Typography>
        <Typography sx={{ width: "25%" }}>Due On</Typography>
        <Typography sx={{ width: "25%" }}>Task Status</Typography>
        <Typography sx={{ width: "25%" }}>Task Category</Typography>
      </Box>

      {/* Dynamically Render Task Accordions */}
      {taskAccordions.map((taskAccordion, index) => {
        return (
          <Accordion
            key={index}
            defaultExpanded
            sx={{
              borderRadius: "10px 10px 10px 10px",
              overflow: "hidden",
              "&:last-of-type": {
                borderRadius: "10px 10px 10px 10px",
              },
              mb: 3,
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: taskAccordion.bgColor,
              }}
            >
              <Typography variant="h6">{taskAccordion.title}</Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                backgroundColor: "#f1f1f1",
                overflow: "hidden",
                p: 0,
              }}
            >
              {/* Show "Add Task" button if the showAddButton is true */}
              {taskAccordion.showAddButton && (
                <>
                  <Button
                    variant="text"
                    color="primary"
                    sx={{ pl: 3, py: 2 }}
                    startIcon={<AddIcon />}
                    onClick={() => setShowAddTask(true)}
                  >
                    ADD TASK
                  </Button>
                  <Divider
                    sx={{ borderColor: "#d9d9d9", width: "100%", my: 2 }}
                  />
                </>
              )}

              {/* Show input fields when "Add Task" is clicked */}
              {taskAccordion.showAddButton && showAddTask && (
                <>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr",
                      gap: 2,
                      padding: 1,
                      alignItems: "center",
                    }}
                  >
                    {/* Task Title */}
                    <TextField
                      label="Task Title"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      variant="standard"
                    />

                    {/* Due Date */}
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        disablePast
                        value={newTask.dueDate}
                        onChange={(date) =>
                          setNewTask((prev) => ({ ...prev, dueDate: date }))
                        }
                        slots={{
                          textField: (params) => (
                            <TextField
                              {...params}
                              size="small"
                              sx={{ backgroundColor: "#f1f1f1", width: "90%" }}
                            />
                          ),
                        }}
                      />
                    </LocalizationProvider>

                    {/* Status Popover */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                      }}
                    >
                      <IconButton
                        onClick={(e) => handleOpenPopover(e, "status")}
                      >
                        <AddIcon />
                      </IconButton>
                      {newTask.status && (
                        <Typography
                          variant="body2"
                          sx={{
                            backgroundColor: "#dddadd",
                            px: 1,
                            py: 0.5,
                            borderRadius: "4px",
                          }}
                        >
                          {newTask.status}
                        </Typography>
                      )}
                    </Box>

                    {/* Category Popover */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                      }}
                    >
                      <IconButton
                        onClick={(e) => handleOpenPopover(e, "category")}
                      >
                        <AddIcon />
                      </IconButton>
                      {newTask.category && (
                        <Typography
                          variant="body2"
                          sx={{
                            backgroundColor: "#dddadd",
                            px: 1,
                            py: 0.5,
                            borderRadius: "4px",
                            fontSize: "15px",
                          }}
                        >
                          {newTask.category}
                        </Typography>
                      )}
                    </Box>

                    <Popover
                      open={Boolean(anchorEl)}
                      anchorEl={anchorEl}
                      onClose={handleClosePopover}
                      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    >
                      <List>
                        {popoverType === "status"
                          ? ["TODO", "IN PROGRESS", "COMPLETED"].map(
                              (option) => (
                                <ListItemButton
                                  key={option}
                                  onClick={() => {
                                    setNewTask((prev) => ({
                                      ...prev,
                                      status: option,
                                    }));
                                    handleClosePopover();
                                  }}
                                >
                                  {option}
                                </ListItemButton>
                              )
                            )
                          : ["Work", "Personal"].map((option) => (
                              <ListItemButton
                                key={option}
                                onClick={() => {
                                  setNewTask((prev) => ({
                                    ...prev,
                                    category: option,
                                  }));
                                  handleClosePopover();
                                }}
                              >
                                {option}
                              </ListItemButton>
                            ))}
                      </List>
                    </Popover>
                  </Box>

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ mt: 2, mb: 0.5 }}
                  >
                    {missingFields.length > 0 && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ alignSelf: "flex-end" }}
                      >
                        **PLEASE PROVIDE: {missingFields.join(", ")}.
                      </Typography>
                    )}
                  </Stack>

                  {/* Add & Cancel Buttons */}
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="center"
                    sx={{ mb: 2 }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddTask}
                      endIcon={<SubdirectoryArrowLeftIcon />}
                      disabled={
                        !newTask.title ||
                        !newTask.dueDate ||
                        !newTask.status ||
                        !newTask.category
                      }
                    >
                      ADD
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleClose}
                    >
                      CANCEL
                    </Button>
                  </Stack>

                  <Divider
                    sx={{ borderColor: "#d9d9d9", width: "100%", my: 2 }}
                  />
                </>
              )}

              {taskAccordion.taskList.length > 0 ? (
                taskAccordion.taskList.map((task, idx) => (
                  <Box key={idx}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr 1fr",
                        gap: 2,
                        padding: 1,
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {task.title}
                      </Typography>
                      <Typography variant="body1">
                        {task.dueDate
                          ? dayjs(task.dueDate.toDate()).format("DD MMM, YYYY")
                          : "No due date"}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          variant="body1"
                          sx={{
                            backgroundColor: "#dddadd",
                            px: 1,
                            py: 0.5,
                            borderRadius: "4px",
                            fontSize: "15px",
                            display: "inline-block",
                            width: "fit-content",
                          }}
                        >
                          {task.status}
                        </Typography>
                      </Box>
                      <Typography variant="body1">{task.category}</Typography>
                    </Box>

                    {idx !== taskAccordion.taskList.length - 1 && (
                      <Divider sx={{ borderColor: "#d9d9d9", width: "100%" }} />
                    )}
                  </Box>
                ))
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100px",
                  }}
                >
                  <Typography>
                    No Tasks in{" "}
                    {taskAccordion.title.slice(
                      0,
                      taskAccordion.title.lastIndexOf(" ")
                    )}
                  </Typography>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Paper>
  );
};

export default ListView;
