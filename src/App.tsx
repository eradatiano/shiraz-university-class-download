import { useEffect, useState } from "react";
import { Home, Rotate, ShirazIcon } from "./icons";
import { toPersianNumbers } from "./toPersianNumbers";

// const name = {
//   info: {
//     title: "مدار منطقی",
//     year: "نیم سال اول 1403",
//     teachar: "خلفی",
//     group: "1",
//   },
//   Meetings: [
//     {
//       class: 1,
//       url: "http:/1/",
//       date: "1403/1/1",
//     },
//     {
//       class: 2,
//       url: "http:/2/یبشیسب",
//       date: "1403/2/1",
//     },
//     {
//       class: 3,
//       url: "http:/3/",
//       date: "1403/3/1",
//     },
//     {
//       class: 4,
//       url: "http:/4/",
//       date: "1403/4/1",
//     },
//     {
//       class: 5,
//       url: "http:/5/",
//       date: "1403/5/1",
//     },
//     {
//       class: 6,
//       url: "http:/6/",
//       date: "1403/6/1",
//     },
//     {
//       class: 7,
//       url: "http:/7/",
//       date: "1403/7/1",
//     },
//     {
//       class: 8,
//       url: "http:/8/",
//       date: "1403/8/1",
//     },
//     {
//       class: 9,
//       url: "http:/9/",
//       date: "1403/9/1",
//     },
//     {
//       class: 10,
//       url: "http:/10/",
//       date: "1403/2/1",
//     },
//     {
//       class: 11,
//       url: "http:/11/",
//       date: "1403/2/1",
//     },
//     {
//       class: 12,
//       url: "http:/12/",
//       date: "1403/2/1",
//     },
//   ],
// };
// interface Value {
//   info: {
//     title: string;
//     year: string;
//     teachar: string;
//     group: string;
//   };
//   Meetings: {
//     class: number;
//     url: string;
//     date: string;
//   }[];
// }
interface Data {
  url: string;
  html: string;
  title: string | null | undefined;
  group: string | null | undefined;
  teacher: string | undefined;
  year: string | null | undefined;
}

interface AllClassInfo {
  url: string;
  classInfo: {
    title: string | null | undefined;
    year: string | null | undefined;
    teacher: string | undefined;
    group: string | null | undefined;
  };
  allSessions: {
    class: number;
    url: string;
    date: string;
  }[];
}

