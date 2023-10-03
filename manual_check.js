const puppeteer = require("puppeteer");
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let iterator = 0;

let name_arr = [
  "Fireplay Gaming",
  "Freeplay Gaming",
  "Game Vault Freeplay",
  "Orion Star Freeplay",
  "Firekirin Freeplay",
  "Orion Star Gaming",
];

async function getInput() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Please enter Y to save Cookies and N to save Failed Cookies: ",
      (userInput) => {
        rl.close();
        resolve(userInput);
      }
    );
  });
}

async function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("ok");
    }, time);
  });
}

function getRandomElement(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

async function createProfile(cookies) {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      permissions: {
        notifications: "denied",
      },
    });
    const context = browser.defaultBrowserContext();
    context.overridePermissions("https://www.facebook.com", [
      "geolocation",
      "notifications",
    ]);
    const page = await browser.newPage();

    try {
      const my_cookies = JSON.parse(cookies.trim());
      for (const cookie of my_cookies) {
        await page.setCookie(cookie);
      }

      const name = getRandomElement(name_arr);

      await page.goto("https://mbasic.facebook.com/messages");
      await sleep(2000)
      await browser.close();
      resolve("ok");
    } catch (error) {
      await browser.close();
      reject("Failed");
    }
  });
}

async function start() {
  const dataCookies = fs.readFileSync("completed_profile.txt", "utf-8");
  const linesCookies = dataCookies.trim().split("\n");
  for (const cookies of linesCookies) {
    try {
      await createProfile(cookies);
    } catch (err) {}
  }
}

start();
