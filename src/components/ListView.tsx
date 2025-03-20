import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  Box,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const tasks = [
  {
    name: "Task 1",
    dueOn: "2025-03-25",
    status: "Pending",
    category: "Work",
  },
  {
    name: "Task 2",
    dueOn: "2025-03-26",
    status: "Completed",
    category: "Personal",
  },
  {
    name: "Task 3",
    dueOn: "2025-03-27",
    status: "In Progress",
    category: "Study",
  },
  {
    name: "Task 4",
    dueOn: "2025-03-28",
    status: "In Progress",
    category: "Work",
  },
  {
    name: "Task 5",
    dueOn: "2025-04-12",
    status: "Pending",
    category: "Study",
  },
];

// Filter tasks based on their status
const todoTasks = tasks.filter((task) => task.status === "Pending");
const inProgressTasks = tasks.filter((task) => task.status === "In Progress");
const completedTasks = tasks.filter((task) => task.status === "Completed");

const ListView = () => {
  const taskAccordions = [
    {
      title: `TODO (${todoTasks.length})`,
      taskList: todoTasks,
      bgColor: "#fac3ff",
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
        <Typography sx={{ width: "25%" }}>Task Name</Typography>
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
              {taskAccordion.taskList.length > 0 ? (
                taskAccordion.taskList.map((task, idx) => (
                  <Box key={idx}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: 1,
                      }}
                    >
                      <Typography sx={{ width: "25%" }}>{task.name}</Typography>
                      <Typography sx={{ width: "25%" }}>
                        {task.dueOn}
                      </Typography>
                      <Typography sx={{ width: "25%" }}>
                        {task.status}
                      </Typography>
                      <Typography sx={{ width: "25%" }}>
                        {task.category}
                      </Typography>
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