function App() {
  const [value, setValue] = useState<AllClassInfo | null>(null);
  const [urls, setUrls] = useState<string[]>([]);
  const allClassInfo: AllClassInfo = {
    url: "",
    classInfo: {
      title: "",
      year: "",
      teacher: "",
      group: "",
    },
    allSessions: [],
  };

  let lengthAllSessions: number = 0;

  if (value?.allSessions.length) {
    lengthAllSessions = value?.allSessions.length / 2;
  }

  const convertNumbers = function (input: string): string {
    let charUnicode: number[] = [];
    let englishNum: string = "";
    for (let i = 0; i < input.length; i++)
      charUnicode.push(input[i].charCodeAt(0));

    charUnicode = charUnicode.map((code) => {
      return Number((englishNum += code - 1776));
    });
    return englishNum;
  };

  const SemesterToNum = function (semester: string): 1 | 2 | void {
    const firstInUni: number[] = [1575, 1608, 1604];
    const secondInUni: number[] = [1583, 1608, 1605];
    const semesterUnicode: number[] = [];
    for (let i = 0; i < semester.length; i++) {
      semesterUnicode.push(semester[i].charCodeAt(0));
    }

    let f: number = 1;
    let s: number = 1;
    for (let i = 0; i < semesterUnicode.length; i++) {
      if (semesterUnicode[i] === firstInUni[i]) f *= 1;
      else f *= 0;
      if (semesterUnicode[i] === secondInUni[i]) s *= 1;
      else s *= 0;
    }

    if (f === 1) return f;
    if (s === 1) return s;

    // if (f !== 0 && s !== 0) return //new Error("there is some problem in semester");
  };
  const makeUrls = function (
    classId: string,
    year: number,
    semester: number
  ): string {
    const downloadUrl: string = `https://offline.shirazu.ac.ir/${year}${semester}/${classId}.zip`;
    return downloadUrl;
  };
  const classExtractor = (data: Data) => {
    const year = convertNumbers(data.year?.split(" ")[2] || "0");

    const semester = SemesterToNum(data.year?.split(" ")[0] || "");

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
      const url = makeUrls(sessionCode, Number(year), Number(semester));

      const info = {
        class: n,
        url: url,
        date: date,
      };
      allSessions.push(info);
    }
    allClassInfo.url = data.url;
    allClassInfo["classInfo"] = classInfo;
    allClassInfo["allSessions"] = allSessions;
    return allClassInfo;
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id || 0 },
          func: () => {
            const data = {
              url: window.location.href,
              html: document.documentElement.outerHTML,
              title: document.querySelector("#edCourseName")?.textContent,
              group: document.querySelector("#edCourseGroup")?.textContent,
              teacher: document
                .querySelector("#edTchName")
                ?.textContent?.split("(")[0],
              year: document.querySelector("#edSemester")?.textContent,
            };
            return data;
          },
        },
        (results) => {
          // extract classes id
          if (results && results[0].result) {
            const data = results[0].result;
            const result = classExtractor(data);
            setValue(result);
          } else {
            console.log("No results found");
          }
        }
      );
    });
  }, []);

  return (
    <main className="relative w-[400px] p-4 flex flex-col items-center justify-center  h-full gap-y-6 rounded-xl outline-4 outline-blue-600 shadow-lg">
      <div className="absolute top-4 left-4 w-10 h-10 rounded-2xl bg-blue-400 text-white flex items-center justify-center shadow-lg shadow-blue-300">
        <Home width={30} height={30} />
      </div>
      <ShirazIcon width={120} height={120} />
      {value?.allSessions.length ? (
        <>
          <div className="flex items-center justify-between flex-wrap w-full gap-y-4">
            <div className="flex items-center justify-start gap-x-2 w-1/2">
              <h2 className="text-[.9rem] font-extrabold text-slate-700">
                درس :{" "}
              </h2>
              <p className="text-[.8rem] font-semibold text-slate-500">
                {value.classInfo.title}
              </p>
            </div>
            <div className="flex items-center justify-start gap-x-2 w-1/2">
              <h2 className="text-[.9rem] font-extrabold text-slate-700">
                استاد :{" "}
              </h2>
              <p className="text-[.8rem] font-semibold text-slate-500">
                {value.classInfo.teacher}
              </p>
            </div>
            <div className="flex items-center justify-start gap-x-2 w-1/2">
              <h2 className="text-[.9rem] font-extrabold text-slate-700">
                سال :{" "}
              </h2>
              <p className="text-[.8rem] font-semibold text-slate-500">
                {value.classInfo.year}
              </p>
            </div>
            <div className="flex items-center justify-start gap-x-2 w-1/2">
              <h2 className="text-[.9rem] font-extrabold text-slate-700">
                گروه :{" "}
              </h2>
              <p className="text-[.8rem] font-semibold text-slate-500">
                {value.classInfo.group}
              </p>
            </div>
          </div>
          <h2 className="text-[1.2rem] font-black text-blue-500 w-full text-right">
            {" "}
            جلسه های موجود 🫡
          </h2>
          <div className="flex flex-row items-start justify-between">
            <div className="flex flex-col  items-start justify-start  flex-wrap  w-1/2  gap-y-3">
              {value.allSessions.map((item) => {
                return (
                  <>
                    <div
                      key={item.class}
                      className={` items-center justify-start pl-1 w-full gap-x-2 ${
                        item.class <= Math.ceil(lengthAllSessions)
                          ? "flex"
                          : "hidden"
                      }`}
                    >
                      <input
                        id={item.url}
                        type="checkbox"
                        value={item.url}
                        className="hidden"
                        checked={urls.includes(item.url)}
                        onChange={(e) => {
                          const url = e.target.value;
                          if (!urls.includes(url)) {
                            setUrls((prevUrls) => [...prevUrls, url]);
                          } else {
                            setUrls((prevUrls) =>
                              prevUrls.filter((value) => value !== url)
                            );
                          }
                        }}
                      />
                      <span
                        onClick={() => {
                          const url = item.url;
                          if (!urls.includes(url)) {
                            setUrls((prevUrls) => [...prevUrls, url]);
                          } else {
                            setUrls((prevUrls) =>
                              prevUrls.filter((value) => value !== url)
                            );
                          }
                        }}
                        className={`text-[.7rem] cursor-pointer w-[1.15rem] h-[1.15rem] rounded-[.4rem] flex items-end justify-center text-white  border border-blue-300 shadow-lg shadow-blue-300 ${
                          urls.includes(item.url) ? "bg-blue-500" : ""
                        }`}
                      >
                        {urls.includes(item.url) && (
                          <p className="w-full flex items-center justify-center translate-y-[.1rem] font-bold">
                            ✓
                          </p>
                        )}
                      </span>
                      <label
                        htmlFor={item.url}
                        className="flex items-center gap-x-1 cursor-pointer"
                      >
                        <p className="flex text-[.85rem] text-slate-600 items-center font-black gap-x-1">
                          جلسه{" "}
                          <span className="text-blue-600 text-[.85rem]">
                            {item.class.toLocaleString("fa")}
                          </span>
                        </p>
                        <p className="flex text-[.7rem] text-slate-500 items-center font-semibold gap-x-1">
                          تاریخ
                          <span className="text-blue-500 text-[.7rem] font-semibold tracking-widest">
                            {toPersianNumbers(item.date)}
                          </span>
                        </p>
                      </label>
                    </div>
                  </>
                );
              })}
            </div>
            <div className="flex flex-col  items-start justify-start  flex-wrap  w-1/2  gap-y-3">
              {value.allSessions.map((item) => {
                return (
                  <>
                    <div
                      key={item.class}
                      className={` items-center justify-start pl-1 w-full gap-x-2 ${
                        item.class > Math.ceil(lengthAllSessions)
                          ? "flex"
                          : "hidden"
                      }`}
                    >
                      <input
                        id={item.url}
                        type="checkbox"
                        value={item.url}
                        className="hidden"
                        checked={urls.includes(item.url)}
                        onChange={(e) => {
                          const url = e.target.value;
                          if (!urls.includes(url)) {
                            setUrls((prevUrls) => [...prevUrls, url]);
                          } else {
                            setUrls((prevUrls) =>
                              prevUrls.filter((value) => value !== url)
                            );
                          }
                        }}
                      />
                      <span
                        onClick={() => {
                          const url = item.url;
                          if (!urls.includes(url)) {
                            setUrls((prevUrls) => [...prevUrls, url]);
                          } else {
                            setUrls((prevUrls) =>
                              prevUrls.filter((value) => value !== url)
                            );
                          }
                        }}
                        className={`text-[.7rem] cursor-pointer w-[1.15rem] h-[1.15rem] rounded-[.4rem] flex items-end justify-center text-white  border border-blue-300 shadow-lg shadow-blue-300 ${
                          urls.includes(item.url) ? "bg-blue-500" : ""
                        }`}
                      >
                        {urls.includes(item.url) && (
                          <p className="w-full flex items-center justify-center translate-y-[.1rem] font-bold">
                            ✓
                          </p>
                        )}
                      </span>
                      <label
                        htmlFor={item.url}
                        className="flex items-center gap-x-1 cursor-pointer"
                      >
                        <p className="flex text-[.85rem] text-slate-600 items-center font-black gap-x-1">
                          جلسه{" "}
                          <span className="text-blue-600 text-[.85rem]">
                            {item.class.toLocaleString("fa")}
                          </span>
                        </p>
                        <p className="flex text-[.7rem] text-slate-500 items-center font-semibold gap-x-1">
                          تاریخ
                          <span className="text-blue-500 text-[.7rem] font-semibold tracking-widest">
                            {toPersianNumbers(item.date)}
                          </span>
                        </p>
                      </label>
                    </div>
                  </>
                );
              })}
            </div>
          </div>

          <div className="w-full flex items-center justify-between ">
            <div className="flex items-center justify-start pl-4 w-1/2 gap-x-2">
              <input
                id="all"
                type="checkbox"
                value={value.allSessions.map((item) => item.url)}
                className="hidden"
                checked={urls.length === value.allSessions.length}
                onChange={() => {
                  if (urls.length !== value.allSessions.length) {
                    setUrls(value.allSessions.map((item) => item.url));
                  } else {
                    setUrls([]);
                  }
                }}
              />
              <span
                onClick={() => {
                  if (urls.length !== value.allSessions.length) {
                    setUrls(value.allSessions.map((item) => item.url));
                  } else {
                    setUrls([]);
                  }
                }}
                className={`text-[.7rem] cursor-pointer w-[1.6rem] h-[1.6rem] rounded-[.4rem] flex items-end justify-center text-white  border border-blue-300 shadow-lg shadow-blue-300 ${
                  urls.length === value.allSessions.length ? "bg-blue-500" : ""
                }`}
              >
                {urls.length === value.allSessions.length && (
                  <p className="w-full flex items-center justify-center translate-y-[.25rem] text-lg font-bold">
                    ✓
                  </p>
                )}
              </span>
              <label
                htmlFor="all"
                className="flex items-center gap-x-1 cursor-pointer"
              >
                <p className="flex text-[1rem] text-slate-700 items-center font-bold ">
                  همه جلسه ها
                </p>
              </label>
            </div>
            <button
              onClick={() => {
                urls.forEach((url) => {
                  chrome.tabs.create({ url: url });
                });
              }}
              className="w-1/2 bg-blue-500 text-white font-black text-[1.2rem] py-2 rounded-3xl shadow-lg shadow-blue-300"
            >
              دانلود
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-x-4">
          <p className="text-blue-500 text-xl font-black">
            چیزی پیدا نشد ! 😮{" "}
          </p>
          <button>
            <Rotate width={30} height={30} />
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
