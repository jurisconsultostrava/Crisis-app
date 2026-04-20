import { Router } from "express";
import {
  listAccounts,
  getAccount,
  addTask,
  taskExists,
} from "../lib/store.js";
import { fetchRecentEmails } from "../lib/imap.js";
import { analyzeEmail } from "../lib/ai.js";
import { logger } from "../lib/logger.js";

const router = Router();

// POST /api/sync — synchronizace e-mailů
router.post("/sync", async (req, res) => {
  const { accountId } = req.body ?? {};

  const accounts = accountId
    ? (() => {
        const acc = getAccount(accountId);
        return acc ? [acc] : [];
      })()
    : listAccounts();

  if (accounts.length === 0) {
    res.status(400).json({
      error: "Žádné účty",
      message: accountId
        ? "Zadaný účet neexistuje"
        : "Nejsou nakonfigurovány žádné e-mailové účty",
    });
    return;
  }

  let synced = 0;
  const errors: string[] = [];

  for (const account of accounts) {
    try {
      req.log.info({ account: account.email }, "Zahajuji IMAP sync");
      const emails = await fetchRecentEmails(account, 15);

      for (const email of emails) {
        if (taskExists(email.messageId, account.id)) {
          continue;
        }

        const analysis = await analyzeEmail(
          email.subject,
          email.from,
          email.textBody
        );

        addTask({
          accountId: account.id,
          accountEmail: account.email,
          subject: email.subject,
          from: email.from,
          date: email.date,
          priority: analysis.priority,
          category: analysis.category,
          summary: analysis.summary,
          draftReply: analysis.draft_reply,
          messageId: email.messageId,
        });

        synced++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error({ err, account: account.email }, "Sync selhal");
      errors.push(`${account.email}: ${msg}`);
    }
  }

  res.json({
    synced,
    accounts: accounts.length,
    errors,
  });
});

export default router;
