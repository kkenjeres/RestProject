const express = require("express");
const cors = require("cors");
const escpos = require("escpos");

const app = express();

const PRINTER = {
  device_name: "Epson TM-M30",
  host: "192.168.2.113",
  port: 9100,
};

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

app.post("/print", async (req, res) => {
  const { text } = req.body;

  try {
    const device = new escpos.Network(PRINTER.host, PRINTER.port);
    const printer = new escpos.Printer(device);

    device.open(async (error) => {
      if (error) {
        console.error("Ошибка при подключении к устройству:", error);
        res.status(500).json({ error: "Не удалось подключиться к устройству" });
        return;
      }

      try {
        printer
          .align("CT")
          .text(text)
          .cut()
          .close();

        console.log("Текст успешно напечатан!");
        res.status(200).json({ message: "Текст успешно напечатан" });
      } catch (error) {
        console.error("Ошибка печати:", error);
        res.status(500).json({ error: "Ошибка печати" });
      } finally {
        device.close();
      }
    });
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    res.status(500).json({ error: "Ошибка при выполнении запроса" });
  }
});

module.exports = app;