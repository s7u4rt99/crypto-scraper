// const { API_KEY, API_SECRET } = require("./secret");
const ccxt = require("ccxt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const exchangeId = "ftx",
  exchangeClass = ccxt[exchangeId],
  exchange = new exchangeClass({
    apiKey: process.env.API_KEY,
    secret: process.env.API_SECRET,
  });

let totalCount = 0;

async function main() {
  console.log(new Date());
  const since = new Date().getTime() - 24 * 60 * 60 * 7 * 1000;

  let count = 0;
  // fetch data from one week ago
  let resultETH = (
    await exchange.fetchOHLCV("ETH/USD", "1h", since, 24 * 7)
  ).map((x) => {
    count++;
    return {
      id: count,
      coin: "ETH/USD",
      date: new Date(x[0]),
      open: x[1],
      high: x[2],
      low: x[3],
      close: x[4],
      volume: x[5],
    };
  });
  let resultSUSHI = (
    await exchange.fetchOHLCV("SUSHI/USD", "1h", since, 24 * 7)
  ).map((x) => {
    count++;
    return {
      id: count,
      coin: "SUSHI/USD",
      date: new Date(x[0]),
      open: x[1],
      high: x[2],
      low: x[3],
      close: x[4],
      volume: x[5],
    };
  });
  let resultBTC = (
    await exchange.fetchOHLCV("BTC/USD", "1h", since, 24 * 7)
  ).map((x) => {
    count++;
    return {
      id: count,
      coin: "BTC/USD",
      date: new Date(x[0]),
      open: x[1],
      high: x[2],
      low: x[3],
      close: x[4],
      volume: x[5],
    };
  });

  console.log(resultETH);
  console.log(resultSUSHI);
  console.log(resultBTC);

  totalCount = resultETH.length + resultBTC.length + resultSUSHI.length;
  // seed db
  console.log("Seeding started...");

  await Promise.all([
    upload(resultETH),
    upload(resultSUSHI),
    upload(resultBTC),
  ]).then((data) => {
    console.log("Seeding completed.");
  });
}

let uploadCount = 0;

async function upload(data) {
  while (data.length > 0) {
    const chunk = data.splice(0, 21);
    await Promise.all(
      chunk.map(async (result) => {
        await prisma.exchangeRates.upsert({
          where: { id: result.id },
          update: result,
          create: result,
        });
      })
    )
      // console.log(uploading);
      .then((data) => {
        uploadCount += chunk.length;
        console.log(uploadCount + "/" + totalCount + " done");
      });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
