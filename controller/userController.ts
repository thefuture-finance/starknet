import type { Request, Response } from "express";
import { getUserBalance } from "../services/userService";

export async function getUser(req: Request, res: Response) {
  try {
    const user = req.params.address;
    if (user) {
      const balance = await getUserBalance(user);
      res.status(200).send(user);
    } else {
      res.status(404).send("address not found");
    }
  } catch (error: any) {
    res.status(400).send(error.message);
  }
}
