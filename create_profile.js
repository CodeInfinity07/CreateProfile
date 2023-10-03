const puppeteer = require("puppeteer");
const fs = require("fs");

let iterator = 0;

let name_arr = [
  "Freeplay Gaming",
  "Game Vault Freeplay",
  "Orion Star Freeplay",
  "Firekirin Freeplay",
  "Orion Star Gaming",
];

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
      headless: "new",
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

      await page.goto("https://www.facebook.com/profile/create");
      await sleep(3000);
      const [get_started] = await page.$x(
        `/html/body/div[1]/div/div[1]/div/div[4]/div/div/div[1]/div/div[2]/div/div/div/div[2]/div[3]/div/div/div[1]/div/span/span`
      );
      await get_started.click();
      const inputElements = await page.$$("input");
      const inputCount = inputElements.length;
      if (inputCount === 9) {
        const [name_element] = await page.$x("(//input)[4]");
        await name_element.type(name);
      } else if (inputCount === 10) {
        const [name_element] = await page.$x("(//input)[5]");
        await name_element.type(name);
      }
      await sleep(5000);
      const [continue_element] = await page.$x(
        `/html/body/div[1]/div/div[1]/div/div[3]/div/div/div/div[1]/div[1]/div[1]/div/div[3]/div/div/div/div[1]/div/span/span`
      );
      continue_element.click();
      await sleep(1000);
      const [create_element] = await page.$x(
        `/html/body/div[1]/div/div[1]/div/div[3]/div/div/div/div[1]/div[1]/div[1]/div/div[3]/div/div/div/div[1]/div/span/span`
      );
      await Promise.all([page.waitForNavigation(), create_element.click()]);
      const new_cookies = await page.cookies();
      fs.appendFileSync(
        "profile_1_cookies.txt",
        JSON.stringify(new_cookies) + "\n"
      );
      await browser.close();
      iterator++;
      console.log(
        `Successfully created Profile ${iterator} with Name: ${name}`
      );
      resolve("ok");
    } catch (error) {
      iterator++;
      console.log(`Failed creating Profile ${iterator}`);
      fs.appendFileSync("failed_cookies.txt", String(cookies) + "\n");
      await browser.close();
      reject("Failed");
    }
  });
}

async function start() {
  const dataCookies = fs.readFileSync("cookies.txt", "utf-8");
  const linesCookies = dataCookies.trim().split("\n");
  for (const cookies of linesCookies) {
    try {
      await createProfile(cookies);
    } catch (err) {}
  }
  process.exit();
}

start();
