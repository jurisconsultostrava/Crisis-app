import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");
const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");

export interface EmailAccount {
  id: string;
  label: string;
  email: string;
  password: string;
  imapHost: string;
  imapPort: number;
  createdAt: string;
}

export interface Task {
  id: string;
  accountId: string;
  accountEmail: string;
  subject: string;
  from: string;
  date: string;
  priority: number;
  category: "Finance" | "Klient" | "Dodavatel" | "Operativa";
  summary: string;
  draftReply: string;
  createdAt: string;
  messageId?: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(filePath: string, defaultVal: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw) as T;
    }
  } catch {
  }
  return defaultVal;
}

function writeJson<T>(filePath: string, data: T): void {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function listAccounts(): EmailAccount[] {
  return readJson<EmailAccount[]>(ACCOUNTS_FILE, []);
}

export function getAccount(id: string): EmailAccount | undefined {
  return listAccounts().find((a) => a.id === id);
}

export function addAccount(
  data: Omit<EmailAccount, "id" | "createdAt">
): EmailAccount {
  const accounts = listAccounts();
  const account: EmailAccount = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  accounts.push(account);
  writeJson(ACCOUNTS_FILE, accounts);
  return account;
}

export function removeAccount(id: string): boolean {
  const accounts = listAccounts();
  const idx = accounts.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  accounts.splice(idx, 1);
  writeJson(ACCOUNTS_FILE, accounts);
  return true;
}

export function listTasks(): Task[] {
  const tasks = readJson<Task[]>(TASKS_FILE, []);
  return tasks.sort((a, b) => b.priority - a.priority);
}

export function addTask(data: Omit<Task, "id" | "createdAt">): Task {
  const tasks = readJson<Task[]>(TASKS_FILE, []);
  const task: Task = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  writeJson(TASKS_FILE, tasks);
  return task;
}

export function removeTask(id: string): boolean {
  const tasks = readJson<Task[]>(TASKS_FILE, []);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  writeJson(TASKS_FILE, tasks);
  return true;
}

export function taskExists(messageId: string, accountId: string): boolean {
  const tasks = readJson<Task[]>(TASKS_FILE, []);
  return tasks.some(
    (t) => t.messageId === messageId && t.accountId === accountId
  );
}

export function getStats() {
  const tasks = listTasks();
  const accounts = listAccounts();

  const byCategory: Record<string, number> = {};
  const byPriority: Record<string, number> = {};

  for (const task of tasks) {
    byCategory[task.category] = (byCategory[task.category] || 0) + 1;
    const p = String(task.priority);
    byPriority[p] = (byPriority[p] || 0) + 1;
  }

  return {
    total: tasks.length,
    burning: tasks.filter((t) => t.priority >= 8).length,
    byCategory,
    byPriority,
    accounts: accounts.length,
  };
}
