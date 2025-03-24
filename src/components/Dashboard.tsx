import { ChangeEvent, useEffect } from "react";
import {
  Button,
  Typography,
  Avatar,
  Stack,
  TextField,
  Divider,
  useMediaQuery,
  useTheme,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import { useAuth } from "../context/AuthContext";

import BWIcon from "../assets/bw-icon.svg";
import ListIcon from "../assets/list-icon.svg";
import BoardIcon from "../assets/board-icon.svg";
import LogoutIcon from "../assets/logout-icon.svg";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import ListView from "./ListView";
import BoardView from "./BoardView";

import TaskForm from "./TaskForm";

import { useTask } from "../context/TaskContext";

const Dashboard = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { user, logout, view, setView } = useAuth();
  const username = user?.displayName?.split(" ")[0];

  const {
    openForm,
    setOpenForm,
    setCurrentTask,
    filterCategory,
    setFilterCategory,
    filterDate,
    setFilterDate,
    searchQuery,
    setSearchQuery,
  } = useTask();

  // Ensure view is 'list' on mobile devices
  useEffect(() => {
    if (isSmallScreen && view !== "list") {
      setView("list");
    }
  }, [isSmallScreen, view, setView]);

  const handleAddTask = () => {
    setCurrentTask(null);
    setOpenForm(true);
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setFilterCategory(event.target.value);
  };

  const handleView = (): void => {
    setView("list");
  };

  const handleBoardView = (): void => {
    setView("board");
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(event.target.value as string);
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        overflowY: "auto",
        backgroundColor: "white",
      }}
    >
      <Box
        sx={{
          width: "100%",
          backgroundColor: { xs: "#f5f5f5", md: "transparent" },
          py: 1,
          px: 1,
        }}
      >
        {/* First row, left: Icon+name, right: Avatar+username */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{
            backgroundColor: { xs: "#faeefc", md: "transparent" },
          }}
        >
          {/* left: Icon+name */}
          <Stack direction="row" alignItems="center">
            {!isSmallScreen && (
              <img
                src={BWIcon}
                alt="Main Icon"
                style={{ width: 30, height: 30 }}
              />
            )}
            <Typography
              variant="body1"
              fontSize={{ xs: "18px", md: "28px" }}
              padding={{ xs: 1 }}
              fontWeight="600"
            >
              TaskBuddy
            </Typography>
          </Stack>

          {/* right: Avatar+username */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{ pr: { xs: 2 } }}
          >
            <Avatar
              src={user?.photoURL || ""}
              alt="Profile picture"
              sx={{ width: 30, height: 30 }}
            />
            {!isSmallScreen && (
              <Typography variant="body1">{username}</Typography>
            )}
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          px: 2,
          pb: isSmallScreen ? 2 : 0,
        }}
      >
        {/* Second row, left: View Selector: List | Board, right: logout button */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{
            mt: { xs: 2, md: 0.5 },
          }}
        >
          {/* left: View Selector: List | Board */}
          {!isSmallScreen ? (
            <Stack direction="row">
              <Button
                onClick={handleView}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  borderBottom:
                    view === "list" ? "2px solid rgb(0, 0, 0)" : "none",
                  borderRadius: 0,
                  pb: 0.5,
                  transition: "transform 0.2s, font-size 0.5s",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              >
                <img
                  src={ListIcon}
                  alt="List Icon"
                  style={{ width: 20, height: 20 }}
                />
                <Typography variant="body1" fontSize="20px">
                  List
                </Typography>
              </Button>

              <Button
                onClick={handleBoardView}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  borderBottom:
                    view === "board" ? "2px solid rgb(0, 0, 0)" : "none",
                  borderRadius: 0,
                  pb: 0.5,
                  transition: "transform 0.2s, font-size 0.5s",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              >
                <img
                  src={BoardIcon}
                  alt="Board Icon"
                  style={{ width: 20, height: 20 }}
                />
                <Typography variant="body1" fontSize="20px">
                  Board
                </Typography>
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" alignItems="center">
              <Button
                variant="contained"
                sx={{ width: "20", height: "20" }}
                onClick={handleAddTask}
              >
                <Typography variant="body1" fontSize="16px">
                  ADD TASK
                </Typography>
              </Button>
            </Stack>
          )}

          {/* right: logout button */}
          <Stack>
            <Button
              variant="contained"
              sx={{
                bgcolor: "background.default",
                color: "#d32f2f",
                transition: "transform 0.1s",
                "&:hover": {
                  color: "#d32f2f",
                  transform: "scale(1.1)",
                },
              }}
              onClick={logout}
              startIcon={
                <img
                  src={LogoutIcon}
                  alt="Logout"
                  style={{ width: 20, height: 20 }}
                />
              }
            >
              <Typography variant="body1">Logout</Typography>
            </Button>
          </Stack>
        </Stack>

        {/* Third row, left: Filter views, right: Search+add task */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          mt={3}
        >
          {/* left: Filter views */}
          {!isSmallScreen ? (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body1" fontSize="15px">
                Filter by:
              </Typography>

              <FormControl size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Category"
                  onChange={handleCategoryChange}
                  sx={{ minWidth: 120, borderRadius: 5 }}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Work">Work</MenuItem>
                  <MenuItem value="Personal">Personal</MenuItem>
                </Select>
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  disablePast
                  label="Due Date"
                  value={filterDate}
                  onChange={(newValue) => setFilterDate(newValue)}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { height: 40, minWidth: 150 },
                      helperText: filterDate ? (
                        <span style={{ color: "#f57c00" }}>
                          Showing for {filterDate.format("Do MMM, YYYY")} &
                          previous dates
                        </span>
                      ) : (
                        "Showing for all dates"
                      ),
                    },
                  }}
                />
              </LocalizationProvider>
              {/* Clear Filter Button */}
              {filterDate && (
                <Button
                  onClick={() => setFilterDate(null)}
                  variant="outlined"
                  size="small"
                >
                  Clear
                </Button>
              )}
            </Stack>
          ) : (
            <Stack direction="column" spacing={1} width="100%">
              <Typography variant="body1" fontSize="15px">
                Filter by:
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                width="100%"
              >
                <FormControl size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filterCategory}
                    label="Category"
                    onChange={handleCategoryChange}
                    sx={{ minWidth: 100, borderRadius: 5 }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Work">Work</MenuItem>
                    <MenuItem value="Personal">Personal</MenuItem>
                  </Select>
                </FormControl>
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ flexGrow: 1, justifyContent: "flex-start" }}
                  spacing={1}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      disablePast
                      label="Due Date"
                      value={filterDate}
                      onChange={(newValue) => setFilterDate(newValue)}
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: { height: 40, width: "160px" },
                          helperText: filterDate ? (
                            <span style={{ color: "#f57c00" }}>
                              Showing for {filterDate.format("Do MMM, YYYY")} &
                              previous dates
                            </span>
                          ) : (
                            "Showing for all dates"
                          ),
                        },
                      }}
                    />
                  </LocalizationProvider>
                  <Stack direction="row" alignItems="flex-end">
                    {/* Clear Filter Button */}
                    {filterDate && (
                      <Button
                        onClick={() => setFilterDate(null)}
                        variant="outlined"
                        size="small"
                        sx={{ ml: "auto", minWidth: "40px", padding: "5px" }}
                      >
                        Clear
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          )}

          {/* right: Search+add task */}
          {!isSmallScreen && (
            <Stack direction="row" alignItems="center" spacing={2}>
              <TextField
                placeholder="Search"
                label="Search"
                variant="outlined"
                value={searchQuery}
                onChange={handleSearch}
                sx={{ minWidth: "300px" }}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setSearchQuery("")}
                          edge="end"
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                variant="contained"
                onClick={handleAddTask}
                sx={{
                  minWidth: "150px",
                  height: "60px",
                  transition: "transform 0.2s, font-size 0.5s",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              >
                <Typography variant="body1" fontSize="18px">
                  ADD TASK
                </Typography>
              </Button>
            </Stack>
          )}
        </Stack>

        {/* Search only for mobile */}
        {isSmallScreen && (
          <Stack direction="row" mt={filterDate ? 6 : 4}>
            <TextField
              placeholder="Search"
              label="Search"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={handleSearch}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchQuery("")} edge="end">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        )}

        {!isSmallScreen && (
          <Divider sx={{ borderColor: "#e8e8e8", mt: filterDate ? 5 : 3 }} />
        )}

        {/* Render List View or Board View */}
        <Box>{view === "list" ? <ListView /> : <BoardView />}</Box>

        {/* Dialog to create task */}
        {openForm && <TaskForm />}
      </Box>
    </Box>
  );
};

export default Dashboard;
