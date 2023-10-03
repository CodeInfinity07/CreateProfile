const fs = require("fs");

const ids = [];

const file = fs.readFileSync("completed_profile.txt", "utf-8");
const lines = file.trim().split("\n");

for (const line of lines) {
  const cookie = JSON.parse(line.trim());
  for (const c of cookie) {
    if (c.name === "c_user") {
      ids.push(c.value);
    }
  }
}

const newArray = [...new Set(ids)];

fs.writeFileSync("filtered.txt", newArray.join("\n"));
