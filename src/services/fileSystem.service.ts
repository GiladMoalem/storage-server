import fs from "fs/promises";
import path from "path";
import { config } from "../config/env.js";
import { dir } from "console";

// export const ls = (path: string) => {
//   return new Promise((resolve) => {
//     fs.readdir(`${config.nasPath}\\${path}`, (err, files) => {
//       if (err) {
//         console.log("error: ", err);
//       }
//       console.log(files);
//       resolve(files);
//     });
//   });
// };
const getLocalPath = (...paths: string[]): string => {
  return path.join(config.nasPath, ...paths);
};

const getRelativePath = (localPath: string): string => {
  return path.relative(config.nasPath, localPath);
};

export const ls = (path: string): Promise<string[]> => {
  return fs.readdir(getLocalPath(path));
};

export async function readDirWithStat(dirPath: string) {
  const filesNamesList: string[] = await ls(dirPath);

  const filesObj = filesNamesList.map(async (fileName: string) => {
    const FileStat = await fs.stat(getLocalPath(dirPath, fileName));
    return {
      size: FileStat.size,
      blksize: FileStat.blksize,
      path: path.join(dirPath, fileName),
      name: fileName,
      isDirectory: FileStat.isDirectory(),
    };
  });
  return await Promise.all(filesObj);
}

export const createDir = async (dirPath: string, newDirName: string) => {
  try {
    const newDirLocalPath = getLocalPath(dirPath, newDirName);
    await fs.mkdir(newDirLocalPath);
    return true;
  } catch (err: any) {
    console.log("error while creating a directory", {
      dirPath: dirPath,
      newDirName: newDirName,
      err,
    });

    if (err.code === "EEXIST") {
      console.log("Directory already exists");
    } else {
      console.log("Other error", err);
    }
    return false;
  }
};

export const writeFile = async (
  path: string,
  file_name: string,
  data: string,
) => {
  const newFileLocalPath = getLocalPath(path, file_name);

  await fs.writeFile(newFileLocalPath, data);
  return true;
};

export const readFile = async (filePath: string) => {
  const fileLocalPath = getLocalPath(filePath);
  const content = await fs.readFile(fileLocalPath, { encoding: "utf8" });
  return content;
};

export const updateDirName = async (dirPath: string, newDirName: string) => {
  const parentDir = path.dirname(dirPath);

  const oldDirLocalPath = getLocalPath(dirPath);
  const newDirLocalPath = getLocalPath(parentDir, newDirName);
  await fs.rename(oldDirLocalPath, newDirLocalPath);
  return { oldPath: dirPath, newPath: getRelativePath(newDirLocalPath) };
};

export const updateFileName = async (filePath: string, newFileName: string) => {
  const parentDir = path.dirname(filePath);
  const oldFileLocalPath = getLocalPath(filePath);
  const newFileLocalPath = getLocalPath(parentDir, newFileName);
  await fs.rename(oldFileLocalPath, newFileLocalPath);
  return { oldPath: filePath, newPath: getRelativePath(newFileLocalPath) };
};

export const deleteItem = async (itemPath: string) => {
  const localPath = getLocalPath(itemPath);
  await fs.rm(localPath, { recursive: true, force: true });
  return true;
};
