/**
 * @typedef { import("@prisma/client").PrismaClient } Prisma
 */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { APP_SECRET, chkUserId } from "../utils.js";
// file and path
import { finished } from "stream/promises";
import fs from "fs";
import fsPromises from 'node:fs/promises';
import path from "path";
import { fileURLToPath } from "url";
import { error } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_PATH = '../' + process.env.PUBLIC_PATH;

/**
 * @param {any} parent
 * @param {{ prisma: Prisma }} context
 */
async function allusers(parent, args, context) {
  if (chkUserId(context)){
  return await context.prisma.user.findMany();}
}
/**
 * @param {any} parent
 * @param {{ prisma: Prisma }} context
 */
async function getUserById(parent, args, context) {
  if (chkUserId(context)){
  const where = { user_id: args.user_id };

  const result = await context.prisma.user.findUnique({
    where,
  });
  return result;}
}
/**
 * @param {any} parent
 * @param {{ prisma: Prisma }} context
 */
async function getUserByName(parent, args, context) {
  if (chkUserId(context)){
    if (args.user_name){
      const where = { user_name: args.user_name }; 
      const result = await context.prisma.user.findUnique({
        where,
      });

      return result;
    }else{
      return null;
    }
    
  }
}

async function checktoken(parent, args, context) {
  return chkUserId(context);;
}
/**
 * @param {any} parent
 * @param {{ prisma: Prisma }} context
 */
async function signup(parent, args, context, info) {
  // 1
  const password = await bcrypt.hash(args.user_password, 10);

  // 2
  const user = await context.prisma.user.create({
    data: { ...args, user_password: password },
  });

  // 3
  const now = new Date();
  const Tlimit = now.getTime() + parseInt(process.env.TTL);
  const token = jwt.sign(
    {
      userId: user.user_name,
      userAc: user.active,
      userRole: user.role,
      expiry: Tlimit,
    },
    APP_SECRET
  );

  // 4
  return {
    token,
    user,
  };
}

/**
 * @param {any} parent
 * @param {{ prisma: Prisma }} context
 */
async function login(parent, args, context, info) {
  // 1
  const user = await context.prisma.user.findUnique({
    where: { user_name: args.user_name },
  });
  if (!user) {
    throw new Error("No such user found");
  }else if (user.active === 0) {
    throw new Error("Not active");
  }

  // 2
  const valid = await bcrypt.compare(args.user_password, user.user_password);
  if (!valid) {
    throw new Error("Invalid password");
  }
  const now = new Date();
  const Tlimit = now.getTime() + parseInt(process.env.TTL);
  const token = jwt.sign(
    {
      userId: user.user_name,
      userAc: user.active,
      userRole: user.role,
      expiry: Tlimit,
    },
    APP_SECRET
  );

  // 3
  return {
    token,
    user,
  };
}

/**
 * @param {any} parent
 * @param {{ prisma: Prisma }} context
 */
async function updateUser(parent, args, context) {
  if (chkUserId(context)){
    let tempArgs = { ...args };
    delete tempArgs.id;
    // const password = await bcrypt.hash(args.user_password, 10);
    // , user_password: password 
    try {
      const result = await context.prisma.user.update({
        where: { user_id: args.user_id },
        data: { ...tempArgs},
      });

      return result;
    } catch (e) {
      throw e
    }
  }
}

async function delUser(parent, args, context) {
  if (chkUserId(context)){
    const result = await context.prisma.user.delete({
      where: { user_id: args.user_id },
    });
    return result;
  }
}

/**
 * @param {any} parent
 * @param {{ prisma: Prisma }} context
 */
async function chkUserByName(parent, args, context) {
    const where = { user_name: args.user_name };
    const result = await context.prisma.user.findUnique({
      where,
      select: {
        user_name: true,
      },
    });

    return result;
}

async function changePASSWord(parent, args, context) {
  if (chkUserId(context)){
    const user = await context.prisma.user.findUnique({
      where: { user_id: args.user_id },
    });

    // 驗證2次輸入正確
    if(args.newpass !== args.chkpass){
      return "再次確認密碼不同";
    }
    // 非逕行變更則驗證舊密碼
    if (!args.enforce){
      const valid = await bcrypt.compare(args.oldpass, user.user_password);
      if(!valid){
        return "舊密碼錯誤";
      }
    }
    // 更新密碼
    const password = await bcrypt.hash(args.newpass, 10);
    try {
      const result = await context.prisma.user.update({
        where: { user_id: args.user_id },
        data: { user_password: password },
      });

      return "變更完成";
    } catch (e) {
      throw e
    }
  }
}

export default {
  allusers,
  getUserById,
  getUserByName,
  checktoken,
  signup,
  login,
  updateUser,
  delUser,
  chkUserByName,
  changePASSWord,
};
