import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Header from "./header/header";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import FormControl from "@mui/material/FormControl";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import Select, { SelectChangeEvent } from "@mui/material/Select";

import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

const baseURL = `http://54.215.188.103:9090/api/v1`;

function App() {
  const [metrics, setMetrics] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string | null>("");
  const [stDate, setStDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [step, setStep] = useState<number>(100);

  const [tsData, setTsData] = useState<string>();

  useEffect(() => {
    (async () => {
      const { data } = await axios.get(`${baseURL}/label/__name__/values`);
      setMetrics(data.data);
    })();
  }, []);

  const jsonArrToCsv = (jsonArr: {}[]): string => {
    let outStr = "";
    for (let i = 0; i < jsonArr.length; i++) {
      if (i === 0) {
        outStr += Object.keys(jsonArr[i]).join(",");
        outStr += "\n";
        continue;
      }
      outStr += Object.values(jsonArr[i]).join(",");
      outStr += "\n";
    }
    return outStr;
  };

  const downloadHandler = async () => {
    const { data } = await axios.get(
      `${baseURL}/query_range?query=${selectedMetric}&start=${Math.floor(
        new Date(stDate).getTime() / 1000
      )}&end=${Math.floor(new Date(endDate).getTime() / 1000)}&step=${step}`
    );

    if (!data) {
      return;
    }
    console.log(data);

    const sanitizedData = data.data.result
      .map((res: any) => {
        return res.values.map(([ts, data]) => {
          return {
            timestamp: new Date(ts).toISOString(),
            value: data,
            topic: res.metric.topic,
            sensor_id: res.metric.sensor_id,
            host: res.metric.instance,
          };
        });
      })
      .flat();
    const csvOut = jsonArrToCsv(sanitizedData);
    setTsData(csvOut);
    const outBlob = new Blob([csvOut], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(outBlob);
    const link = document.createElement("a");
    link.href = url;
    link.click();
  };

  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              ECL
            </Typography>
            <Button color="inherit">User</Button>
          </Toolbar>
        </AppBar>
      </Box>

      <Box>
        <Box style={{ display: "flex" }}>
          <Typography variant="h6">Select Metric</Typography>
          <Select
            label="Metric Name"
            name=""
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            {metrics.map((x) => (
              <MenuItem value={x}>{x}</MenuItem>
            ))}
          </Select>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              value={stDate}
              renderInput={(params) => <TextField {...params} />}
              onChange={(e) => {
                setStDate(e);
              }}
            />

            <DateTimePicker
              value={endDate}
              renderInput={(params) => <TextField {...params} />}
              onChange={(e: Date | null) => {
                console.log(e);
                setEndDate(e);
              }}
            />
          </LocalizationProvider>

          <TextField
            id="outlined-basic"
            label="Outlined"
            variant="outlined"
            type="number"
            onChange={(e) => {
              setStep(parseInt(e.target.value));
            }}
          />
        </Box>
        <Box>
          <Button onClick={downloadHandler} variant="outlined">
            Submit
          </Button>
        </Box>
        <div>
          <h4>Preview (10 lines)</h4>
          <pre>{tsData?.split("\n").slice(0, 10).join("\n")}</pre>
        </div>
      </Box>
    </div>
  );
}

export default App;
