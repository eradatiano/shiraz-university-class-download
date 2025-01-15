let html;
let allClassInfo = {};

const SemesterToNum = function (semester) {
  const firstInUni = [1575, 1608, 1604];
  const secondInUni = [1583, 1608, 1605];
  const semesterUnicode = [];
  for (let i = 0; i < semester.length; i++) {
    semesterUnicode.push(semester[i].charCodeAt(0));
  }

  let f = 1;
  let s = 1;
  for (let i = 0; i < semesterUnicode.length; i++) {
    if (semesterUnicode[i] === firstInUni[i]) f *= 1;
    else f *= 0;
    if (semesterUnicode[i] === secondInUni[i]) s *= 1;
    else s *= 0;
  }

  if (f === 1) return f;
  if (s === 1) return s;

  if (f !== 0 && s !== 0) return 0; //new Error("there is some problem in semester");
};

// Parse the html to extract class code
const classExtractor = function (data) {
  let year = convertNumbers(data.year.split(" ")[2]);
  let semester = data.year.split(" ")[0];
  semester = SemesterToNum(semester);

  // extract class info
  const classInfo = {
    title: data.title,
    year: data.year,
    teacher: data.teacher,
    group: data.group,
  };

  // (listOdd|listEven).*((\n\t\t.{4}(.*).{5}){2}(\n.*){4}\n.*r\/(.*)\/')
  // (listOdd|listEven).*((\n\t\t.{4}(.*>){0,1}(.*).{5}){2}(\n.*){4}\n.*r\/(.*)\/')
  // extract sessions code
  const pattern =
    /(listOdd|listEven).*((\n\t\t.{4}(.*>){0,1}(.*).{5}){2}(\n.*){4}\n.*r\/(.*)\/')/g;
  const allSessionsData = [...data.html.matchAll(pattern)];
  // make a list of all sessions
  const allSessions = [];
  let n = 0;
  for (let i = allSessionsData.length - 1; i >= 0; i--) {
    n++;
    const match = allSessionsData[i];
    const date = match[5];
    const sessionCode = match[7];
    const url = makeUrls(sessionCode, year, semester)

    const info = {
      class: n,
      url: url,
      date: date,
    };
    allSessions.push(info);
  }

  allClassInfo = {};
  allClassInfo.url = data.url;
  allClassInfo["classInfo"] = classInfo;
  allClassInfo["allSessions"] = allSessions;
  return allClassInfo;
};

// convert persian number to english
const convertNumbers = function (input) {
  let charUnicode = [];
  let englishNum = "";
  for (let i = 0; i < input.length; i++)
    charUnicode.push(input[i].charCodeAt(0));

  charUnicode = charUnicode.map((code) => {
    englishNum += code - 1776;
  });
  return englishNum;
};

// Make wanted class download urls
const makeUrls = function (classId, year, semester) {
  let downloadUrl = `https://offline.shirazu.ac.ir/${year}${semester}/${classId}.zip`;
  return downloadUrl
};

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabs[0].id },
      func: () => {
        const data = {
          url: window.location.href,
          html: document.documentElement.outerHTML,
          title: document.querySelector("#edCourseName").textContent,
          group: document.querySelector("#edCourseGroup").textContent,
          teacher: document
            .querySelector("#edTchName")
            .textContent.split("(")[0],
          year: document.querySelector("#edSemester").textContent,
        };
        return data;
      },
    },
    (results) => {
      data = results[0].result;
      const output = document.getElementById("output");
      classExtractor(data); // extract classes id

      if (results && results[0].result) {
      } else {
        output.textContent = "Failed to retrieve information.";
      }
    }
  );
});