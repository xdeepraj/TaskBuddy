import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Menu,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import dayjs, { Dayjs } from "dayjs";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useTask } from "../context/TaskContext";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import deleteicon from "../assets/delete-icon.svg";

interface Task {
  id?: string;
  title: string;
  description: string;
  category: string;
  dueDate: Dayjs | null;
  status: string;
  attachment: File | null;
}

const BoardView = () => {
  const {
    tasks,
    filteredTasks,
    filterCategory,
    filterDate,
    searchQuery,
    deleteTask,
    setCurrentTask,
    setOpenForm,
    updateTask,
  } = useTask();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const displayTasks =
    filterCategory === "All" && !filterDate && !searchQuery
      ? tasks
      : filteredTasks;

  const columns = [
    { title: "TODO", color: "#d1aaff" },
    { title: "IN PROGRESS", color: "#74c0fc" },
    { title: "COMPLETED", color: "#69db7c" },
  ];

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

  const handleEdit = (selectedTask: any) => {
    setCurrentTask(selectedTask);
    setOpenForm(true);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const movedTask = displayTasks.find((task) => task.id === draggableId);

      if (movedTask) {
        updateTask({
          ...movedTask,
          status: destination.droppableId,
        });
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box display="flex" justifyContent="space-between" gap={2} mt={3}>
        {columns.map((column) => (
          <Droppable key={column.title} droppableId={column.title}>
            {(provided) => (
              <Paper
                ref={provided.innerRef}
                {...provided.droppableProps}
                elevation={3}
                sx={{
                  flex: 1,
                  padding: 2,
                  minHeight: 450,
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "#f1f1f1",
                  borderRadius: "12px",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: column.color,
                    padding: "8px 14px",
                    fontWeight: "bold",
                    marginBottom: 2,
                    alignSelf: "flex-start",
                    textAlign: "left",
                    borderRadius: "8px",
                  }}
                >
                  {column.title}
                </Box>

                <Box flex={1} display="flex" flexDirection="column" gap={1}>
                  {displayTasks
                    .filter((task) => task.status === column.title)
                    .map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id!}
                        index={index}
                      >
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              minHeight: 150,
                              marginBottom: 1,
                              cursor: "pointer",
                              borderRadius: "12px",
                              display: "flex",
                              flexDirection: "column",
                              "&:hover": { boxShadow: 4 },
                            }}
                            onClick={() => {
                              setCurrentTask(task);
                              setOpenForm(true);
                            }}
                          >
                            <CardContent
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",
                              }}
                            >
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    textDecoration:
                                      task.status === "COMPLETED"
                                        ? "line-through"
                                        : "none",
                                  }}
                                >
                                  {task.title}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMenuOpen(e, task);
                                  }}
                                >
                                  <MoreHorizIcon />
                                </IconButton>
                              </Box>

                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                marginTop="auto"
                              >
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  {task.category}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  {task.dueDate
                                    ? dayjs(task.dueDate.toDate()).format(
                                        "DD MMM, YYYY"
                                      )
                                    : "No due date"}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </Box>

                {/* Show edit & delete when three dot is clicked */}
                {
                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
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
                      }}
                    >
                      <Box
                        component="img"
                        src={deleteicon}
                        alt="Delete"
                        sx={{ width: 15, height: 15 }}
                      />
                      <Typography
                        variant="body2"
                        fontSize="18px"
                        color="error.main"
                      >
                        Delete
                      </Typography>
                    </MenuItem>
                  </Menu>
                }
              </Paper>
            )}
          </Droppable>
        ))}
      </Box>
    </DragDropContext>
  );
};

export default BoardView;
