const rollupServer = process.env.ROLLUP_HTTP_SERVER_URL;
console.log(`HTTP rollup_server url is ${rollupServer}`);
import { create } from "ipfs-http-client";

import PDFDocument from "pdfkit";
const apiUrl = process.env.IPFS_API || "http://127.0.0.1:5001";
const ipfs = create({ url: apiUrl });

const statePath = "/state";

const company = "cartesi";
const employee = "jj";
const country = "India";

const CreateContract = async (imgurl) => {
  try {
    console.log("creating a contract");
    const doc = new PDFDocument();
    await writeFileIpfs(`${statePath}/signature.png`, imgurl);
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      let pdfData = Buffer.concat(buffers);
      const uarr = new Uint8Array(pdfData.buffer);
      console.log("final pdf data is:", uarr);
      await writeFileIpfs(`${statePath}/contract.pdf`, uarr);
      await finishTx();
    });

    console.log("starting....");

    doc.image("./CarteSign.png", 150, 0, { width: 300 });
    doc.moveDown(3);

    doc
      .fillColor("Black")
      .fontSize(15)
      .font("Helvetica-Bold")
      .text("Employment Contract", { align: "center" });
    doc.moveDown(3);
    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        `This contract, dated on the  day of  in the year, is made between ${company} and ${employee} This document constitutes an employment agreement between these two parties and is governed by the laws of ${country}.`
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        "WHEREAS the Employer desires to retain the services of the Employee, and the Employee desires to render such services, these terms and conditions are set forth"
      );
    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        "IN CONSIDERATION of this mutual understanding, the parties agree to the following terms and conditions"
      );

    doc.moveDown(2);

    doc.font("Helvetica").fontSize(9).text();
    doc
      .fillColor("Black")
      .fontSize(15)
      .font("Helvetica-Bold")
      .text("1. Employment", { align: "left" });
    doc.moveDown(2);

    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        "The Employee agrees that they will faithfully and to the best of their ability to carry out the duties and responsibilities communicated to them by the Employer. The Employee shall comply with all company policies, rules, and procedures at all times."
      );
    console.log("adding signature");

    doc.image(imgurl, { width: 300 });
    doc.end();
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

// Function to perform GET request
const getTx = async () => {
  try {
    console.log("fetching txn");
    const response = await fetch(`${rollupServer}/get_tx`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const content = await response.json(); // or .json() if you expect JSON response
    console.log(`Got tx ${content}`);

    return content; // This might be useful if you want to do something with the response
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
  }
};

// Function to perform GET request
const getData = async (namespace, hash) => {
  try {
    console.log("fetching data");
    const response = await fetch(
      `${rollupServer}/get_data/${namespace}/${hash}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const content = await response.arrayBuffer(); // or .json() if you expect JSON response

    return content; // This might be useful if you want to do something with the response
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
  }
};

const hint = async (str) => {
  try {
    console.log("fetching hint");
    const response = await fetch(`${rollupServer}/hint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: new TextEncoder().encode(str), // Encode the string as UTF-8
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.text();
    console.log("Success:", responseData);
  } catch (error) {
    console.error("Error:", error);
  }
};

// Function to perform POST request
const finishTx = async () => {
  try {
    console.log("finishing tx");
    const response = await fetch(`${rollupServer}/finish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // Empty JSON object as per original script
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(`Finish tx request sent.`);
  } catch (error) {
    console.error(`Error finishing tx: ${error.message}`);
  }
};

const existFileIpfs = async (path) => {
  try {
    console.log("cheching if data exists");
    await ipfs.files.stat(path);
    return true;
  } catch (error) {
    if (error.message.includes("file does not exist")) return false;
    throw error;
  }
};
const readFileIpfs = async (path) => {
  try {
    console.log("reading ipfs files");
    const chunks = [];
    for await (const chunk of ipfs.files.read(path)) {
      chunks.push(chunk);
    }
    const data = Buffer.concat(chunks).toString();
    return data;
  } catch (error) {
    if (error.message.includes("file does not exist")) return "";
    throw error;
  }
};

const writeFileIpfs = async (path, data) => {
  const exist = await existFileIpfs(path);
  if (exist) await ipfs.files.rm(path); // Remove file if exists (if new data is less than old data, the old data will remain in the file)
  console.log("writing file");
  await ipfs.files.write(path, data, { create: true });
};

// Execute the functions
(async () => {
  try {
    if (!(await existFileIpfs(`${statePath}`))) {
      await ipfs.files.mkdir(`${statePath}`);
    }

    const txresponse = await getTx();

    if (txresponse.data === undefined) {
      console.log("need input data");
      process.exit(1);
    }
    if (txresponse.version != 3) {
      console.log("input from previous version found");
      process.exit(1);
    }
    console.log("tx is: " + txresponse.data);

    await CreateContract(txresponse.data);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
