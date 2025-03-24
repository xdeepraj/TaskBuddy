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
  Menu,
  MenuItem,
  Checkbox,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SubdirectoryArrowLeftIcon from "@mui/icons-material/SubdirectoryArrowLeft";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

import { useTask } from "../context/TaskContext";

import SearchNotFound from "../assets/SearchNotFound.svg";
import todoCheck from "../assets/todoCheck.png";
import inprogressCheck from "../assets/inprogressCheck.png";
import completedCheck from "../assets/completedCheck.png";
import deleteicon from "../assets/delete-icon.svg";

import TaskForm from "./TaskForm";

import { Timestamp } from "firebase/firestore";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

import { Task } from "../types/types";
import { useAuth } from "../context/AuthContext";
import { useActivityLog } from "../context/ActivityLogContext";
import { StatusChangePopupProps } from "../types/types";

const ListView = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { logActivity } = useActivityLog();
  const { user } = useAuth();
  const {
    tasks,
    filteredTasks,
    filterCategory,
    filterDate,
    searchQuery,
    addTask,
    updateTask,
    deleteTask,
    setCurrentTask,
    setOpenForm,
    updateMultipleTasksStatus,
    deleteMultipleTasks,
    isSearching,
  } = useTask();

  // Determine which array to display based on filters
  const displayTasks =
    filterCategory === "All" && !filterDate && !searchQuery
      ? tasks
      : filteredTasks;

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

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [batchTasks, setBatchTasks] = useState<Task[]>([]);

  const missingFields: string[] = [];
  if (!newTask.title) missingFields.push("TASK TITLE");
  if (!newTask.category) missingFields.push("TASK CATEGORY");
  if (!newTask.dueDate) missingFields.push("DUE DATE");
  if (!newTask.status) missingFields.push("TASK STATUS");

  // Filter displayTasks based on their status
  const todoTasks = displayTasks.filter((task) => task.status === "TODO");
  const inProgressTasks = displayTasks.filter(
    (task) => task.status === "IN PROGRESS"
  );
  const completedTasks = displayTasks.filter(
    (task) => task.status === "COMPLETED"
  );

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

  const handleAddTask = async () => {
    if (
      !newTask.title ||
      !newTask.dueDate ||
      !newTask.status ||
      !newTask.category
    ) {
      return;
    }

    const taskId = await addTask({
      ...newTask,
      dueDate: newTask.dueDate,
      description: "",
      attachment: "",
    });

    if (taskId !== null) {
      await logActivity(taskId, {}, user?.uid ?? "", true);
    }

    // Reset form and hide input fields
    setNewTask({ title: "", dueDate: null, status: "", category: "" });
    setShowAddTask(false);
  };

  const handleCancel = () => {
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

  const onDragEnd = async (result: DropResult) => {
    // If dropped outside, do nothing
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const movedTask = displayTasks.find((task) => task.id === draggableId);

      if (movedTask) {
        // Update only the status
        updateTask({
          ...movedTask,
          status: destination.droppableId,
        });

        // Log the status change
        await logActivity(
          draggableId,
          { status: [source.droppableId, destination.droppableId] },
          user?.uid ?? "",
          false
        );
      }
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    task: Task
  ) => {
    setMenuAnchor(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTask(null);
  };

  const handleEdit = (selectedTask: Task | null) => {
    setCurrentTask(selectedTask);
    setOpenForm(true);
  };

  const handleCheckboxChange = (task: Task) => {
    setBatchTasks((prev) =>
      prev.some((selectedTask) => selectedTask.id === task.id)
        ? prev.filter((selectedTask) => selectedTask.id !== task.id)
        : [...prev, task]
    );
  };

  const batchUpdateStatus = async (newStatus: string) => {
    await Promise.all(
      batchTasks.map((task) =>
        logActivity(
          task.id ?? "",
          { status: [task.status, newStatus] },
          user?.uid ?? "",
          false
        )
      )
    );
    updateMultipleTasksStatus(batchTasks, newStatus);
    setBatchTasks([]);
  };

  const batchDeleteTasks = () => {
    deleteMultipleTasks(batchTasks);
    setBatchTasks([]);
  };

  const StatusChangePopup: React.FC<StatusChangePopupProps> = ({
    onUpdateStatus,
  }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleStatusChange = (status: string) => {
      onUpdateStatus(status);
      handleClose();
    };

    return (
      <>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleClick}
          sx={{ fontSize: isSmallScreen ? "12px" : "14px" }}
        >
          Change Status
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          sx={{
            mt: -1.5,
            "& .MuiPaper-root": {
              backgroundColor: "black",
              color: "white",
              borderRadius: "15px",
            },
          }}
        >
          <MenuItem
            onClick={() => handleStatusChange("TODO")}
            sx={{
              transition: "transform 0.2s, font-size 0.5s",
              "&:hover": {
                transform: "scale(1.1)",
                fontSize: "16px",
                color: "#EA00FF",
              },
            }}
          >
            TODO
          </MenuItem>
          <MenuItem
            onClick={() => handleStatusChange("IN PROGRESS")}
            sx={{
              transition: "transform 0.2s, font-size 0.5s",
              "&:hover": {
                transform: "scale(1.1)",
                fontSize: "16px",
                color: "#00C6FF",
              },
            }}
          >
            IN PROGRESS
          </MenuItem>
          <MenuItem
            onClick={() => handleStatusChange("COMPLETED")}
            sx={{
              transition: "transform 0.2s, font-size 0.5s",
              "&:hover": {
                transform: "scale(1.1)",
                fontSize: "16px",
                color: "#0AFF00",
              },
            }}
          >
            COMPLETED
          </MenuItem>
        </Menu>
      </>
    );
  };

  const formatDueDate = (dueDate: Dayjs | Timestamp): string => {
    const date = dayjs(dueDate.toDate());

    if (date.isSame(dayjs(), "day")) {
      return "Today";
    } else if (date.isSame(dayjs().subtract(1, "day"), "day")) {
      return "Yesterday";
    } else if (date.isSame(dayjs().add(1, "day"), "day")) {
      return "Tomorrow";
    } else {
      return isSmallScreen
        ? date.format("DD/MM/YY")
        : date.format("DD MMM, YYYY");
    }
  };

  return (
    <Paper
      sx={{
        marginTop: { xs: 2, md: 0 },
        backgroundColor: "transparent",
        boxShadow: "none",
        mb: 3,
      }}
    >
      {/* Header */}
      {!isSmallScreen && (
        <Box
          sx={{
            display: "flex",
            paddingTop: 1,
            paddingLeft: 1,
            paddingRight: 1,
          }}
        >
          <Typography sx={{ width: "50%", fontWeight: "bold" }}>
            Task Name
          </Typography>
          <Typography sx={{ width: "20%", fontWeight: "bold" }}>
            Due On
          </Typography>
          <Typography sx={{ width: "20%", fontWeight: "bold" }}>
            Task Status
          </Typography>
          <Typography sx={{ width: "20%", fontWeight: "bold" }}>
            Task Category
          </Typography>
          <Typography sx={{ width: "10%", fontWeight: "bold" }}></Typography>
        </Box>
      )}

      {!isSmallScreen && (
        <Divider sx={{ borderColor: "#d9d9d9", width: "100%", my: 2 }} />
      )}

      {/* Dynamically Render Task Accordions */}
      {isSearching && displayTasks.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
            textAlign: "center",
          }}
        >
          <img
            src={SearchNotFound}
            alt="No search results"
            style={{ width: "200px", height: "auto", marginBottom: "16px" }}
          />
          <Typography variant="h6" color="textSecondary">
            It looks like we can't find any results <br /> that match.
          </Typography>
        </Box>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          {/* </DragDropContext> */}
          {taskAccordions.map((taskAccordion, index) => (
            <Droppable
              droppableId={taskAccordion.title.split(" (")[0]}
              key={taskAccordion.title}
            >
              {(provided) => (
                <Accordion
                  ref={provided.innerRef}
                  {...provided.droppableProps}
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
                    {!isSmallScreen && taskAccordion.showAddButton && (
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
                          sx={{ borderColor: "#d9d9d9", width: "100%", my: 1 }}
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
                                setNewTask((prev) => ({
                                  ...prev,
                                  dueDate: date,
                                }))
                              }
                              slots={{
                                textField: (params) => (
                                  <TextField
                                    {...params}
                                    size="small"
                                    sx={{
                                      backgroundColor: "#f1f1f1",
                                      width: "90%",
                                    }}
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
                                  borderRadius: "10px",
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
                                  borderRadius: "10px",
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
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "left",
                            }}
                            sx={{
                              "& .MuiPaper-root": {
                                backgroundColor: "#fff9f9",
                                borderRadius: "15px",
                              },
                            }}
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
                                        sx={{
                                          transition:
                                            "transform 0.2s, font-size 0.5s",
                                          "&:hover": {
                                            backgroundColor: "transparent",
                                            transform: "scale(1.1)",
                                            fontSize: "16px",
                                            color:
                                              option === "TODO"
                                                ? "#EA00FF"
                                                : option === "IN PROGRESS"
                                                ? "#00C6FF"
                                                : "#0AFF00",
                                          },
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
                                      sx={{
                                        transition:
                                          "transform 0.2s, font-size 0.5s",
                                        "&:hover": {
                                          backgroundColor: "transparent",
                                          transform: "scale(1.1)",
                                          fontSize: "16px",
                                        },
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
                            onClick={handleCancel}
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
                      taskAccordion.taskList.map((task: Task, idx: number) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id ?? "unknown-id"}
                          index={idx}
                        >
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                  xs: "1fr auto auto",
                                  md: "5fr 2fr 2fr 2fr 1fr",
                                },
                                gap: { xs: 0, md: 2 },
                                padding: 1,
                                alignItems: "center",
                                backgroundColor: "#f1f1f1",
                                boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
                                borderRadius: "4px",
                              }}
                            >
                              {/* Checkbox + drag indicator + check/uncheck + Title */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <Checkbox
                                  checked={batchTasks.some(
                                    (selectedTask) =>
                                      selectedTask.id === task.id
                                  )}
                                  onChange={() => handleCheckboxChange(task)}
                                />

                                {!isSmallScreen && <DragIndicatorIcon />}

                                <img
                                  src={
                                    task.status == "TODO"
                                      ? todoCheck
                                      : task.status === "IN PROGRESS"
                                      ? inprogressCheck
                                      : completedCheck
                                  }
                                  alt={
                                    task.status === "TOD0"
                                      ? "todoCheck"
                                      : task.status === "IN PROGRESS"
                                      ? "inprogressCheck"
                                      : "completedCheck"
                                  }
                                  width={15}
                                  height={15}
                                  style={{ marginRight: "4px" }}
                                />

                                {/* Task Title */}
                                <Typography
                                  variant="body1"
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "normal",
                                    wordBreak: "break-word",
                                    textDecoration:
                                      task.status === "COMPLETED"
                                        ? "line-through"
                                        : "none",
                                  }}
                                >
                                  {task.title}
                                </Typography>
                              </Box>

                              {/* Due Date */}
                              <Box>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontSize: isSmallScreen
                                      ? "0.75rem"
                                      : "1rem",
                                  }}
                                >
                                  {task.dueDate
                                    ? formatDueDate(task.dueDate)
                                    : "No due date"}
                                </Typography>
                              </Box>

                              {/* Task Status */}
                              {!isSmallScreen && (
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
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
                              )}

                              {/* Category */}
                              {!isSmallScreen && (
                                <Box>
                                  <Typography variant="body1">
                                    {task.category}
                                  </Typography>
                                </Box>
                              )}

                              {/* Actions */}
                              <Box sx={{ ml: { xs: "auto", md: 0 } }}>
                                <IconButton
                                  onClick={(e) => handleMenuOpen(e, task)}
                                >
                                  <MoreHorizIcon />
                                </IconButton>
                              </Box>
                            </Box>
                          )}
                        </Draggable>
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
                    {provided.placeholder}
                  </AccordionDetails>
                </Accordion>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      )}

      {/* Render Task Form for Adding a New Task */}
      <TaskForm />

      {/* Show edit & delete when three dot is clicked */}
      {
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          sx={{
            "& .MuiPaper-root": {
              backgroundColor: "#fff9f9",
              borderRadius: "15px",
            },
          }}
        >
          <MenuItem
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#6A5ACD",
              transition: "transform 0.2s, font-size 0.5s",
              "&:hover": {
                transform: "scale(1.1)",
                fontSize: "16px",
                backgroundColor: "transparent",
              },
            }}
          >
            <Box
              onClick={() => {
                handleEdit(selectedTask);
                handleMenuClose();
              }}
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <BorderColorIcon sx={{ fontSize: 15, mr: 2 }} />
              <Typography variant="body2" fontSize="18px">
                Edit
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (selectedTask?.id) {
                deleteTask(selectedTask.id);
              }
              handleMenuClose();
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              transition: "transform 0.2s, font-size 0.5s",
              "&:hover": {
                transform: "scale(1.1)",
                fontSize: "16px",
                backgroundColor: "transparent",
              },
            }}
          >
            <Box
              component="img"
              src={deleteicon}
              alt="Delete"
              sx={{ width: 15, height: 15 }}
            />
            <Typography variant="body2" fontSize="18px" color="error.main">
              Delete
            </Typography>
          </MenuItem>
        </Menu>
      }

      {/* Batch Update Popup */}
      {batchTasks.length > 0 && (
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "black",
            borderRadius: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isSmallScreen ? 0.5 : 2,
            padding: isSmallScreen ? "8px 12px" : "8px 16px",
            zIndex: 1000,
            whiteSpace: "nowrap",
            maxWidth: "90vw",
          }}
        >
          <Typography
            color="white"
            sx={{
              border: "1px solid #333",
              padding: "5px 12px",
              borderRadius: "15px",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "2px",
            }}
          >
            {batchTasks.length} Task{batchTasks.length > 1 ? "s" : ""} selected
            <IconButton
              size="small"
              onClick={() => setBatchTasks([])}
              sx={{ color: "white", padding: "2px" }}
            >
              <CloseOutlinedIcon fontSize="small" />
            </IconButton>
          </Typography>

          {/* Status Change Popup */}
          <StatusChangePopup onUpdateStatus={batchUpdateStatus} />

          <Button
            variant="contained"
            color="error"
            onClick={batchDeleteTasks}
            sx={{ fontSize: isSmallScreen ? "12px" : "14px" }}
          >
            Delete all
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ListView;
