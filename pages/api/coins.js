import prisma from "../../lib/prisma";
import moment from "moment";

export default async function handler(req, res) {
  try {
    const httpMethod = req.method;
    if (httpMethod === "POST") {
      await handleFilter(req, res);
    } else if (httpMethod === "GET") {
      let minDateResult = await prisma.exchangeRates.findMany({
        take: 1,
        orderBy: {
          date: "asc",
        },
      });

      let maxDateResult = await prisma.exchangeRates.findMany({
        take: 1,
        orderBy: {
          date: "desc",
        },
      });
      res.status(200).json({
        minDate: minDateResult[0].date,
        maxDate: maxDateResult[0].date,
      });
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${httpMethod} Not Allowed`);
    }
  } catch (err) {
    res.status(500).json(err.toString());
  }
}

async function handleFilter(req, res) {
  const { coins, startDate, endDate } = JSON.parse(req.body);
  let result = await prisma.exchangeRates.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      id: "asc",
    },
  });
  result = result.filter((x) => coins.includes(x.coin));
  result = result.map((x) => {
    return {
      id: x.id,
      coin: x.coin,
      date: x.date,
      open: x.open,
      high: x.high,
      low: x.low,
      close: x.close,
      volume: x.volume,
    };
  });
  res.status(200).json(result);
}
