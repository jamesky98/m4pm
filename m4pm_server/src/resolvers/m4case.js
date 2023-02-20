/**
 * @typedef { import("@prisma/client").PrismaClient } Prisma
 */
import { chkUserId } from "../utils.js";
/**
 * @param {any} parent
 * @param {{ prisma: Prisma }} context
 */
async function m4case(parent, args, context) {
  const result = await context.prisma.m4case.findUnique({
    where:{ id: parent.parent_id },
  });
  return result;
}

/**
 * @param {any} parent
 * @param {{ prisma: Prisma }} context
 */
async function other_m4case(parent, args, context) {
  const result = await context.prisma.m4case.findMany({
    where:{ parent_id: parent.id },
  });
  return result;
}

export default {
  m4case,
  other_m4case,
};
