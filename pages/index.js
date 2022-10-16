import styles from "../styles/Home.module.css";
// import styles from "../../../styles/Form.module.css";
import { useForm, Controller } from "react-hook-form";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import EnhancedTable from "../components/Table";

export default function Home() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  });
  const coinsList = ["ETH/USD", "SUSHI/USD", "BTC/USD"];
  const maxDate = new Date();
  const minDate = new Date(maxDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [result, setResult] = useState([]);

  const onSubmit = (data) => {
    setTimeout(5000);
    const chosenCoins = [];
    for (const key in data) {
      if (data[key] === true) {
        chosenCoins.push(key);
      }
    }

    console.log(chosenCoins);

    const body = JSON.stringify({
      coins: chosenCoins,
      startDate: data.startDate ? data.startDate.toDate() : new Date(),
      endDate: data.endDate ? data.endDate.toDate() : new Date(),
    });

    console.log(body);
    fetch("/api/coins", {
      method: "POST",
      body: body,
    })
      .then((res) => res.json())
      .then((data) => {
        setResult(data);
        console.log(data);
      });
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.options}>
          {coinsList.map((coin) => (
            <Controller
              name={coin}
              control={control}
              key={coin}
              render={({ field: { onChange, value } }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      margin={3}
                      checked={!!value}
                      onChange={(event, item) => {
                        onChange(item);
                      }}
                      name={coin}
                      color="primary"
                    />
                  }
                  label={coin}
                />
              )}
            />
          ))}
        </div>
        <div className={styles.datePicker}>
          <Controller
            name="startDate"
            key="startDate"
            control={control}
            render={({ field }) => (
              <div style={{ marginBottom: "3vh" }}>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <DateTimePicker
                    className={styles.date}
                    type="datetime-local"
                    required
                    {...field}
                    label="Start Date"
                    minDate={minDate}
                    maxDate={maxDate}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </div>
            )}
          />
          <Controller
            name="endDate"
            key="endDate"
            control={control}
            render={({ field }) => (
              <>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <DateTimePicker
                    type="datetime-local"
                    required
                    {...field}
                    label="End Date"
                    minDate={minDate}
                    maxDate={maxDate}
                    style={{ marginBottom: "3vh" }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </>
            )}
          />
        </div>
        <Button
          className={styles.submitButton}
          variant="contained"
          fullWidth
          type="submit"
          style={{ marginBottom: "3vh" }}
        >
          Search
        </Button>
      </form>
      <EnhancedTable data={result} />
    </div>
  );
}
