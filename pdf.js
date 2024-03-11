import fs from "fs";
import PDFDocument from "pdfkit";
import { Base64Encode } from "base64-stream";
const doc = new PDFDocument();
const company = "cartesi";
const employee = "jj";
const country = "India";
//doc.pipe(fs.createWriteStream("Contract.pdf"));
var finalString = ""; // contains the base64 string
var stream = doc.pipe(new Base64Encode());

const date = new Date();
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
    `This contract, dated on the ${date.getDay()} day of ${date.getMonth()} in the year ${date.getFullYear()}, is made between ${company} and ${employee} This document constitutes an employment agreement between these two parties and is governed by the laws of ${country}.`
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

doc.end();
doc.image("./CarteSign.png", 150, 0, { width: 300 });

const data = doc.read();
console.log(data.toString("base64"));
stream.on("data", function (chunk) {
  finalString += chunk;
});

stream.on("end", function () {
  // the stream is at its end, so push the resulting base64 string to the response
  console.log(finalString);
  finalString = finalString;
});

fs.writeFileSync("./contract.txt", finalString);
