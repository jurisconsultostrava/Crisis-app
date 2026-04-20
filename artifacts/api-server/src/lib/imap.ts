import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { logger } from "./logger.js";
import type { EmailAccount } from "./store.js";

export interface RawEmail {
  messageId: string;
  subject: string;
  from: string;
  date: string;
  textBody: string;
}

export async function fetchRecentEmails(
  account: EmailAccount,
  limit = 15
): Promise<RawEmail[]> {
  const client = new ImapFlow({
    host: account.imapHost,
    port: account.imapPort,
    secure: account.imapPort === 993,
    auth: {
      user: account.email,
      pass: account.password,
    },
    logger: false,
  });

  const emails: RawEmail[] = [];

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    try {
      const total = client.mailbox?.exists ?? 0;
      if (total === 0) return [];

      const from = Math.max(1, total - limit + 1);
      const to = total;

      for await (const msg of client.fetch(`${from}:${to}`, {
        source: true,
        uid: true,
      })) {
        try {
          const parsed = await simpleParser(msg.source);
          const messageId =
            parsed.messageId ?? `${account.id}-${msg.uid}`;
          const subject = parsed.subject ?? "(bez předmětu)";
          const fromAddr =
            parsed.from?.text ?? "(neznámý odesílatel)";
          const date = parsed.date?.toISOString() ?? new Date().toISOString();

          const text =
            parsed.text ??
            parsed.html?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ??
            "";

          emails.push({
            messageId,
            subject,
            from: fromAddr,
            date,
            textBody: text.slice(0, 3000),
          });
        } catch (err) {
          logger.warn({ err }, "Chyba při parsování e-mailu");
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (err) {
    logger.error({ err, account: account.email }, "Chyba IMAP připojení");
    throw err;
  }

  return emails.reverse();
}
