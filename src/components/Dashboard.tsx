import { useState, useEffect, ChangeEvent } from "react";

import {
  Button,
  Typography,
  Avatar,
  Stack,
  TextField,
  Divider,
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

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

import ListView from "./ListView";
import BoardView from "./BoardView";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const username = user?.displayName?.split(" ")[0];

  const [view, setView] = useState<"list" | "board">("list");
  const [category, setCategory] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [query, setQuery] = useState<string>("");

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setCategory(event.target.value);
  };

  const handleView = (): void => {
    setView("list");
  };

  const handleBoardView = (): void => {
    setView("board");
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value as string);
  };

  useEffect(() => {
    console.log("category: ", category);
  }, [category]);
  useEffect(() => {
    console.log("selectedDate: ", selectedDate);
  }, [selectedDate]);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        overflowY: "auto",
        backgroundColor: "white",
        p: 2,
      }}
    >
      {/* First row, left: Icon+name, right: Avatar+username */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        {/* left: Icon+name */}
        <Stack direction="row" alignItems="center">
          <img src={BWIcon} alt="Main Icon" style={{ width: 30, height: 30 }} />
          <Typography variant="body1" fontSize="28px" fontWeight="600">
            TaskBuddy
          </Typography>
        </Stack>

        {/* right: Avatar+username */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Avatar
            src={user?.photoURL || ""}
            alt="Profile picture"
            sx={{ width: 30, height: 30 }}
          />
          <Typography variant="body1">{username}</Typography>
        </Stack>
      </Stack>

      {/* Second row, left: View Selector: List | Board, right: logout button */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        mt={0.5}
      >
        {/* left: View Selector: List | Board */}
        <Stack direction="row">
          <Button
            onClick={handleView}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              borderBottom: view === "list" ? "2px solid rgb(0, 0, 0)" : "none",
              borderRadius: 0,
              pb: 0.5,
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

        {/* right: logout button */}
        <Stack>
          <Button
            variant="contained"
            sx={{
              bgcolor: "background.default",
              color: "black",
              "&:hover": { bgcolor: "#d32f2f" },
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
            Logout
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
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="body1" fontSize="15px">
            Filter by:
          </Typography>

          <FormControl size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={handleCategoryChange}
              sx={{ minWidth: 120, borderRadius: 5 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="work">Work</MenuItem>
              <MenuItem value="personal">Personal</MenuItem>
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disablePast
              label="Due Date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              slotProps={{
                textField: {
                  size: "small",
                  sx: { height: 40, minWidth: 150 },
                  helperText: selectedDate
                    ? `Showing for ${selectedDate.format(
                        "Do MMMM, YYYY"
                      )} & previous dates`
                    : "Showing for all dates",
                },
              }}
            />
          </LocalizationProvider>
          {/* Clear Filter Button */}
          {selectedDate && (
            <Button
              onClick={() => setSelectedDate(null)}
              variant="outlined"
              size="small"
            >
              Clear
            </Button>
          )}
        </Stack>

        {/* right: Search+add task */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={query}
            onChange={handleSearch}
          />

          <Button
            variant="contained"
            sx={{ minWidth: "150px", height: "60px" }}
          >
            <Typography variant="body1" fontSize="18px">
              ADD TASK
            </Typography>
          </Button>
        </Stack>
      </Stack>

      <Divider sx={{ borderColor: "#e8e8e8", mt: 6 }} />
      {/* Render List View or Board View */}
      <Box>{view === "list" ? <ListView /> : <BoardView />}</Box>
    </Box>
  );
};

export default Dashboard;
