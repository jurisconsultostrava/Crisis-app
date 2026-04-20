import { Router } from "express";
import { listTasks, removeTask, getStats } from "../lib/store.js";

const router = Router();

// GET /api/tasks — výpis úkolů seřazených dle priority
router.get("/tasks", (_req, res) => {
  const tasks = listTasks();
  res.json(tasks);
});

// DELETE /api/tasks/:id — vyřídění úkolu
router.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const removed = removeTask(id);
  if (!removed) {
    res.status(404).json({ error: "Nenalezeno", message: "Úkol neexistuje" });
    return;
  }
  res.json({ success: true, message: "Úkol odstraněn" });
});

// GET /api/stats — statistiky dashboardu
router.get("/stats", (_req, res) => {
  const stats = getStats();
  res.json(stats);
});

export default router;
