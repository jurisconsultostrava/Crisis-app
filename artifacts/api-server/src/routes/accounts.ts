import { Router } from "express";
import {
  listAccounts,
  addAccount,
  removeAccount,
  getAccount,
} from "../lib/store.js";
import { CreateAccountBody } from "@workspace/api-zod";

const router = Router();

// GET /api/accounts — výpis účtů (bez hesel)
router.get("/accounts", (req, res) => {
  const accounts = listAccounts().map(({ password: _pw, ...rest }) => rest);
  res.json(accounts);
});

// POST /api/accounts — přidání nového účtu
router.post("/accounts", (req, res) => {
  const parsed = CreateAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Neplatná data", message: parsed.error.message });
    return;
  }

  const { label, email, password, imapHost, imapPort } = parsed.data;

  const account = addAccount({
    label,
    email,
    password,
    imapHost,
    imapPort: imapPort ?? 993,
  });

  const { password: _pw, ...safe } = account;
  res.status(201).json(safe);
});

// DELETE /api/accounts/:id — odstranění účtu
router.delete("/accounts/:id", (req, res) => {
  const { id } = req.params;
  const removed = removeAccount(id);
  if (!removed) {
    res.status(404).json({ error: "Nenalezeno", message: "Účet neexistuje" });
    return;
  }
  res.json({ success: true, message: "Účet odstraněn" });
});

export default router;
