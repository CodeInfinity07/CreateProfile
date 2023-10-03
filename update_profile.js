const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function getRandomFile(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        return reject(err);
      }

      if (files.length === 0) {
        return reject(new Error("No files found in the specified directory."));
      }

      const randomIndex = Math.floor(Math.random() * files.length);
      const randomFile = files[randomIndex];
      const filePath = path.join(directoryPath, randomFile);

      resolve(filePath);
    });
  });
}

async function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("ok");
    }, time);
  });
}

async function createProfile(cookies) {
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      permissions: {
        notifications: "denied",
      },
    });
    const context = browser.defaultBrowserContext();
    context.overridePermissions("https://facebook.com", [
      "geolocation",
      "notifications",
    ]);
    const page = await browser.newPage();

    try {
      const my_cookies = JSON.parse(cookies.trim());
      for (const cookie of my_cookies) {
        await page.setCookie(cookie);
      }
      await page.goto("https://mbasic.facebook.com");
      const newURL = await page.url();
      await sleep(2000);
      if (!newURL.includes("checkpoint")) {
        await page.goto("https://mbasic.facebook.com/profile_picture");
        await sleep(2000);
        const filePath = await getRandomFile("Pics/ProfilePics");
        await page.waitForSelector("input[type=file]");
        const input = await page.$("input[type=file]");
        await input.uploadFile(filePath);
        const submitButtonXPath = '//input[@type="submit"]';
        await page.waitForXPath(submitButtonXPath);
        const [submitButton] = await page.$x(submitButtonXPath);
        await Promise.all([page.waitForNavigation(), submitButton.click()]);
        fs.appendFileSync("completed_profile.txt", String(cookies) + "\n");
      }
      else {
        fs.appendFileSync("checkpoint.txt", String(cookies) + "\n");
      }
      await browser.close();
      resolve("ok");
    } catch (error) {
      console.log(error);
      await browser.close();
      reject("Failed");
    }
  });
}

async function start() {
  const dataCookies = fs.readFileSync("profile_1_cookies.txt", "utf-8");
  const linesCookies = dataCookies.trim().split("\n");
  for (const cookies of linesCookies) {
    try {
      await createProfile(cookies);
    } catch (err) {}
  }
}

start();
