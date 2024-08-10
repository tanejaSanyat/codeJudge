import { Editor } from "@monaco-editor/react";
import axios from "axios";
import { useState } from "react";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Compiler = () => {

  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
//   const [ipath, setIpath] = useState("");
//   const [opath, setOpath] = useState("");

  const [code, setCode] = useState(`#include <iostream>
    using namespace std;
    #define ll long long int
    
    int main()
    {
    
        int _;
        cin >> _;
        while (_--)
        {
          cout<<"Hello World";
        }
        return 0;
    }
    `);

  const handleRunCode = async () => {
    try {
      setOutput("Running code...");
      const response = await axios.post(`${BASE_URL}/run`, {
        language,
        code,
        // pretestIp,
      });

      if (response.data.code) {
        setOutput(response.data.error);
      } else {
        setOutput(response.data.output);
      }
    } catch (error) {
      const parsedErr = JSON.parse(error.request.response);
      setOutput(`Error: ${parsedErr.error}`);
    }
  };


  return (
    <div className="w-3/5 flex flex-col p-4">
      <div className="mb-2">
        <select
          className="w-full p-2 border border-gray-300 rounded bg-gray-800 text-white"
          onChange={(e) => {
            setLanguage(e.target.value);
            if (e.target.value === "python") setCode(`print("hello World")`);
            else if (e.target.value === "java")
              setCode(`import java.util.Arrays;
import java.util.Scanner;

public class Main {
public static void main(String[] args) {
  //code here
  System.out.println("Hello world");
}
}
`);
            else {
              setCode(`#include <bits/stdc++.h>
using namespace std;
#define ll long long int

int main()
{

int _;
cin >> _;
while (_--)
{
  cout<<"Hello World";
}
return 0;
}
`);
            }
          }}
          value={language}
        >
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
        </select>
      </div>
      <Editor
        height="70vh"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value)}
        options={{
          selectOnLineNumbers: true,
          automaticLayout: true,
        }}
      />
             <div className="flex mt-2">
          <button
            className="flex-1 py-2 px-4 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600 transition duration-300"
            onClick={handleRunCode}
          >
            Run
          </button>
         
        </div>
        <div className="mt-2">
          <h3 className="text-lg font-bold">Output</h3>
          <pre className="p-2 border border-gray-300 rounded bg-gray-800 text-white max-h-40 overflow-y-auto">
            {output}
          </pre>
        </div>
    </div>
  );
};

export default Compiler;
