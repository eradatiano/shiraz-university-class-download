let html;
const button = document.querySelector(".download-btn");
const classNumberInput = document.querySelector(".class-number-input");
const yearInput = document.querySelector(".year-input");
const semesterInput = document.querySelector(".semester-input");
const allClasses = {};

// Parse the html to extract class code
const classesIdExtractor = function (html) {
  const pattern = /(listOdd|listEven).*((\n.*){6}\n\t\t.*r\/(.*)\/')/g;
  const parsedHTML = [...html.matchAll(pattern)];
  // add classes_id to allClasses
  for (let i = 0; i < parsedHTML.length; i++) {
    const match = parsedHTML[i];
    allClasses[i + 1] = match[4];
  }
  return allClasses;
};

// control the input and make an array of classes numbers
const inputController = function () {
  const year = yearInput.value;
  const semester = semesterInput.value;
  // split class number input
  let requestedClasses = classNumberInput.value.split(" ");
  requestedClasses.map((classNum) => {
    if (classNum.includes("-")) {
      let [a, b] = classNum.split("-");
      [a, b] = [+a, +b];
      // prevent basic errors
      if (
        typeof a !== "number" ||
        typeof b !== "number" ||
        a > b ||
        b > Object.keys(allClasses).length
      )
        return;
      // add classes num in case of x-y feature
      for (let i = a; i < b + 1; i++) {
        requestedClasses.push(i);
      }
      output.textContent = `${a} , ${b}`;
    } else requestedClasses.push(+classNum);
  });
  // filter out strings from requestedClasses
  requestedClasses = requestedClasses.filter(
    (classNum) =>
      typeof classNum === "number" &&
      Object.keys(allClasses).includes(classNum.toString())
  );

  // console.log(requestedClasses); // LOGS:
  return [requestedClasses, year, semester];
};

// Make wanted class download urls and call it
const makeUrls = function (classesArray, year, semester) {
  for (const classNum of classesArray) {
    const classId = allClasses[classNum];
    console.log(classId);
    // making link
    let downloadUrl = `https://offline.shirazu.ac.ir/${year}${semester}/${classId}.zip`;
    console.log(downloadUrl);
    chrome.tabs.create({ url: downloadUrl });
  }

}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabs[0].id },
      func: () => {
        return {
          url: window.location.href,
          html: document.documentElement.outerHTML,
        };
      },
    },
    (results) => {
      html = results[0].result.html;
      const output = document.getElementById("output");
      classesIdExtractor(html); // extract classes id
      if (results && results[0].result) {
      } else {
        output.textContent = "Failed to retrieve information.";
      }
    }
  );
});

button.addEventListener("click", (e) => {
  const requestedClasses = inputController();
  makeUrls(...requestedClasses)
});
