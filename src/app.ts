import express from "express";
import {
  ls,
  readDirWithStat,
  createDir,
  writeFile,
  readFile,
  updateDirName,
  updateFileName,
  deleteItem,
} from "./services/fileSystem.service.js";
import { config } from "./config/env.js";
import { sendSuccessResponse, sendErrorResponse } from "./utils/responses.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello world!");
});

app.get("/download", (req, res) => {
  const filePath = `${config.nasPath}\\readme.txt`;
  res.download(filePath);
});

// crud
// create a directory
app.post("/directory", async (req, res) => {
  const { path } = req.query;
  if (typeof path !== "string") {
    return res.status(400).send({ error: "path must be a string" });
  }

  const { dir_name } = req.body;
  if (typeof dir_name !== "string") {
    return res.status(400).send({ error: "dir_name must be a string" });
  }

  console.log("body.dir_name:", req.body.dir_name);
  if (!(await createDir(path, dir_name))) {
    return res.status(500).send({ error: "internal error" });
  }
  return res.send(req.body.dir_name);
});

// create a file
app.post("/file", (req, res) => {
  const { path } = req.query;
  if (typeof path !== "string") {
    return res.status(400).send({ error: "path must be a string" });
  }
  console.log(req.body.file_name);
  console.log(req.body.data);

  const { file_name } = req.body;
  if (typeof file_name !== "string") {
    return res.status(400).send({ error: "file_name must be a string" });
  }

  const { data } = req.body;
  if (typeof data !== "string") {
    return res.status(400).send({ error: "data must be a string" });
  }
  try {
    writeFile(path, file_name, data);
    return sendSuccessResponse(
      res,
      { file_name, path },
      "File created successfully",
    );
  } catch (err: any) {
    return sendErrorResponse(res, err.message, "FILE_CREATION_FAILED", 500);
  }
});

// read a file
app.get("/file", async (req, res) => {
  const { path } = req.query;
  if (typeof path !== "string") {
    // when it happen?
    return res.status(400).send({ error: "path must be a string" });
  }

  try {
    const fileContent = await readFile(path);
    return sendSuccessResponse(
      res,
      { content: fileContent },
      "successfully read the file",
    );
  } catch (error: any) {
    return sendErrorResponse(res, error.message, "FAIL_READ_FILE", 500);
  }
});

// read a directory content
app.get("/directory", async (req, res) => {
  const { path } = req.query;
  if (typeof path !== "string") {
    // when it happen?
    return res.status(400).send({ error: "path must be a string" });
  }

  console.log(path);
  const dirContent = await readDirWithStat(path);
  console.log("res:", dirContent);
  res.send(dirContent);
});

// update directory name
app.put("/directory", async (req, res) => {
  const { path } = req.query;
  if (typeof path !== "string") {
    return res.status(400).send({ error: "path must be a string" });
  }

  const { new_dir_name } = req.body;
  if (typeof new_dir_name !== "string") {
    return res.status(400).send({ error: "new_dir_name must be a string" });
  }

  try {
    const { oldPath, newPath } = await updateDirName(path, new_dir_name);
    return sendSuccessResponse(
      res,
      { oldPath, newPath },
      "Directory renamed successfully",
    );
  } catch (error: any) {
    return sendErrorResponse(
      res,
      error.message,
      "DIRECTORY_RENAME_FAILED",
      500,
    );
  }
});

app.put("/file", async (req, res) => {
  const { path } = req.query;
  if (typeof path !== "string") {
    return res.status(400).send({ error: "path must be a string" });
  }

  const { new_file_name } = req.body;
  if (typeof new_file_name !== "string") {
    return res.status(400).send({ error: "new_file_name must be a string" });
  }

  try {
    const { oldPath, newPath } = await updateFileName(path, new_file_name);
    return sendSuccessResponse(
      res,
      { oldPath, newPath },
      "File renamed successfully",
    );
  } catch (error: any) {
    return sendErrorResponse(res, error.message, "FILE_RENAME_FAILED", 500);
  }
});

app.delete("/directory", async (req, res) => {
  const { path } = req.query;
  if (typeof path !== "string") {
    return res.status(400).send({ error: "path must be a string" });
  }

  try {
    await deleteItem(path);
    return sendSuccessResponse(res, { deletedPath: path }, "Directory deleted successfully");
  } catch (error: any) {
    return sendErrorResponse(res, error.message, "DIRECTORY_DELETE_FAILED", 500);
  }
});

app.delete("/file", async (req, res) => {
  const { path } = req.query;
  if (typeof path !== "string") {
    return res.status(400).send({ error: "path must be a string" });
  }

  try {
    await deleteItem(path);
    return sendSuccessResponse(res, { deletedPath: path }, "File deleted successfully");
  } catch (error: any) {
    return sendErrorResponse(res, error.message, "FILE_DELETE_FAILED", 500);
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:3000`);
});
