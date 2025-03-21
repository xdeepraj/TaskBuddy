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
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

import { useTask } from "../context/TaskContext";

import checkmark from "../assets/checkmark.svg";
import uncheckmark from "../assets/uncheckmark.svg";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface Task {
  id?: string; // Firestore will assign this
  title: string;
  description: string;
  category: string;
  dueDate: Dayjs | null;
  status: string;
  attachment: File | null;
}

const ListView = () => {
  const { tasks, addTask, updateTask } = useTask();

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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return; // If dropped outside, do nothing

    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const movedTask = tasks.find((task) => task.id === draggableId);

      if (movedTask) {
        updateTask({
          ...movedTask,
          status: destination.droppableId, // Update only the status
        });
      }
    }
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
                              setNewTask((prev) => ({ ...prev, dueDate: date }))
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
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
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
                              gridTemplateColumns: "2fr 1fr 1fr 1fr",
                              gap: 2,
                              padding: 1,
                              alignItems: "center",
                              backgroundColor: "white",
                              boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
                              borderRadius: "4px",
                            }}
                          >
                            {/* <img src={DragIndicatorIcon} alt={} width={24} height={24} /> */}

                            {/* Task Status Icon + Title in the same row */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <DragIndicatorIcon />
                              <img
                                src={
                                  task.status === "COMPLETED"
                                    ? checkmark
                                    : uncheckmark
                                }
                                alt={
                                  task.status === "COMPLETED"
                                    ? "Completed"
                                    : "Pending"
                                }
                                width={24}
                                height={24}
                              />

                              {/* Task Title */}
                              <Typography
                                variant="body1"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  textDecoration:
                                    task.status === "COMPLETED"
                                      ? "line-through"
                                      : "none",
                                }}
                              >
                                {task.title}
                              </Typography>
                            </Box>

                            <Typography variant="body1">
                              {task.dueDate
                                ? dayjs(task.dueDate.toDate()).format(
                                    "DD MMM, YYYY"
                                  )
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
                            <Typography variant="body1">
                              {task.category}
                            </Typography>
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
    </Paper>
  );
};

export default ListView;
